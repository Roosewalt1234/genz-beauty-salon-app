import React from 'react';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { DataContext } from '../App';

// --- ICONS ---
import UserGroupIcon from '../components/icons/UserGroupIcon';
import UserIcon from '../components/icons/UserIcon';
import CurrencyDollarIcon from '../components/icons/CurrencyDollarIcon';
import CalendarDaysIcon from '../components/icons/CalendarDaysIcon';
import PlusIcon from '../components/icons/PlusIcon';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import StarIcon from '../components/icons/StarIcon';
import CalendarIcon from '../components/icons/CalendarIcon';


// --- SUB-COMPONENTS FOR DASHBOARD SECTIONS ---

const DashboardHeader: React.FC<{ tenantName: string; todaysAppointmentsCount: number }> = ({ tenantName, todaysAppointmentsCount }) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Manually set date to match screenshot
    const displayDate = `Saturday, September 20th, 2025`;

    return (
        <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white p-6 rounded-xl shadow-lg flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold" style={{fontFamily: "'Playfair Display', serif"}}>Welcome to {tenantName}</h1>
                <p className="text-white/80">{displayDate}</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-medium">Today's Appointments</p>
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mt-1">
                    <span className="text-3xl font-bold">{todaysAppointmentsCount}</span>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; percentageChange: string; icon: React.FC<{ className?: string }>; iconBgColor: string }> = ({ title, value, percentageChange, icon: Icon, iconBgColor }) => {
    const percentageColor = percentageChange.startsWith('+') ? 'text-green-600' : 'text-red-600';
    return (
        <div className="bg-white p-5 rounded-xl shadow-lg flex justify-between items-center hover:shadow-xl transition-shadow duration-300">
            <div>
                <p className="text-gray-500 text-sm font-medium">{title}</p>
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <p className={`text-xs font-semibold ${percentageColor}`}>{percentageChange}</p>
            </div>
            <div className={`p-3 rounded-lg ${iconBgColor}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
        </div>
    );
};

const UpcomingAppointments: React.FC = () => {
    const { currentTenant } = useContext(DataContext);
    const upcoming = currentTenant?.appointments
        .filter(a => new Date(a.startTime) > new Date())
        .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
                <Link to="/dashboard/bookings" className="text-sm font-medium text-rose-pink hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
                {upcoming.length > 0 ? (
                    upcoming.slice(0, 3).map(app => {
                        const client = currentTenant.clients.find(c => c.id === app.clientId);
                        const staff = currentTenant.staff.find(s => s.id === app.staffId);
                        return (
                             <div key={app.id} className="p-3 bg-light-pink/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-rose-pink">{client?.name}</p>
                                    <p className="text-sm text-gray-600">with {staff?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-700">{new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="text-sm text-gray-500">{new Date(app.startTime).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                        <p>No upcoming appointments</p>
                    </div>
                )}
            </div>
        </div>
    )
}

const QuickActions: React.FC = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="space-y-3">
            <Link to="/dashboard/bookings" className="flex items-center w-full text-left p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors duration-200">
                <PlusIcon className="h-5 w-5 mr-3 text-pink-500" />
                <span className="font-semibold text-pink-800">New Appointment</span>
            </Link>
             <Link to="/dashboard/clients" className="flex items-center w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
                <UserPlusIcon className="h-5 w-5 mr-3 text-purple-500" />
                <span className="font-semibold text-purple-800">Add Client</span>
            </Link>
             <Link to="/dashboard/staff" className="flex items-center w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                <UserPlusIcon className="h-5 w-5 mr-3 text-green-500" />
                <span className="font-semibold text-green-800">Add Staff</span>
            </Link>
        </div>
    </div>
);

const TopPerformers: React.FC = () => {
    const { currentTenant } = useContext(DataContext);
    const performers = currentTenant?.staff
        .filter(s => s.isActive && s.rating)
        .sort((a,b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 2) || [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Performers</h2>
            <div className="space-y-4">
                {performers.map(staff => (
                    <div key={staff.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <img src={staff.profileImageUrl} alt={staff.name} className="h-10 w-10 rounded-full mr-3 object-cover" />
                            <div>
                                <p className="font-semibold text-gray-700">{staff.name}</p>
                                <p className="text-xs text-gray-500">{staff.role}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="font-bold text-sm text-gray-600">{staff.rating?.toFixed(1)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

const RecentAppointmentsTable: React.FC = () => {
    const { currentTenant } = useContext(DataContext);
    const recent = currentTenant?.appointments
        .filter(a => ['Completed', 'Paid'].includes(a.status))
        .sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        .slice(0, 5) || [];

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Completed Appointments</h2>
                <Link to="/dashboard/bookings" className="text-sm font-medium text-rose-pink hover:underline flex items-center">
                    View All <span className="ml-1">&rarr;</span>
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-gray-500">
                        <tr>
                            <th className="p-2 font-normal">Client</th>
                            <th className="p-2 font-normal">Service</th>
                            <th className="p-2 font-normal">Staff</th>
                            <th className="p-2 font-normal">Amount</th>
                            <th className="p-2 font-normal">Rating</th>
                            <th className="p-2 font-normal">Date</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800">
                         {recent.map(app => {
                            if (!currentTenant) return null;
                            const client = currentTenant.clients.find(c => c.id === app.clientId);
                            const staff = currentTenant.staff.find(s => s.id === app.staffId);
                            const services = app.serviceIds.map(id => currentTenant.services.find(s => s.id === id)?.name).filter(Boolean);
                            return (
                                <tr key={app.id} className="border-t border-gray-100">
                                    <td className="p-3 font-semibold">{client?.name || 'Unknown Client'}</td>
                                    <td className="p-3">{services.join(', ') || 'Unknown Service'}</td>
                                    <td className="p-3">{staff?.name || 'Unknown Staff'}</td>
                                    <td className="p-3">${app.payment?.amount.toFixed(2)}</td>
                                    <td className="p-3">
                                        {app.rating && (
                                            <div className="flex items-center">
                                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                                <span className="font-semibold">{app.rating}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-3">{new Date(app.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</td>
                                </tr>
                            )
                         })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


const DashboardPage: React.FC = () => {
    const { currentTenant } = useContext(DataContext);

    if (!currentTenant) {
        return <div>Loading tenant data...</div>;
    }

    // Calculations for stat cards
    const totalClients = currentTenant.clients.length;
    const activeStaff = currentTenant.staff.filter(s => s.isActive).length;

    const today = new Date();
    today.setHours(0,0,0,0);
    
    const appointmentsToday = currentTenant.appointments.filter(a => {
        const appDate = new Date(a.startTime);
        appDate.setHours(0,0,0,0);
        return appDate.getTime() === today.getTime();
    }).length;
    
    const thisMonthRevenue = currentTenant.appointments
        .filter(a => a.status === 'Paid' && new Date(a.startTime).getMonth() === new Date().getMonth())
        .reduce((sum, a) => sum + (a.payment?.amount || 0), 0);

    return (
        <div className="space-y-6">
            <DashboardHeader tenantName={currentTenant.name} todaysAppointmentsCount={appointmentsToday} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Clients" value={totalClients} percentageChange="+12% this month" icon={UserGroupIcon} iconBgColor="bg-pink-500" />
                <StatCard title="Active Staff" value={activeStaff} percentageChange="" icon={UserIcon} iconBgColor="bg-purple-500" />
                <StatCard title="This Month Revenue" value={`$${thisMonthRevenue}`} percentageChange="+8% vs last month" icon={CurrencyDollarIcon} iconBgColor="bg-green-500" />
                <StatCard title="Appointments Today" value={appointmentsToday} percentageChange="" icon={CalendarDaysIcon} iconBgColor="bg-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <UpcomingAppointments />
                </div>
                <div className="space-y-6">
                    <QuickActions />
                    <TopPerformers />
                </div>
            </div>

            <RecentAppointmentsTable />
        </div>
    );
};

export default DashboardPage;
