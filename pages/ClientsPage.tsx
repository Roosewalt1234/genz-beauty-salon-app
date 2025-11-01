import React, { useState, useContext, useMemo, useEffect } from 'react';
import { DataContext } from '../App';
import Modal from '../components/Modal';
import { Client, LoyaltyTransaction } from '../types';
import { SKIN_TYPES, HAIR_TYPES, ACQUISITION_SOURCES } from '../constants';
import StarIcon from '../components/icons/StarIcon';

const FormSection: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`pt-4 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
        {children}
    </div>
);

const ClientForm: React.FC<{ 
    client?: Client; 
    onSave: (client: Omit<Client, 'id' | 'createdAt'> | Client) => void; 
    onCancel: () => void;
    onUpdateClient: (client: Client) => void;
}> = ({ client, onSave, onCancel, onUpdateClient }) => {
    const { currentTenant } = useContext(DataContext);
    const [formData, setFormData] = useState({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        dob: client?.dob || '',
        acquisitionSource: client?.acquisitionSource || '',
        address: { street: client?.address?.street || '', city: client?.address?.city || '', state: client?.address?.state || '' },
        preferredServices: client?.preferredServices || [],
        skinType: client?.skinType || '',
        hairType: client?.hairType || '',
        notes: client?.notes || '',
        allergies: client?.allergies?.join(', ') || '',
        communicationPreferences: { sms: client?.communicationPreferences?.sms || false, email: client?.communicationPreferences?.email || false, whatsapp: client?.communicationPreferences?.whatsapp || false, promotional: client?.communicationPreferences?.promotional || false, },
        isActive: client?.isActive === undefined ? true : client.isActive,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loyaltyModal, setLoyaltyModal] = useState<{ isOpen: boolean; action: 'add' | 'redeem' | null }>({ isOpen: false, action: null });
    const [loyaltyAmount, setLoyaltyAmount] = useState<number>(0);
    const [loyaltyReason, setLoyaltyReason] = useState('');
    const [loyaltyError, setLoyaltyError] = useState('');
    
    // Sync local form state when the client prop updates (e.g., from a loyalty transaction)
    useEffect(() => {
        if (client) {
            setFormData({
                name: client.name || '',
                email: client.email || '',
                phone: client.phone || '',
                dob: client.dob || '',
                acquisitionSource: client.acquisitionSource || '',
                address: { street: client.address?.street || '', city: client.address?.city || '', state: client.address?.state || '' },
                preferredServices: client.preferredServices || [],
                skinType: client.skinType || '',
                hairType: client.hairType || '',
                notes: client.notes || '',
                allergies: client.allergies?.join(', ') || '',
                communicationPreferences: client.communicationPreferences || { sms: false, email: false, whatsapp: false, promotional: false },
                isActive: client.isActive,
            });
        }
    }, [client]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = 'Full Name is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be exactly 10 digits.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/\D/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    };
    
    const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            preferredServices: checked
                ? [...prev.preferredServices, value]
                : prev.preferredServices.filter(s => s !== value)
        }));
    };
    
    const handleCommChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            communicationPreferences: { ...prev.communicationPreferences, [name]: checked }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const dataToSave = {
                ...formData,
                allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
            };
            if (client) {
                onSave({ ...client, ...dataToSave });
            } else {
                onSave(dataToSave as Omit<Client, 'id' | 'createdAt'>);
            }
        }
    };
    
    const openLoyaltyModal = (action: 'add' | 'redeem') => {
        setLoyaltyModal({ isOpen: true, action });
        setLoyaltyAmount(0);
        setLoyaltyReason('');
        setLoyaltyError('');
    };

    const handleConfirmLoyaltyAction = () => {
        if (!client) return;

        if (loyaltyAmount <= 0) {
            setLoyaltyError('Points must be a positive number.');
            return;
        }
        if (!loyaltyReason.trim()) {
            setLoyaltyError('A reason is required for this transaction.');
            return;
        }
        if (loyaltyModal.action === 'redeem' && loyaltyAmount > (client.loyaltyPoints || 0)) {
            setLoyaltyError('Cannot redeem more points than the client has.');
            return;
        }

        const pointsChange = loyaltyModal.action === 'add' ? loyaltyAmount : -loyaltyAmount;
        const newTotalPoints = (client.loyaltyPoints || 0) + pointsChange;

        const newTransaction: LoyaltyTransaction = {
            id: `lt-${Date.now()}`,
            date: new Date().toISOString(),
            type: loyaltyModal.action === 'add' ? 'manual_addition' : 'manual_deduction',
            points: pointsChange,
            reason: loyaltyReason,
        };

        const updatedClient: Client = {
            ...client,
            loyaltyPoints: newTotalPoints,
            loyaltyHistory: [newTransaction, ...(client.loyaltyHistory || [])],
        };

        onUpdateClient(updatedClient);
        setLoyaltyModal({ isOpen: false, action: null });
    };

    const inputClass = (fieldError?: string) => `mt-1 block w-full px-3 py-2 border ${fieldError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900`;

    return (
        <>
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormSection title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass(errors.name)} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass(errors.email)} />
                        {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass(errors.phone)} maxLength={10} />
                        {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass()} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Acquisition Source</label>
                        <select name="acquisitionSource" value={formData.acquisitionSource} onChange={handleChange} className={inputClass()}>
                            <option value="">Select Source</option>
                            {ACQUISITION_SOURCES.map(source => <option key={source} value={source}>{source}</option>)}
                        </select>
                    </div>
                </div>
            </FormSection>

            <FormSection title="Address">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Street Address</label>
                        <input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} className={inputClass()} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} className={inputClass()} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" name="state" value={formData.address.state} onChange={handleAddressChange} className={inputClass()} />
                    </div>
                 </div>
            </FormSection>

            <FormSection title="Preferences & Notes">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Services</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {currentTenant?.services.map(service => (
                            <label key={service.id} className="flex items-center space-x-2 text-sm text-gray-700">
                                <input type="checkbox" value={service.name} checked={formData.preferredServices.includes(service.name)} onChange={handleServiceChange} className="rounded text-rose-pink focus:ring-rose-pink" />
                                <span>{service.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 md:col-span-2 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Skin Type</label>
                        <select name="skinType" value={formData.skinType} onChange={handleChange} className={inputClass()}>
                            <option value="">Select Skin Type</option>
                            {SKIN_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hair Type</label>
                        <select name="hairType" value={formData.hairType} onChange={handleChange} className={inputClass()}>
                            <option value="">Select Hair Type</option>
                            {HAIR_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                </div>
                <div className="md:col-span-2 mt-4">
                     <label className="block text-sm font-medium text-gray-700">Allergies (comma-separated)</label>
                     <input name="allergies" value={formData.allergies} onChange={handleChange} className={inputClass()} />
                </div>
                <div className="md:col-span-2 mt-4">
                     <label className="block text-sm font-medium text-gray-700">Notes</label>
                     <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputClass()} />
                </div>
            </FormSection>

            <FormSection title="Loyalty Program">
                <div className="bg-yellow-50 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Loyalty Points</label>
                        <div className="flex items-center gap-2 mt-1">
                            <StarIcon className="w-6 h-6 text-yellow-500" />
                            <span className="text-2xl font-bold text-gray-800">{client?.loyaltyPoints || 0}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => openLoyaltyModal('add')} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg text-sm shadow hover:bg-green-600 transition-colors">Add Points</button>
                        <button type="button" onClick={() => openLoyaltyModal('redeem')} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg text-sm shadow hover:bg-red-600 transition-colors">Redeem Points</button>
                    </div>
                </div>

                {(client?.loyaltyHistory?.length || 0) > 0 && (
                    <div className="mt-4">
                        <h4 className="text-md font-semibold text-gray-700 mb-2">Transaction History</h4>
                        <div className="max-h-48 overflow-y-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left font-semibold text-gray-600">Date</th>
                                        <th className="p-2 text-left font-semibold text-gray-600">Type</th>
                                        <th className="p-2 text-left font-semibold text-gray-600">Points</th>
                                        <th className="p-2 text-left font-semibold text-gray-600">Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {client?.loyaltyHistory?.map(t => (
                                        <tr key={t.id} className="border-t">
                                            <td className="p-2 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="p-2 text-gray-600 capitalize">{(t.type || '').replace(/_/g, ' ')}</td>
                                            <td className={`p-2 font-bold ${t.points > 0 ? 'text-green-600' : 'text-red-600'}`}>{t.points > 0 ? `+${t.points}` : t.points}</td>
                                            <td className="p-2 text-gray-600">{t.reason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </FormSection>
            
            <FormSection title="Communication Preferences">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <label className="flex items-center space-x-2 text-sm text-gray-700"><input type="checkbox" name="sms" checked={formData.communicationPreferences.sms} onChange={handleCommChange} className="rounded text-rose-pink focus:ring-rose-pink" /><span>SMS Reminders</span></label>
                    <label className="flex items-center space-x-2 text-sm text-gray-700"><input type="checkbox" name="email" checked={formData.communicationPreferences.email} onChange={handleCommChange} className="rounded text-rose-pink focus:ring-rose-pink" /><span>Email Reminders</span></label>
                    <label className="flex items-center space-x-2 text-sm text-gray-700"><input type="checkbox" name="whatsapp" checked={formData.communicationPreferences.whatsapp} onChange={handleCommChange} className="rounded text-rose-pink focus:ring-rose-pink" /><span>WhatsApp Notifications</span></label>
                    <label className="flex items-center space-x-2 text-sm text-gray-700"><input type="checkbox" name="promotional" checked={formData.communicationPreferences.promotional} onChange={handleCommChange} className="rounded text-rose-pink focus:ring-rose-pink" /><span>Promotional Emails</span></label>
                 </div>
                 <div className="mt-4">
                     <label className="flex items-center space-x-2 text-sm text-gray-700"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={e => setFormData(p => ({...p, isActive: e.target.checked}))} className="rounded text-rose-pink focus:ring-rose-pink" /><span>Active Client</span></label>
                 </div>
            </FormSection>

            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow font-semibold">{client ? 'Save Client' : 'Add Client'}</button>
            </div>
        </form>

        <Modal 
            isOpen={loyaltyModal.isOpen} 
            onClose={() => setLoyaltyModal({isOpen: false, action: null})} 
            title={loyaltyModal.action === 'add' ? 'Add Loyalty Points' : 'Redeem Loyalty Points'}
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Points to {loyaltyModal.action}*</label>
                    <input 
                        type="number"
                        value={loyaltyAmount}
                        onChange={(e) => setLoyaltyAmount(parseInt(e.target.value, 10) || 0)}
                        className={inputClass(loyaltyError && loyaltyAmount <= 0 ? loyaltyError : undefined)}
                        min="1"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Reason / Note *</label>
                    <textarea
                        value={loyaltyReason}
                        onChange={(e) => setLoyaltyReason(e.target.value)}
                        rows={3}
                        className={inputClass(loyaltyError && !loyaltyReason.trim() ? loyaltyError : undefined)}
                        placeholder={loyaltyModal.action === 'add' ? 'e.g. Referral bonus' : 'e.g. Redeemed for 10% discount'}
                    />
                </div>
                {loyaltyError && <p className="text-sm text-red-600">{loyaltyError}</p>}
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setLoyaltyModal({isOpen: false, action: null})} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="button" onClick={handleConfirmLoyaltyAction} className="px-4 py-2 bg-rose-pink text-white rounded-lg hover:bg-rose-pink/90">{loyaltyModal.action === 'add' ? 'Add Points' : 'Redeem Points'}</button>
                </div>
            </div>
        </Modal>
        </>
    )
};


const ClientsPage: React.FC = () => {
    const { currentTenant, updateTenantData, addToast } = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ status: 'all', service: 'all' });

    const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt'> | Client) => {
        if (!currentTenant) return;
        
        if ('id' in clientData) { // Editing
            const updatedClients = currentTenant.clients.map(c => c.id === clientData.id ? clientData : c);
            updateTenantData(currentTenant.id, { clients: updatedClients });
            addToast('Client updated successfully!', 'success');
        } else { // Adding
            const newClient: Client = {
                id: `c${Date.now()}`,
                createdAt: new Date().toISOString(),
                loyaltyPoints: 0,
                ...clientData,
            };
            updateTenantData(currentTenant.id, { clients: [...currentTenant.clients, newClient] });
            addToast('Client added successfully!', 'success');
            addToast(`Welcome email sent to ${newClient.name}.`, 'info');
        }
        setIsModalOpen(false);
        setEditingClient(undefined);
    };

    const handleClientUpdate = (updatedClient: Client) => {
        if (!currentTenant) return;
        const updatedClients = currentTenant.clients.map(c => c.id === updatedClient.id ? updatedClient : c);
        updateTenantData(currentTenant.id, { clients: updatedClients });
        setEditingClient(updatedClient); // Keep the modal open with updated data
        addToast("Loyalty points updated.", "success");
    };

    const handleAddNew = () => {
        setEditingClient(undefined);
        setIsModalOpen(true);
    };
    
    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const filteredClients = useMemo(() => {
        if (!currentTenant) return [];
        return currentTenant.clients.filter(client => {
            const searchTermLower = searchTerm.toLowerCase();
            const searchMatch = client.name.toLowerCase().includes(searchTermLower) ||
                (client.email || '').toLowerCase().includes(searchTermLower) ||
                client.phone.toLowerCase().includes(searchTermLower) ||
                client.id.toLowerCase().includes(searchTermLower);
            
            const statusMatch = filters.status === 'all' || (filters.status === 'active' && client.isActive) || (filters.status === 'inactive' && !client.isActive);
            const serviceMatch = filters.service === 'all' || client.preferredServices.includes(filters.service);

            return searchMatch && statusMatch && serviceMatch;
        });
    }, [currentTenant, searchTerm, filters]);


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Client Management</h1>
                <button onClick={handleAddNew} className="px-5 py-2.5 bg-rose-pink text-white font-semibold rounded-lg shadow-md hover:bg-rose-pink/90 transition-all duration-300 transform hover:scale-105 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Add New Client
                </button>
            </div>
            
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex items-center gap-4 flex-wrap">
                 <input
                    type="text"
                    placeholder="Search by name, email, phone, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-pink text-gray-900 bg-white"
                />
                <select name="status" value={filters.status} onChange={handleFilterChange} className="px-3 py-2 border border-sky-400 bg-sky-200 text-black rounded-md shadow-sm focus:outline-none focus:ring-rose-pink">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <select name="service" value={filters.service} onChange={handleFilterChange} className="px-3 py-2 border border-sky-400 bg-sky-200 text-black rounded-md shadow-sm focus:outline-none focus:ring-rose-pink">
                    <option value="all">All Services</option>
                    {currentTenant?.services.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <div key={client.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-bold text-gray-800">{client.name}</h3>
                                <div className="text-right">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {client.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            
                            {client.email && <p className="text-lavender-purple text-sm">{client.email}</p>}
                            <p className="text-gray-600 text-sm">{client.phone}</p>
                            
                            <div className="mt-4 flex items-center gap-2">
                                <StarIcon className="w-6 h-6 text-yellow-400" />
                                <div>
                                    <p className="text-xl font-bold text-gray-800">{client.loyaltyPoints || 0}</p>
                                    <p className="text-xs text-gray-500">Loyalty Points</p>
                                </div>
                            </div>

                            {client.notes && <p className="text-sm text-gray-500 mt-2 italic">"{client.notes}"</p>}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => handleEdit(client)} className="text-sm font-medium text-rose-pink hover:underline">View/Edit</button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? 'Edit Client Details' : 'Add New Client'} size="3xl">
                <ClientForm 
                    client={editingClient} 
                    onSave={handleSaveClient} 
                    onCancel={() => setIsModalOpen(false)} 
                    onUpdateClient={handleClientUpdate}
                />
            </Modal>
        </div>
    );
};

export default ClientsPage;