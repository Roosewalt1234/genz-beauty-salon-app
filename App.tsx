
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantData, ToastMessage, AppNotification, Product } from './types';
import { MOCK_TENANTS } from './constants';
import { api } from './api';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import StaffPage from './pages/StaffPage';
import BookingsPage from './pages/BookingsPage';
import InventoryPage from './pages/InventoryPage';
import ServicesPage from './pages/ServicesPage';
import ReportsPage from './pages/ReportsPage';
import MarketingPage from './pages/MarketingPage';
import AccountingDashboardPage from './pages/AccountingDashboardPage';
import SalesRegisterPage from './pages/SalesRegisterPage';
import ExpenseRegisterPage from './pages/ExpenseRegisterPage';
import AccountsReceivablePage from './pages/AccountsReceivablePage';
import AccountsPayablePage from './pages/AccountsPayablePage';
import PayrollPage from './pages/PayrollPage';
import Toast from './components/Toast';

export const DataContext = React.createContext<{
    tenants: TenantData[];
    currentTenant: TenantData | null;
    setCurrentTenantId: (id: string) => void;
    updateTenantData: (tenantId: string, updatedData: Partial<TenantData>) => void;
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}>({
    tenants: [],
    currentTenant: null,
    setCurrentTenantId: () => {},
    updateTenantData: () => {},
    addToast: () => {},
});

const App: React.FC = () => {
    const [tenantsData, setTenantsData] = useState<TenantData[]>([]);
    const [currentTenantId, setCurrentTenantIdState] = useState<string | null>(null);
    const [currentTenantData, setCurrentTenantData] = useState<TenantData | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const notifSignatureRef = useRef<string>('');
    const lastUpdateSignatureRef = useRef<Map<string, string>>(new Map());

    // Fetch tenants from API on mount
    useEffect(() => {
        const fetchTenants = async () => {
            try {
                const tenants = await api.getTenants();
                if (tenants.length === 0) {
                    // If no tenants in DB, use mock data
                    setTenantsData(MOCK_TENANTS);
                } else {
                    setTenantsData(tenants);
                }
            } catch (error) {
                console.error('Failed to fetch tenants, using mock data:', error);
                setTenantsData(MOCK_TENANTS);
            } finally {
                setLoading(false);
            }
        };
        fetchTenants();
    }, []);

    // Fetch full tenant data when currentTenantId changes
    useEffect(() => {
        const fetchCurrentTenantData = async () => {
            if (!currentTenantId) {
                setCurrentTenantData(null);
                return;
            }
            try {
                const data = await api.getTenant(currentTenantId);
                setCurrentTenantData(data);
            } catch (error) {
                console.error('Failed to fetch tenant data:', error);
                // Fallback to basic tenant data
                const basicTenant = tenantsData.find(t => t.id === currentTenantId);
                setCurrentTenantData(basicTenant || null);
            }
        };
        fetchCurrentTenantData();
    }, [currentTenantId]); // Removed tenantsData to prevent infinite loop

    const setCurrentTenantId = useCallback((id: string) => {
        setCurrentTenantIdState(id);
    }, []);

    const updateTenantData = useCallback(async (tenantId: string, updatedData: Partial<TenantData>) => {
        const signature = JSON.stringify(updatedData);
        const lastSignature = lastUpdateSignatureRef.current.get(tenantId);

        // Skip if this exact payload was just sent to avoid tight PUT loops
        if (lastSignature === signature) {
            return;
        }
        lastUpdateSignatureRef.current.set(tenantId, signature);

        try {
            await api.updateTenant(tenantId, updatedData);
        } catch (error) {
            console.error('Failed to update tenant:', error);
        } finally {
            // Always update local cache so UI stays in sync even if the PUT fails
            setTenantsData(prev => prev.map(tenant =>
                tenant.id === tenantId ? { ...tenant, ...updatedData } : tenant
            ));
            setCurrentTenantData(prev => prev ? { ...prev, ...updatedData } : null);
        }
    }, []);
    
    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = new Date().getTime();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    const currentTenant = currentTenantData;
    
    // --- DECLARATIVE NOTIFICATION GENERATION ---
    useEffect(() => {
        if (!currentTenant) return;

        const activeNotifications: AppNotification[] = [];
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        // Generate notifications based on the current inventory state
        if (currentTenant.inventory && Array.isArray(currentTenant.inventory)) {
            currentTenant.inventory.forEach((product: Product) => {
            // Low stock alert
            if (product.stock <= product.reorderLevel) {
                activeNotifications.push({
                    id: `low-stock-${product.id}`,
                    type: 'low_stock',
                    message: `${product.name} is low on stock (${product.stock} left).`,
                    relatedId: product.id,
                    createdAt: now.toISOString(),
                    isRead: false,
                });
            }
            
            // Expiring soon alert
            if (product.expiryDate) {
                const expiryDate = new Date(product.expiryDate);
                if (expiryDate > now && expiryDate <= thirtyDaysFromNow) {
                    activeNotifications.push({
                        id: `expiring-soon-${product.id}`,
                        type: 'expiring_soon',
                        message: `${product.name} will expire on ${expiryDate.toLocaleDateString()}.`,
                        relatedId: product.id,
                        createdAt: now.toISOString(),
                        isRead: false,
                    });
                }
            }
            });
        }

        // Preserve read status and creation date from existing notifications
        const existingNotificationsById = new Map((currentTenant.notifications || []).map(n => [n.id, n]));
        
        const finalNotifications = activeNotifications.map(newNotification => {
            const existing = existingNotificationsById.get(newNotification.id);
            if (existing) {
                // Preserve original creation date and read status, but update the message
                return {
                    ...newNotification,
                    // FIX: Cast `existing` to AppNotification to access its properties.
                    createdAt: (existing as AppNotification).createdAt,
                    isRead: (existing as AppNotification).isRead,
                };
            }
            return newNotification; // This is a new alert
        });

        // Compare with current notifications to prevent infinite render loops
        const currentNotifString = JSON.stringify((currentTenant.notifications || []).map(n => ({id: n.id, message: n.message})).sort((a,b) => a.id.localeCompare(b.id)));
        const finalNotifString = JSON.stringify(finalNotifications.map(n => ({id: n.id, message: n.message})).sort((a,b) => a.id.localeCompare(b.id)));

        // Prevent repeated PUTs: if the computed notifications haven't changed, stop here.
        if (finalNotifString === notifSignatureRef.current || currentNotifString === finalNotifString) {
            return;
        }

        // Cache the signature so subsequent renders skip the update.
        notifSignatureRef.current = finalNotifString;

        // Update local state without hitting the tenant PUT endpoint.
        setTenantsData(prev => prev.map(tenant =>
            tenant.id === currentTenant.id ? { ...tenant, notifications: finalNotifications } : tenant
        ));
        setCurrentTenantData(prev => prev ? { ...prev, notifications: finalNotifications } : null);

    }, [currentTenant]);


    const contextValue = useMemo(() => ({
        tenants: tenantsData,
        currentTenant,
        setCurrentTenantId,
        updateTenantData,
        addToast,
    }), [tenantsData, currentTenant, setCurrentTenantId, updateTenantData, addToast]);
    

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-pink mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <DataContext.Provider value={contextValue}>
            <HashRouter>
                <div className="min-h-screen font-sans">
                    <Routes>
                        <Route path="/" element={!currentTenantId ? <LandingPage /> : <Navigate to="/dashboard" />} />
                        <Route path="/signin" element={!currentTenantId ? <SignInPage /> : <Navigate to="/dashboard" />} />
                        <Route 
                            path="/dashboard" 
                            element={currentTenantId ? <DashboardLayout /> : <Navigate to="/" />}
                        >
                            <Route index element={<DashboardPage />} />
                            <Route path="clients" element={<ClientsPage />} />
                            <Route path="staff" element={<StaffPage />} />
                            <Route path="bookings" element={<BookingsPage />} />
                            <Route path="inventory" element={<InventoryPage />} />
                            <Route path="marketing" element={<MarketingPage />} />
                            <Route path="services" element={<ServicesPage />} />
                            <Route path="reports" element={<ReportsPage />} />
                            <Route path="accounting" element={<AccountingDashboardPage />} />
                            <Route path="accounting/sales" element={<SalesRegisterPage />} />
                            <Route path="accounting/expenses" element={<ExpenseRegisterPage />} />
                            <Route path="accounting/receivables" element={<AccountsReceivablePage />} />
                            <Route path="accounting/payables" element={<AccountsPayablePage />} />
                            <Route path="accounting/payroll" element={<PayrollPage />} />
                        </Route>
                    </Routes>
                </div>
            </HashRouter>
            <div className="fixed top-5 right-5 z-[100]">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} />
                ))}
            </div>
        </DataContext.Provider>
    );
};

export default App;
