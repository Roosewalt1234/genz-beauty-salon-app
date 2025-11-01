import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { MarketingCampaign } from '../types';

interface CampaignFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (campaign: Omit<MarketingCampaign, 'id' | 'createdAt' | 'stats'> | MarketingCampaign) => void;
    campaign?: MarketingCampaign;
}

const CampaignFormModal: React.FC<CampaignFormModalProps> = ({ isOpen, onClose, onSave, campaign }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'Email' as MarketingCampaign['type'],
        audience: '',
        status: 'Draft' as MarketingCampaign['status'],
        isAutomated: false,
        scheduledAtDate: '',
        scheduledAtTime: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const initialFormState = {
        name: '',
        description: '',
        type: 'Email' as MarketingCampaign['type'],
        audience: '',
        status: 'Draft' as MarketingCampaign['status'],
        isAutomated: false,
        scheduledAtDate: '',
        scheduledAtTime: '',
    };

    useEffect(() => {
        if (isOpen) {
            if (campaign) {
                const scheduledDate = campaign.scheduledAt ? new Date(campaign.scheduledAt) : null;
                setFormData({
                    name: campaign.name,
                    description: campaign.description,
                    type: campaign.type,
                    audience: campaign.audience,
                    status: campaign.status,
                    isAutomated: campaign.isAutomated,
                    scheduledAtDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : '',
                    scheduledAtTime: scheduledDate ? scheduledDate.toTimeString().substring(0, 5) : '',
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [campaign, isOpen]);

    useEffect(() => {
        if (formData.type === 'Email Blast') {
            setFormData(prev => ({...prev, audience: 'All Subscribed Clients'}));
        }
    }, [formData.type]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Campaign Name is required.';
        if (!formData.audience.trim()) newErrors.audience = 'Audience is required.';
        if (formData.status === 'Scheduled') {
            if (!formData.scheduledAtDate) newErrors.scheduledAtDate = 'Scheduled date is required.';
            if (!formData.scheduledAtTime) newErrors.scheduledAtTime = 'Scheduled time is required.';
            if (formData.scheduledAtDate && formData.scheduledAtTime) {
                const scheduledDateTime = new Date(`${formData.scheduledAtDate}T${formData.scheduledAtTime}`);
                if (scheduledDateTime < new Date()) {
                    newErrors.scheduledAtDate = 'Scheduled date and time must be in the future.';
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const { scheduledAtDate, scheduledAtTime, ...restOfData } = formData;
            let scheduledAt: string | undefined = undefined;

            if (formData.status === 'Scheduled' && scheduledAtDate && scheduledAtTime) {
                scheduledAt = new Date(`${scheduledAtDate}T${scheduledAtTime}`).toISOString();
            }

            const campaignPayload = { ...restOfData, scheduledAt };

            if (campaign) {
                onSave({ ...campaign, ...campaignPayload });
            } else {
                onSave(campaignPayload as Omit<MarketingCampaign, 'id' | 'createdAt' | 'stats'>);
            }
        }
    };

    const inputClass = (fieldError?: string) => `mt-1 block w-full px-3 py-2 border ${fieldError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm bg-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-900`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={campaign ? 'Edit Campaign' : 'Create New Campaign'} size="2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Campaign Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass(errors.name)} />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass()} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Type *</label>
                        <select name="type" value={formData.type} onChange={handleChange} className={inputClass()}>
                            <option value="Email">Email</option>
                            <option value="SMS">SMS</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Email Blast">Email Blast</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Audience *</label>
                        <input type="text" name="audience" placeholder="e.g., VIP Clients, Inactive Clients" value={formData.audience} onChange={handleChange} className={inputClass(errors.audience)} />
                         {errors.audience && <p className="text-sm text-red-500 mt-1">{errors.audience}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Status *</label>
                        <select name="status" value={formData.status} onChange={handleChange} className={inputClass()}>
                            <option value="Draft">Draft</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div className="flex items-end pb-1">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input type="checkbox" name="isAutomated" checked={formData.isAutomated} onChange={handleChange} className="h-5 w-5 rounded text-purple-600 focus:ring-purple-500" />
                            <span className="text-sm font-medium text-gray-700">Enable Automation</span>
                        </label>
                    </div>
                </div>

                {formData.status === 'Scheduled' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Scheduling</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date *</label>
                                <input type="date" name="scheduledAtDate" value={formData.scheduledAtDate} onChange={handleChange} className={inputClass(errors.scheduledAtDate)} />
                                {errors.scheduledAtDate && <p className="text-sm text-red-500 mt-1">{errors.scheduledAtDate}</p>}
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Time *</label>
                                <input type="time" name="scheduledAtTime" value={formData.scheduledAtTime} onChange={handleChange} className={inputClass(errors.scheduledAtTime)} />
                                {errors.scheduledAtTime && <p className="text-sm text-red-500 mt-1">{errors.scheduledAtTime}</p>}
                            </div>
                        </div>
                    </div>
                )}


                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity shadow font-semibold">{campaign ? 'Save Changes' : 'Save Campaign'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default CampaignFormModal;