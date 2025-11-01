import React, { useContext, useMemo, useState } from 'react';
import { DataContext } from '../App';
import { MarketingCampaign } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import TargetIcon from '../components/icons/TargetIcon';
import PlayIcon from '../components/icons/PlayIcon';
import PaperAirplaneIcon from '../components/icons/PaperAirplaneIcon';
import PresentationChartBarIcon from '../components/icons/PresentationChartBarIcon';
import ChartBarSquareIcon from '../components/icons/ChartBarSquareIcon';
import FilterIcon from '../components/icons/FilterIcon';
import EnvelopeIcon from '../components/icons/EnvelopeIcon';
import ChatBubbleLeftIcon from '../components/icons/ChatBubbleLeftIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import PauseIcon from '../components/icons/PauseIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import DocumentDuplicateIcon from '../components/icons/DocumentDuplicateIcon';
import CampaignFormModal from '../components/CampaignFormModal';
import CampaignStatsModal from '../components/CampaignStatsModal';


const StatCard: React.FC<{ title: string; value: string; icon: React.FC<{ className?: string }>; iconBg: string }> = ({ title, value, icon: Icon, iconBg }) => {
    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${iconBg}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const CampaignCard: React.FC<{ 
    campaign: MarketingCampaign;
    onEdit: (campaign: MarketingCampaign) => void;
    onDuplicate: (campaign: MarketingCampaign) => void;
    onTogglePause: (campaignId: string) => void;
    onDelete: (campaignId: string) => void;
    onViewStats: (campaign: MarketingCampaign) => void;
}> = ({ campaign, onEdit, onDuplicate, onTogglePause, onDelete, onViewStats }) => {
    const statusColors: { [key: string]: string } = {
        Active: 'bg-green-100 text-green-800',
        Completed: 'bg-purple-100 text-purple-800',
        Scheduled: 'bg-blue-100 text-blue-800',
        Draft: 'bg-gray-100 text-gray-800',
        Paused: 'bg-yellow-100 text-yellow-800',
    };

    const getCampaignIcon = (type: MarketingCampaign['type']) => {
        const icons = {
            Email: <EnvelopeIcon className="w-6 h-6" />,
            SMS: <ChatBubbleLeftIcon className="w-6 h-6" />,
            WhatsApp: <ChatBubbleLeftIcon className="w-6 h-6" />,
            'Email Blast': <EnvelopeIcon className="w-6 h-6" />,
        };
        return icons[type] || <PaperAirplaneIcon className="w-6 h-6" />;
    };

    return (
        <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="bg-pink-100 text-pink-600 p-3 rounded-lg">{getCampaignIcon(campaign.type)}</div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-gray-800">{campaign.name}</h3>
                                {campaign.isAutomated && <SparklesIcon className="w-5 h-5 text-yellow-500" titleAccess="Automated" />}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${statusColors[campaign.status] || 'bg-gray-100 text-gray-800'}`}>{campaign.status}</span>
                                {campaign.isAutomated && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Automated</span>}
                            </div>
                        </div>
                    </div>
                     <div className="flex items-center gap-1 text-gray-500">
                        <button onClick={() => onViewStats(campaign)} className="p-2 hover:bg-gray-100 rounded-full" title="View Stats">
                            <PresentationChartBarIcon className="w-5 h-5" />
                        </button>
                        {['Active', 'Paused'].includes(campaign.status) && (
                            <button onClick={() => onTogglePause(campaign.id)} className="p-2 hover:bg-gray-100 rounded-full" title={campaign.status === 'Active' ? 'Pause' : 'Resume'}>
                                {campaign.status === 'Active' ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                            </button>
                        )}
                        <button onClick={() => onDuplicate(campaign)} className="p-2 hover:bg-gray-100 rounded-full" title="Duplicate">
                            <DocumentDuplicateIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onEdit(campaign)} className="p-2 hover:bg-gray-100 rounded-full" title="Edit">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onDelete(campaign.id)} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-full" title="Delete">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mt-3">{campaign.description}</p>
                <div className="text-xs text-gray-500 mt-3 space-x-4">
                    <span>Type: <span className="font-medium text-gray-700">{campaign.type}</span></span>
                    <span>Audience: <span className="font-medium text-gray-700">{campaign.audience}</span></span>
                    {campaign.status === 'Scheduled' && campaign.scheduledAt ? (
                        <span>Scheduled: <span className="font-medium text-blue-700">{new Date(campaign.scheduledAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></span>
                    ) : (
                        <span>Created: <span className="font-medium text-gray-700">{new Date(campaign.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></span>
                    )}
                </div>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-b-xl grid grid-cols-5 text-center border-t">
                <div>
                    <p className="font-bold text-gray-800 text-lg">{campaign.stats.sent}</p>
                    <p className="text-xs text-gray-500">Sent</p>
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-lg">{campaign.stats.openRate}%</p>
                    <p className="text-xs text-gray-500">Open Rate</p>
                </div>
                 <div>
                    <p className="font-bold text-gray-800 text-lg">{campaign.stats.clickRate}%</p>
                    <p className="text-xs text-gray-500">Click Rate</p>
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-lg">{campaign.stats.conversions}</p>
                    <p className="text-xs text-gray-500">Conversions</p>
                </div>
                <div>
                    <p className="font-bold text-gray-800 text-lg">${campaign.stats.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                </div>
            </div>
        </div>
    );
};


const MarketingPage: React.FC = () => {
    const { currentTenant, updateTenantData, addToast } = useContext(DataContext);
    const [activeTab, setActiveTab] = useState('Campaigns');
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | undefined>(undefined);
    const [viewingCampaign, setViewingCampaign] = useState<MarketingCampaign | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        status: 'all'
    });

    const campaigns = currentTenant?.campaigns || [];
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.stats.revenue, 0);
    const totalMessages = campaigns.reduce((sum, c) => sum + c.stats.sent, 0);
    const totalOpenRate = campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + c.stats.openRate, 0) / campaigns.filter(c => c.stats.sent > 0).length || 0
        : 0;

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAddNew = () => {
        setEditingCampaign(undefined);
        setIsCampaignModalOpen(true);
    };

    const handleEdit = (campaign: MarketingCampaign) => {
        setEditingCampaign(campaign);
        setIsCampaignModalOpen(true);
    };

    const handleViewStats = (campaign: MarketingCampaign) => {
        setViewingCampaign(campaign);
    };

    const handleDuplicate = (campaignToDuplicate: MarketingCampaign) => {
        if (!currentTenant) return;
        const newCampaign: MarketingCampaign = {
            id: `mc${Date.now()}`,
            name: `Copy of ${campaignToDuplicate.name}`,
            description: campaignToDuplicate.description,
            type: campaignToDuplicate.type,
            audience: campaignToDuplicate.audience,
            createdAt: new Date().toISOString(),
            status: 'Draft',
            isAutomated: campaignToDuplicate.isAutomated,
            stats: { sent: 0, openRate: 0, clickRate: 0, conversions: 0, revenue: 0 },
        };
        const updatedCampaigns = [...currentTenant.campaigns, newCampaign];
        updateTenantData(currentTenant.id, { campaigns: updatedCampaigns });
        addToast(`Campaign '${campaignToDuplicate.name}' duplicated.`, 'success');
    };

    const handleTogglePause = (campaignId: string) => {
        if (!currentTenant) return;
        const updatedCampaigns = currentTenant.campaigns.map(c => {
            if (c.id === campaignId) {
                const newStatus: MarketingCampaign['status'] = c.status === 'Active' ? 'Paused' : 'Active';
                addToast(`Campaign status changed to ${newStatus}.`, 'info');
                return { ...c, status: newStatus };
            }
            return c;
        });
        updateTenantData(currentTenant.id, { campaigns: updatedCampaigns });
    };

    const handleDelete = (campaignId: string) => {
        if (!currentTenant) return;
        if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            const updatedCampaigns = currentTenant.campaigns.filter(c => c.id !== campaignId);
            updateTenantData(currentTenant.id, { campaigns: updatedCampaigns });
            addToast('Campaign deleted.', 'info');
        }
    };
    
    const handleSaveCampaign = (campaignData: Omit<MarketingCampaign, 'id' | 'createdAt' | 'stats'> | MarketingCampaign) => {
        if (!currentTenant) return;
        
        if ('id' in campaignData) { // Editing
            const updatedCampaigns = currentTenant.campaigns.map(c => c.id === campaignData.id ? campaignData : c);
            updateTenantData(currentTenant.id, { campaigns: updatedCampaigns });
            addToast('Campaign updated successfully!', 'success');
        } else { // Adding
            const newCampaign: MarketingCampaign = {
                id: `mc${Date.now()}`,
                createdAt: new Date().toISOString(),
                stats: { sent: 0, openRate: 0, clickRate: 0, conversions: 0, revenue: 0 },
                ...campaignData,
            };
            const updatedCampaigns = [...currentTenant.campaigns, newCampaign];
            updateTenantData(currentTenant.id, { campaigns: updatedCampaigns });
            addToast('New campaign created successfully!', 'success');
        }

        setIsCampaignModalOpen(false);
        setEditingCampaign(undefined);
    };

    const filteredCampaigns = useMemo(() => {
        if (!campaigns) return [];
        return campaigns.filter(campaign => {
            const searchMatch = filters.search === '' ||
                campaign.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                campaign.description.toLowerCase().includes(filters.search.toLowerCase());

            const typeMatch = filters.type === 'all' || campaign.type === filters.type;
            const statusMatch = filters.status === 'all' || campaign.status === filters.status;

            return searchMatch && typeMatch && statusMatch;
        });
    }, [campaigns, filters]);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Marketing Automation</h1>
                    <p className="text-gray-500 mt-1">Create and manage automated marketing campaigns</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition-opacity flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                <StatCard title="Total Campaigns" value={campaigns.length.toString()} icon={TargetIcon} iconBg="bg-pink-500" />
                <StatCard title="Active" value={campaigns.filter(c => c.status === 'Active').length.toString()} icon={PlayIcon} iconBg="bg-green-500" />
                <StatCard title="Messages Sent" value={totalMessages.toLocaleString()} icon={PaperAirplaneIcon} iconBg="bg-blue-500" />
                <StatCard title="Avg Open Rate" value={`${totalOpenRate.toFixed(1)}%`} icon={PresentationChartBarIcon} iconBg="bg-yellow-500" />
                <StatCard title="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={ChartBarSquareIcon} iconBg="bg-purple-500" />
            </div>

            <div>
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                        {['Campaigns', 'Segments', 'Templates', 'Analytics'].map(tab => (
                             <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-4 flex-wrap">
                <div className="relative flex-grow">
                     <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input
                        type="text"
                        name="search"
                        placeholder="Search campaigns..."
                        value={filters.search}
                        onChange={handleFilterChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>
                <button className="p-2 text-gray-600 border rounded-lg hover:bg-gray-100 flex items-center gap-2">
                    <FilterIcon className="w-5 h-5" />
                </button>
                <select name="type" value={filters.type} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="all">All Types</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email Blast">Email Blast</option>
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Draft">Draft</option>
                    <option value="Paused">Paused</option>
                </select>
            </div>

            <div className="space-y-5">
                {filteredCampaigns.map(campaign => (
                    <CampaignCard 
                        key={campaign.id} 
                        campaign={campaign} 
                        onEdit={handleEdit}
                        onDuplicate={handleDuplicate}
                        onTogglePause={handleTogglePause}
                        onDelete={handleDelete}
                        onViewStats={handleViewStats}
                    />
                ))}
                {filteredCampaigns.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200/80">
                        <p className="text-gray-500">No campaigns match the current filters.</p>
                    </div>
                )}
            </div>
            
            <CampaignFormModal
                isOpen={isCampaignModalOpen}
                onClose={() => {
                    setIsCampaignModalOpen(false);
                    setEditingCampaign(undefined);
                }}
                onSave={handleSaveCampaign}
                campaign={editingCampaign}
            />
            
            <CampaignStatsModal
                isOpen={!!viewingCampaign}
                onClose={() => setViewingCampaign(null)}
                campaign={viewingCampaign}
            />

        </div>
    );
};

export default MarketingPage;