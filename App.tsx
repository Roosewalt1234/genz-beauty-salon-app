
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TenantData, ToastMessage, AppNotification, Product } from './types';
import { MOCK_TENANTS } from './constants';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import StaffPage from './pages/StaffPage';
import BookingsPage from './pages/BookingsPage';
import InventoryPage from './pages/InventoryPage';
import ServicesPage from './pages/ServicesPage';
import ReportsPage from './pages/ReportsPage';
import MarketingPage from './pages/MarketingPage';
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
    const [tenantsData, setTenantsData] = useState<TenantData[]>(MOCK_TENANTS);
    const [currentTenantId, setCurrentTenantIdState] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const setCurrentTenantId = useCallback((id: string) => {
        setCurrentTenantIdState(id);
    }, []);

    const updateTenantData = useCallback((tenantId: string, updatedData: Partial<TenantData>) => {
        setTenantsData(prev => prev.map(tenant => 
            tenant.id === tenantId ? { ...tenant, ...updatedData } : tenant
        ));
    }, []);
    
    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = new Date().getTime();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 3000);
    };

    const currentTenant = useMemo(() => tenantsData.find(t => t.id === currentTenantId) || null, [tenantsData, currentTenantId]);
    
    // --- DECLARATIVE NOTIFICATION GENERATION ---
    useEffect(() => {
        if (!currentTenant) return;

        const activeNotifications: AppNotification[] = [];
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        // Generate notifications based on the current inventory state
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

        // Preserve read status and creation date from existing notifications
        const existingNotificationsById = new Map(currentTenant.notifications.map(n => [n.id, n]));
        
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
        const currentNotifString = JSON.stringify(currentTenant.notifications.map(n => ({id: n.id, message: n.message})).sort((a,b) => a.id.localeCompare(b.id)));
        const finalNotifString = JSON.stringify(finalNotifications.map(n => ({id: n.id, message: n.message})).sort((a,b) => a.id.localeCompare(b.id)));
        
        if (currentNotifString !== finalNotifString) {
             updateTenantData(currentTenant.id, { notifications: finalNotifications });
        }

    }, [currentTenant, updateTenantData]);


    const contextValue = useMemo(() => ({
        tenants: tenantsData,
        currentTenant,
        setCurrentTenantId,
        updateTenantData,
        addToast,
    }), [tenantsData, currentTenant, setCurrentTenantId, updateTenantData, addToast]);
    

    return (
        <DataContext.Provider value={contextValue}>
            <HashRouter>
                <div className="min-h-screen font-sans">
                    <Routes>
                        <Route path="/" element={!currentTenantId ? <LandingPage /> : <Navigate to="/dashboard" />} />
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
