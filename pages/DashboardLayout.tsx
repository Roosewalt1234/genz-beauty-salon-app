import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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

    const handleLogout = () => {
        setCurrentTenantId('');
        navigate('/');
    };

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
        { to: '/dashboard/bookings', label: 'Appointments', icon: CalendarIcon },
        { to: '/dashboard/clients', label: 'Clients', icon: UsersIcon },
        { to: '/dashboard/staff', label: 'Staff', icon: BriefcaseIcon },
        { to: '/dashboard/inventory', label: 'Inventory', icon: ArchiveBoxIcon },
        { to: '/dashboard/marketing', label: 'Marketing', icon: MarketingIcon },
        { to: '/dashboard/services', label: 'Services', icon: TagIcon },
        { to: '/dashboard/reports', label: 'Reports', icon: ChartBarIcon },
    ];

    const activeLinkClass = "bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-md";
    const inactiveLinkClass = "text-gray-600 hover:bg-light-pink hover:text-rose-pink";
    
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white shadow-lg flex flex-col">
                <div className="h-20 flex items-center justify-center border-b">
                    <h1 className="text-2xl font-bold text-rose-pink" style={{fontFamily: "'Playfair Display', serif"}}>Glamoir</h1>
                </div>
                <nav className="flex-grow px-4 py-4">
                    {navItems.map(item => (
                        <NavLink 
                            key={item.to} 
                            to={item.to} 
                            end={item.to === '/dashboard'}
                            className={({ isActive }) => `${isActive ? activeLinkClass : inactiveLinkClass} flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 mb-2`}
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </NavLink>
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
                    <div>
                        <NotificationsDropdown />
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;