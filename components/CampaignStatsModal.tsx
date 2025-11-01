import React, { useMemo } from 'react';
import Modal from './Modal';
import { MarketingCampaign } from '../types';
import ChartPieIcon from './icons/ChartPieIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import CursorArrowRaysIcon from './icons/CursorArrowRaysIcon';
import EyeIcon from './icons/EyeIcon';

interface CampaignStatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaign: MarketingCampaign | null;
}

interface DailyStat {
    date: string;
    opens: number;
    clicks: number;
    conversions: number;
    revenue: number;
}

// Helper to create a seeded random number generator for consistent mock data
const seededRandom = (seed: number) => {
    let state = seed % 2147483647;
    if (state <= 0) state += 2147483646;
    return () => (state = (state * 16807) % 2147483647) / 2147483647;
};

// Generates plausible mock data for the charts and tables
const generateMockDailyStats = (campaign: MarketingCampaign): DailyStat[] => {
    const random = seededRandom(campaign.id.charCodeAt(2) + campaign.name.length);
    const stats: DailyStat[] = [];
    const days = 14;

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        const opens = Math.floor(random() * (campaign.stats.sent / days * 2));
        const clicks = Math.floor(opens * (random() * 0.6 + 0.2));
        const conversions = Math.floor(clicks * (random() * 0.3 + 0.05));
        const revenue = conversions * (random() * (campaign.stats.revenue / (campaign.stats.conversions || 1) * 1.5));

        stats.push({
            date: date.toISOString().split('T')[0],
            opens,
            clicks,
            conversions,
            revenue: Number(revenue.toFixed(2)),
        });
    }
    return stats;
};

const mockRevenueSources = [
    { label: 'Email Link Click', value: 0.65 },
    { label: 'Direct Booking Post-Email', value: 0.25 },
    { label: 'Social Media Referral', value: 0.10 },
];

const PieChart: React.FC<{ data: { label: string; value: number }[], totalValue: number }> = ({ data, totalValue }) => {
    const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5'];
    let cumulativePercentage = 0;
    const gradientParts = data.map((item, index) => {
        const percentage = item.value * 100;
        const start = cumulativePercentage;
        cumulativePercentage += percentage;
        return `${colors[index % colors.length]} ${start}% ${cumulativePercentage}%`;
    });
    const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40">
                <div className="w-full h-full rounded-full" style={{ background: conicGradient }} />
                <div className="absolute inset-5 bg-gray-50 rounded-full flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">${totalValue.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Total</p>
                    </div>
                </div>
            </div>
            <ul className="space-y-2">
                {data.map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                        <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: colors[index % colors.length] }} />
                        <span className="font-semibold">{item.label}:</span>
                        <span className="ml-2">${(totalValue * item.value).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const BarChart: React.FC<{ data: DailyStat[], dataKey: 'opens' | 'clicks' | 'conversions' }> = ({ data, dataKey }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]), 1);
    const colors = {
        opens: 'bg-blue-400',
        clicks: 'bg-purple-500',
        conversions: 'bg-green-500',
    };

    return (
        <div className="h-48 flex items-end justify-between gap-1">
            {data.map((item, index) => (
                <div key={index} className="flex-1 h-full flex items-end group relative">
                    <div
                        className={`w-full ${colors[dataKey]} rounded-t-md hover:opacity-100 opacity-80 transition-all duration-300`}
                        style={{ height: `${(item[dataKey] / maxValue) * 100}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {item[dataKey]}
                    </div>
                </div>
            ))}
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.FC<{ className?: string }>; iconBg: string }> = ({ title, value, icon: Icon, iconBg }) => (
    <div className="bg-white p-4 rounded-lg border flex items-center gap-4">
        <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-xs text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


const CampaignStatsModal: React.FC<CampaignStatsModalProps> = ({ isOpen, onClose, campaign }) => {
    const dailyStats = useMemo(() => (campaign ? generateMockDailyStats(campaign) : []), [campaign]);

    if (!isOpen || !campaign) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Statistics for "${campaign.name}"`} size="4xl">
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Total Revenue" value={`$${campaign.stats.revenue.toLocaleString()}`} icon={CurrencyDollarIcon} iconBg="bg-green-500" />
                    <StatCard title="Conversions" value={campaign.stats.conversions.toLocaleString()} icon={CheckCircleIcon} iconBg="bg-purple-500" />
                    <StatCard title="Open Rate" value={`${campaign.stats.openRate}%`} icon={EyeIcon} iconBg="bg-blue-500" />
                    <StatCard title="Click Rate" value={`${campaign.stats.clickRate}%`} icon={CursorArrowRaysIcon} iconBg="bg-pink-500" />
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Over Last 14 Days</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-blue-700 mb-1">Opens</p>
                            <BarChart data={dailyStats} dataKey="opens" />
                        </div>
                         <div>
                            <p className="text-sm font-medium text-purple-700 mb-1">Clicks</p>
                            <BarChart data={dailyStats} dataKey="clicks" />
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Sources</h3>
                        <PieChart data={mockRevenueSources} totalValue={campaign.stats.revenue} />
                    </div>
                     <div className="bg-white p-6 rounded-lg border overflow-x-auto">
                         <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Breakdown</h3>
                         <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 sticky top-0 bg-white">
                                    <tr>
                                        <th className="p-2 font-normal">Date</th>
                                        <th className="p-2 font-normal text-right">Opens</th>
                                        <th className="p-2 font-normal text-right">Clicks</th>
                                        <th className="p-2 font-normal text-right">Conv.</th>
                                        <th className="p-2 font-normal text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-800">
                                    {dailyStats.map(stat => (
                                        <tr key={stat.date} className="border-t border-gray-100">
                                            <td className="p-2">{new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                            <td className="p-2 text-right">{stat.opens}</td>
                                            <td className="p-2 text-right">{stat.clicks}</td>
                                            <td className="p-2 text-right">{stat.conversions}</td>
                                            <td className="p-2 text-right font-medium">${stat.revenue.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default CampaignStatsModal;