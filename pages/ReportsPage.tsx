import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import { Appointment, Client, Service, Staff } from '../types';
import CurrencyDollarIcon from '../components/icons/CurrencyDollarIcon';
import CalendarDaysIcon from '../components/icons/CalendarDaysIcon';
import UserPlusIcon from '../components/icons/UserPlusIcon';
import StarIcon from '../components/icons/StarIcon';

// --- Reusable Components for this page ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-xl shadow-lg flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300">
        <div className="p-3 rounded-lg bg-rose-pink/10 text-rose-pink">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <div>{children}</div>
    </div>
);

const BarChart: React.FC<{ data: { label: string; value: number }[], barColorClass: string, formatValue: (value: number) => string }> = ({ data, barColorClass, formatValue }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (data.length === 0) return <p className="text-center text-gray-500 py-10">No data available.</p>;

    return (
        <div className="w-full h-80 space-y-2 flex flex-col justify-end">
             {data.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center group">
                    <div className="w-28 text-xs text-gray-600 truncate text-right pr-2">{item.label}</div>
                    <div className="flex-1 h-8 bg-gray-100 rounded-r-md relative">
                        <div
                            className={`${barColorClass} h-full rounded-r-md transition-all duration-500 ease-out`}
                            style={{ width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-0 mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 z-10 pointer-events-none">
                            <span className="font-bold">{item.label}:</span> {formatValue(item.value)}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const LineChart: React.FC<{ data: { label: string; value: number }[], lineColorClass: string, formatValue: (value: number) => string }> = ({ data, lineColorClass, formatValue }) => {
    if (data.length < 2) return <p className="text-center text-gray-500 py-10">Not enough data to display a trend.</p>;
    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - (d.value / maxValue) * 100}`).join(' ');

    return (
        <div className="w-full h-80">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <polyline
                    fill="none"
                    className={lineColorClass}
                    strokeWidth="2"
                    points={points}
                />
            </svg>
        </div>
    );
};

const PieChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    if (data.length === 0) {
        return <p className="text-center text-gray-500 py-10">No new clients in this period.</p>;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#E91E63', '#9C27B0', '#4CAF50', '#FFC107', '#2196F3', '#FF5722', '#F44336', '#673AB7'];

    let cumulativePercentage = 0;
    const gradientParts = data.map((item, index) => {
        if (total === 0) return '';
        const percentage = (item.value / total) * 100;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        return `${colors[index % colors.length]} ${start}% ${cumulativePercentage}%`;
    });

    const conicGradient = `conic-gradient(${gradientParts.filter(Boolean).join(', ')})`;

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
            <div 
                className="w-48 h-48 rounded-full flex-shrink-0"
                style={{ background: conicGradient }}
            />
            <ul className="space-y-2">
                {data.map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: colors[index % colors.length] }}></span>
                        <span className="font-semibold">{item.label}:</span>
                        <span className="ml-2">{item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};


// --- Main Reports Page ---

type DateRange = '7d' | '30d' | 'month' | 'all';

const ReportsPage: React.FC = () => {
    const { currentTenant } = useContext(DataContext);
    const [dateRange, setDateRange] = useState<DateRange>('30d');

    const reportData = useMemo(() => {
        if (!currentTenant) return null;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        let startDate = new Date();

        switch (dateRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case 'month':
                startDate = startOfMonth;
                break;
            case 'all':
                startDate = new Date(0); // Epoch
                break;
        }

        const filteredAppointments = currentTenant.appointments.filter(a => new Date(a.startTime) >= startDate && a.status === 'Paid');
        const filteredClients = currentTenant.clients.filter(c => new Date(c.createdAt) >= startDate);

        // KPI Calculations
        // FIX: Corrected the revenue calculation to handle optional payment amounts and ensure correct operator precedence.
        const totalRevenue = filteredAppointments.reduce((sum, a) => sum + Number(a.payment?.amount || 0), 0);
        const ratedAppointments = filteredAppointments.filter(a => a.rating && a.rating > 0);
        const averageRating = ratedAppointments.length > 0
            ? ratedAppointments.reduce((sum, a) => sum + (a.rating || 0), 0) / ratedAppointments.length
            : 0;

        // Chart Data: Popular Services
        // FIX: Correctly count services from appointments that may have multiple services.
        const serviceCounts = filteredAppointments.reduce((acc, app) => {
            app.serviceIds.forEach(serviceId => {
                const service = currentTenant.services.find(s => s.id === serviceId);
                if (service) {
                    acc[service.name] = (acc[service.name] || 0) + 1;
                }
            });
            return acc;
        }, {} as Record<string, number>);

        const popularServices = Object.entries(serviceCounts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        // Chart Data: Staff Performance
        const staffRevenue = filteredAppointments.reduce((acc, app) => {
            const staff = currentTenant.staff.find(s => s.id === app.staffId);
            if (staff) {
                // FIX: Corrected the staff revenue calculation to handle optional payment amounts safely.
                acc[staff.name] = (acc[staff.name] || 0) + Number(app.payment?.amount || 0);
            }
            return acc;
        }, {} as Record<string, number>);

        const staffPerformance = Object.entries(staffRevenue)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        // Chart Data: Revenue Over Time
        const revenueByDay = filteredAppointments.reduce((acc, app) => {
            const day = new Date(app.startTime).toISOString().split('T')[0];
            // FIX: Corrected daily revenue aggregation to safely handle optional payment amounts.
            acc[day] = (acc[day] || 0) + Number(app.payment?.amount || 0);
            return acc;
        }, {} as Record<string, number>);
        
        const revenueTrend = Object.entries(revenueByDay)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

        // Chart Data: Client Acquisition
        const clientSources = filteredClients.reduce((acc, client) => {
            const source = client.acquisitionSource || 'Unknown';
            acc[source] = (acc[source] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const clientAcquisitionData = Object.entries(clientSources)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);
            
        // Chart Data: Service Profitability
        // FIX: Correctly calculate profit for appointments that may contain multiple services.
        const serviceProfits = filteredAppointments.reduce((acc, app) => {
            app.serviceIds.forEach(serviceId => {
                const service = currentTenant.services.find(s => s.id === serviceId);
                if (service) {
                    // FIX: Ensure service price and cost are treated as numbers for correct profit calculation.
                    const profit = Number(service.price) - Number(service.cost);
                    acc[service.name] = (acc[service.name] || 0) + profit;
                }
            });
            return acc;
        }, {} as Record<string, number>);
        
        const serviceProfitability = Object.entries(serviceProfits)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value);

        return {
            totalRevenue,
            totalAppointments: filteredAppointments.length,
            newClients: filteredClients.length,
            averageRating,
            popularServices,
            staffPerformance,
            revenueTrend,
            clientAcquisitionData,
            serviceProfitability,
        };
    }, [currentTenant, dateRange]);

    const dateFilters: { id: DateRange, label: string }[] = [
        { id: '7d', label: 'Last 7 Days' },
        { id: '30d', label: 'Last 30 Days' },
        { id: 'month', label: 'This Month' },
        { id: 'all', label: 'All Time' },
    ];

    if (!reportData) {
        return <div>Loading report data...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Business Reports & Analytics</h1>
                <div className="bg-white p-1 rounded-lg shadow-md flex items-center space-x-1">
                    {dateFilters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setDateRange(filter.id)}
                            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${
                                dateRange === filter.id ? 'bg-rose-pink text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value={`$${reportData.totalRevenue.toFixed(2)}`} icon={<CurrencyDollarIcon className="w-6 h-6" />} />
                <StatCard title="Total Appointments" value={reportData.totalAppointments} icon={<CalendarDaysIcon className="w-6 h-6" />} />
                <StatCard title="New Clients" value={reportData.newClients} icon={<UserPlusIcon className="w-6 h-6" />} />
                <StatCard title="Average Rating" value={reportData.averageRating.toFixed(1)} icon={<StarIcon className="w-6 h-6" />} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Revenue Over Time">
                    <LineChart data={reportData.revenueTrend} lineColorClass="stroke-rose-pink" formatValue={v => `$${v.toFixed(2)}`} />
                </ChartContainer>
                <ChartContainer title="Popular Services (by Bookings)">
                    <BarChart data={reportData.popularServices} barColorClass="bg-lavender-purple" formatValue={v => `${v} bookings`} />
                </ChartContainer>
                <ChartContainer title="Top Staff Performers (by Revenue)">
                    <BarChart data={reportData.staffPerformance} barColorClass="bg-rose-pink" formatValue={v => `$${v.toFixed(2)}`} />
                </ChartContainer>
                <ChartContainer title="Client Acquisition Channels">
                    <PieChart data={reportData.clientAcquisitionData} />
                </ChartContainer>
                 <div className="lg:col-span-2">
                    <ChartContainer title="Service Profitability (Net Profit)">
                        <BarChart data={reportData.serviceProfitability} barColorClass="bg-green-500" formatValue={v => `$${v.toFixed(2)}`} />
                    </ChartContainer>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;