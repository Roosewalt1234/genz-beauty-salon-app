import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { DataContext } from '../App';
import HomeIcon from '../components/icons/HomeIcon';
import UsersIcon from '../components/icons/UsersIcon';
import BriefcaseIcon from '../components/icons/BriefcaseIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import ArchiveBoxIcon from '../components/icons/ArchiveBoxIcon';
import TagIcon from '../components/icons/TagIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import MarketingIcon from '../components/icons/MarketingIcon';
import BellIcon from '../components/icons/BellIcon';
import CompanyDetailsModal from '../components/CompanyDetailsModal';
import AccessPermissionModal from '../components/AccessPermissionModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import NewUserModal from '../components/NewUserModal';
import CreateTenantModal from '../components/CreateTenantModal';
import AccountingDashboardModal from '../components/AccountingDashboardModal';
import SalesRegisterModal from '../components/SalesRegisterModal';
import ExpenseRegisterModal from '../components/ExpenseRegisterModal';
import AccountsReceivableModal from '../components/AccountsReceivableModal';
import AccountsPayableModal from '../components/AccountsPayableModal';
import PayrollModal from '../components/PayrollModal';
import AddSaleModal from '../components/AddSaleModal';
import AddExpenseModal from '../components/AddExpenseModal';
import AddReceivableModal from '../components/AddReceivableModal';
import AddPayableModal from '../components/AddPayableModal';
import { AppNotification } from '../types';

const NotificationsDropdown: React.FC = () => {
    const { currentTenant, updateTenantData } = useContext(DataContext);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const notifications = currentTenant?.notifications || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = (notificationId: string) => {
        if (!currentTenant) return;
        const updatedNotifications = notifications.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
        );
        updateTenantData(currentTenant.id, { notifications: updatedNotifications });
    };

    const getIconForType = (type: AppNotification['type']) => {
        switch (type) {
            case 'low_stock': return <ArchiveBoxIcon className="w-5 h-5 text-yellow-500" />;
            case 'expiring_soon': return <CalendarIcon className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={handleToggle} className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-rose-pink text-white text-xs flex items-center justify-center font-bold" style={{ fontSize: '10px', lineHeight: '1' }}>
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-20 border">
                    <div className="p-3 font-semibold text-gray-800 border-b">Notifications</div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div key={n.id} className={`p-3 flex items-start gap-3 hover:bg-gray-50 ${!n.isRead ? 'bg-light-pink/50' : ''}`}>
                                    <div className="flex-shrink-0 mt-1">{getIconForType(n.type)}</div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-700">{n.message}</p>
                                        <p className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                                    </div>
                                    {!n.isRead && (
                                        <button onClick={() => handleMarkAsRead(n.id)} className="flex-shrink-0 mt-1 w-2 h-2 bg-blue-500 rounded-full" title="Mark as read"></button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-6">No notifications</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


const DashboardLayout: React.FC = () => {
    const { currentTenant, setCurrentTenantId } = useContext(DataContext);
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCompanyDetailsModalOpen, setIsCompanyDetailsModalOpen] = useState(false);
    const [isAccessPermissionModalOpen, setIsAccessPermissionModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
    const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
    const [isCreateTenantModalOpen, setIsCreateTenantModalOpen] = useState(false);
    const [isAccountingOpen, setIsAccountingOpen] = useState(false);
    const [isAccountingDashboardModalOpen, setIsAccountingDashboardModalOpen] = useState(false);
    const [isSalesRegisterModalOpen, setIsSalesRegisterModalOpen] = useState(false);
    const [isExpenseRegisterModalOpen, setIsExpenseRegisterModalOpen] = useState(false);
    const [isAccountsReceivableModalOpen, setIsAccountsReceivableModalOpen] = useState(false);
    const [isAccountsPayableModalOpen, setIsAccountsPayableModalOpen] = useState(false);
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
    const [isAddSaleModalOpen, setIsAddSaleModalOpen] = useState(false);
    const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
    const [isAddReceivableModalOpen, setIsAddReceivableModalOpen] = useState(false);
    const [isAddPayableModalOpen, setIsAddPayableModalOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Add event listeners for opening add modals
    useEffect(() => {
      const handleOpenAddSaleModal = () => setIsAddSaleModalOpen(true);
      const handleOpenAddExpenseModal = () => setIsAddExpenseModalOpen(true);
      const handleOpenAddReceivableModal = () => setIsAddReceivableModalOpen(true);
      const handleOpenAddPayableModal = () => setIsAddPayableModalOpen(true);

      window.addEventListener('openAddSaleModal', handleOpenAddSaleModal);
      window.addEventListener('openAddExpenseModal', handleOpenAddExpenseModal);
      window.addEventListener('openAddReceivableModal', handleOpenAddReceivableModal);
      window.addEventListener('openAddPayableModal', handleOpenAddPayableModal);

      return () => {
        window.removeEventListener('openAddSaleModal', handleOpenAddSaleModal);
        window.removeEventListener('openAddExpenseModal', handleOpenAddExpenseModal);
        window.removeEventListener('openAddReceivableModal', handleOpenAddReceivableModal);
        window.removeEventListener('openAddPayableModal', handleOpenAddPayableModal);
      };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setCurrentTenantId('');
        navigate('/');
    };

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
        // Close other dropdowns
        setIsAccountingOpen(false);
    };

    const toggleAccounting = () => {
        setIsAccountingOpen(!isAccountingOpen);
        // Close other dropdowns
        setIsSettingsOpen(false);
    };
    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
        { to: '/dashboard/bookings', label: 'Appointments', icon: CalendarIcon },
        { to: '/dashboard/clients', label: 'Clients', icon: UsersIcon },
        { to: '/dashboard/staff', label: 'Staff', icon: BriefcaseIcon },
        { to: '/dashboard/accounting', label: 'Accounting', icon: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ) },
        { to: '/dashboard/inventory', label: 'Inventory', icon: ArchiveBoxIcon },
        { to: '/dashboard/marketing', label: 'Marketing', icon: MarketingIcon },
        { to: '/dashboard/services', label: 'Services', icon: TagIcon },
        { to: '/dashboard/reports', label: 'Reports', icon: ChartBarIcon },
        { to: '/dashboard/settings', label: 'Settings', icon: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ) },
    ];

    const activeLinkClass = "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-md";
    const inactiveLinkClass = "text-gray-600 hover:bg-light-pink hover:text-rose-pink";

    const handleAccountingItemClick = (itemName: string) => {
        // Handle accounting submenu clicks
        switch (itemName) {
            case 'Dashboard':
                setIsAccountingDashboardModalOpen(true);
                break;
            case 'Sales Register':
                setIsSalesRegisterModalOpen(true);
                break;
            case 'Expense Register':
                setIsExpenseRegisterModalOpen(true);
                break;
            case 'Accounts Receivable':
                setIsAccountsReceivableModalOpen(true);
                break;
            case 'Accounts Payable':
                setIsAccountsPayableModalOpen(true);
                break;
            case 'Payroll':
                setIsPayrollModalOpen(true);
                break;
            default:
                console.log('Accounting item clicked:', itemName);
        }
    };
    
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col">
                <div className="h-20 flex items-center justify-center border-b">
                    <div className="flex items-center gap-3">
                        <img src="https://sopkcpmuhwktnrkbgabx.supabase.co/storage/v1/object/sign/Logo/GenZ%20salon%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80MDY0MDM1OC1mYWIwLTRlN2MtYmExNy0yYTZjZDc1N2UwNTAiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJMb2dvL0dlblogc2Fsb24gbG9nby5wbmciLCJpYXQiOjE3NjIwMDg3OTIsImV4cCI6MTg0ODQwODc5Mn0._eh1bvBGE3w5fAnZxsNAEAgJWIZbLo8PnjHEAESmwF0" alt="GenZ Salon Logo" className="w-10 h-10 rounded-full" />
                        <h1 className="text-2xl font-bold text-rose-pink" style={{fontFamily: "'Playfair Display', serif"}}>GenZ Salon</h1>
                    </div>
                </div>
                <nav className="flex-grow px-4 py-4">
                    {navItems.map(item => (
                        <div key={item.to} ref={item.to === '/dashboard/settings' ? settingsRef : null}>
                            {item.to === '/dashboard/settings' ? (
                                <div>
                                    <button
                                        onClick={toggleSettings}
                                        className={`${inactiveLinkClass} flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 mb-2 w-full`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="h-5 w-5 mr-3" />
                                            {item.label}
                                        </div>
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isSettingsOpen && (
                                        <div className="ml-8 mt-1 space-y-1">
                                            <button
                                                onClick={() => setIsCompanyDetailsModalOpen(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-lg transition-colors duration-200"
                                            >
                                                Company Details
                                            </button>
                                            <button
                                                onClick={() => setIsAccessPermissionModalOpen(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-lg transition-colors duration-200"
                                            >
                                                Access Permission
                                            </button>
                                            <button
                                                onClick={() => setIsChangePasswordModalOpen(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-lg transition-colors duration-200"
                                            >
                                                Change Password
                                            </button>
                                            <button
                                                onClick={() => setIsNewUserModalOpen(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-lg transition-colors duration-200"
                                            >
                                                Add New User
                                            </button>
                                            <button
                                                onClick={() => setIsCreateTenantModalOpen(true)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-lg transition-colors duration-200"
                                            >
                                                Create Tenant
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : item.to === '/dashboard/accounting' ? (
                                <div>
                                    <button
                                        onClick={toggleAccounting}
                                        className={`${inactiveLinkClass} flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 mb-2 w-full`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="h-5 w-5 mr-3" />
                                            {item.label}
                                        </div>
                                        <svg className={`w-4 h-4 transition-transform duration-200 ${isAccountingOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {isAccountingOpen && (
                                        <div className="ml-8 mt-1 space-y-1 bg-gray-50 rounded-lg p-2">
                                            <Link
                                                to="/dashboard/accounting"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-md transition-colors duration-200"
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/dashboard/accounting/sales"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-md transition-colors duration-200"
                                            >
                                                Sales Register
                                            </Link>
                                            <Link
                                                to="/dashboard/accounting/expenses"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-md transition-colors duration-200"
                                            >
                                                Expense Register
                                            </Link>
                                            <Link
                                                to="/dashboard/accounting/receivables"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-md transition-colors duration-200"
                                            >
                                                Accounts Receivable
                                            </Link>
                                            <Link
                                                to="/dashboard/accounting/payables"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-md transition-colors duration-200"
                                            >
                                                Accounts Payable
                                            </Link>
                                            <Link
                                                to="/dashboard/accounting/payroll"
                                                className="block px-3 py-2 text-sm text-gray-600 hover:bg-light-pink hover:text-rose-pink rounded-md transition-colors duration-200"
                                            >
                                                Payroll
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink
                                    to={item.to}
                                    end={item.to === '/dashboard'}
                                    className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 mb-2`}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.label}
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-light-pink hover:text-rose-pink transition-colors duration-200">
                        <LogoutIcon className="h-6 w-6 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white shadow-md flex items-center justify-between px-8">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        {currentTenant?.name}
                    </h2>
                    <div className="flex items-center gap-4">
                        <NotificationsDropdown />
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            <LogoutIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-8">
                    <Outlet />
                </main>
            </div>

            {isCompanyDetailsModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCompanyDetailsModalOpen(false)}></div>
                    <CompanyDetailsModal
                        isOpen={isCompanyDetailsModalOpen}
                        onClose={() => setIsCompanyDetailsModalOpen(false)}
                    />
                </div>
            )}

            {isAccessPermissionModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAccessPermissionModalOpen(false)}></div>
                    <AccessPermissionModal
                        isOpen={isAccessPermissionModalOpen}
                        onClose={() => setIsAccessPermissionModalOpen(false)}
                    />
                </div>
            )}

            {isChangePasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsChangePasswordModalOpen(false)}></div>
                    <ChangePasswordModal
                        isOpen={isChangePasswordModalOpen}
                        onClose={() => setIsChangePasswordModalOpen(false)}
                    />
                </div>
            )}

            {isNewUserModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsNewUserModalOpen(false)}></div>
                    <NewUserModal
                        isOpen={isNewUserModalOpen}
                        onClose={() => setIsNewUserModalOpen(false)}
                    />
                </div>
            )}

            {isCreateTenantModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsCreateTenantModalOpen(false)}></div>
                    <CreateTenantModal
                        isOpen={isCreateTenantModalOpen}
                        onClose={() => setIsCreateTenantModalOpen(false)}
                    />
                </div>
            )}

            {isAccountingDashboardModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAccountingDashboardModalOpen(false)}></div>
                    <AccountingDashboardModal
                        isOpen={isAccountingDashboardModalOpen}
                        onClose={() => setIsAccountingDashboardModalOpen(false)}
                    />
                </div>
            )}

            {isSalesRegisterModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSalesRegisterModalOpen(false)}></div>
                    <SalesRegisterModal
                        isOpen={isSalesRegisterModalOpen}
                        onClose={() => setIsSalesRegisterModalOpen(false)}
                    />
                </div>
            )}

            {isExpenseRegisterModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsExpenseRegisterModalOpen(false)}></div>
                    <ExpenseRegisterModal
                        isOpen={isExpenseRegisterModalOpen}
                        onClose={() => setIsExpenseRegisterModalOpen(false)}
                    />
                </div>
            )}

            {isAccountsReceivableModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAccountsReceivableModalOpen(false)}></div>
                    <AccountsReceivableModal
                        isOpen={isAccountsReceivableModalOpen}
                        onClose={() => setIsAccountsReceivableModalOpen(false)}
                    />
                </div>
            )}

            {isAccountsPayableModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAccountsPayableModalOpen(false)}></div>
                    <AccountsPayableModal
                        isOpen={isAccountsPayableModalOpen}
                        onClose={() => setIsAccountsPayableModalOpen(false)}
                    />
                </div>
            )}

            {isPayrollModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsPayrollModalOpen(false)}></div>
                    <PayrollModal
                        isOpen={isPayrollModalOpen}
                        onClose={() => setIsPayrollModalOpen(false)}
                    />
                </div>
            )}

            {isAddSaleModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAddSaleModalOpen(false)}></div>
                    <AddSaleModal
                        isOpen={isAddSaleModalOpen}
                        onClose={() => setIsAddSaleModalOpen(false)}
                    />
                </div>
            )}

            {isAddExpenseModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAddExpenseModalOpen(false)}></div>
                    <AddExpenseModal
                        isOpen={isAddExpenseModalOpen}
                        onClose={() => setIsAddExpenseModalOpen(false)}
                    />
                </div>
            )}

            {isAddReceivableModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAddReceivableModalOpen(false)}></div>
                    <AddReceivableModal
                        isOpen={isAddReceivableModalOpen}
                        onClose={() => setIsAddReceivableModalOpen(false)}
                    />
                </div>
            )}

            {isAddPayableModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsAddPayableModalOpen(false)}></div>
                    <AddPayableModal
                        isOpen={isAddPayableModalOpen}
                        onClose={() => setIsAddPayableModalOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;