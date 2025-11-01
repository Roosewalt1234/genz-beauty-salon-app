import React, { useState, useContext, useMemo, useEffect } from 'react';
import { DataContext } from '../App';
import Modal from '../components/Modal';
import { Appointment, Payment, PurchasedPackage, Service, Client, StockMovement, Product } from '../types';
import GiftIcon from '../components/icons/GiftIcon';
import PlusIcon from '../components/icons/PlusIcon';
import UserPlusIcon from '../components/icons/UserPlusIcon';

// --- HELPER FUNCTIONS ---
const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
};

// --- NEW CLIENT MODAL ---
const NewClientForm: React.FC<{ onSave: (client: Omit<Client, 'id'|'createdAt'|'preferredServices'|'communicationPreferences'|'isActive'>) => void; onCancel: () => void; }> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    
    const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-rose-pink focus:border-rose-pink";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim()) {
            setError('Name and phone are required.');
            return;
        }
        if (!/^\d{10}$/.test(phone)) {
             setError('Phone must be 10 digits.');
            return;
        }
        onSave({ name, phone });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Client Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} className={inputClass} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-rose-pink text-white rounded-md">Add Client</button>
            </div>
        </form>
    );
};


// --- MAIN APPOINTMENT FORM ---
const AppointmentForm: React.FC<{
    appointment?: Appointment;
    onSave: (appointment: Omit<Appointment, 'id'> | Appointment, usePackage: { use: boolean, pkg?: PurchasedPackage, serviceId?: string }) => void;
    onCancel: () => void;
}> = ({ appointment, onCancel, onSave: onSaveProp }) => {
    const { currentTenant, addToast, updateTenantData } = useContext(DataContext);
    const [formData, setFormData] = useState({
        clientId: appointment?.clientId || '',
        staffId: appointment?.staffId || '',
        startTimeDate: appointment?.startTime ? new Date(appointment.startTime).toISOString().slice(0, 10) : '',
        startTimeTime: appointment?.startTime ? new Date(appointment.startTime).toTimeString().slice(0, 5) : '',
        notes: appointment?.notes || '',
        status: appointment?.status || 'Scheduled',
    });
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);
    const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
    
    const inputClass = "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-rose-pink focus:border-rose-pink";
    const disabledInputClass = "disabled:bg-white disabled:opacity-70 disabled:cursor-not-allowed";

    useEffect(() => {
        if (appointment && currentTenant) {
            const services = appointment.serviceIds
                .map(id => currentTenant.services.find(s => s.id === id))
                .filter((s): s is Service => !!s);
            setSelectedServices(services);
        }
    }, [appointment, currentTenant]);

    const selectedClient = useMemo(() => currentTenant?.clients.find(c => c.id === formData.clientId), [formData.clientId, currentTenant?.clients]);
    const singleSelectedService = selectedServices.length === 1 ? selectedServices[0] : null;

    const availablePackageForService = useMemo(() => {
        if (!selectedClient || !singleSelectedService) return null;
        return selectedClient.purchasedPackages?.find(p => p.remainingServices.some(s => s.serviceId === singleSelectedService.id && s.quantity > 0)) || null;
    }, [selectedClient, singleSelectedService]);
    
    const [usePackage, setUsePackage] = useState(false);
    useEffect(() => {
        setUsePackage(!!(appointment?.payment?.method === 'Package' && availablePackageForService));
    }, [appointment, availablePackageForService]);

    const filteredStaff = useMemo(() => {
        if (!currentTenant) return [];
        if (selectedServices.length === 0) return currentTenant.staff.filter(s => s.isActive);
        
        const requiredSpecializations = selectedServices.map(s => s.name);
        
        return currentTenant.staff.filter(staff =>
            staff.isActive && requiredSpecializations.every(spec => staff.specializations.includes(spec))
        );
    }, [currentTenant, selectedServices]);

    const { totalDuration, totalPrice } = useMemo(() => {
        const duration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
        const price = selectedServices.reduce((sum, s) => sum + s.price, 0);
        return { totalDuration: duration, totalPrice: price };
    }, [selectedServices]);


    const handleServiceToggle = (service: Service) => {
        setSelectedServices(prev =>
            prev.some(s => s.id === service.id)
                ? prev.filter(s => s.id !== service.id)
                : [...prev, service]
        );
    };

    const handleSaveNewClient = (clientData: Omit<Client, 'id'|'createdAt'|'preferredServices'|'communicationPreferences'|'isActive'>) => {
        if (!currentTenant) return;
        const newClient: Client = {
            id: `c${Date.now()}`,
            createdAt: new Date().toISOString(),
            loyaltyPoints: 0,
            preferredServices: [],
            communicationPreferences: { email: true, sms: true, whatsapp: false, promotional: false },
            isActive: true,
            ...clientData,
        };
        updateTenantData(currentTenant.id, { clients: [...currentTenant.clients, newClient] });
        addToast(`Client ${newClient.name} added!`, 'success');
        setFormData(prev => ({ ...prev, clientId: newClient.id }));
        setIsNewClientModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId || !formData.staffId || selectedServices.length === 0 || !formData.startTimeDate || !formData.startTimeTime) {
            addToast('Please fill all required fields.', 'error');
            return;
        }

        const startTime = new Date(`${formData.startTimeDate}T${formData.startTimeTime}`);
        const endTime = new Date(startTime.getTime() + totalDuration * 60000);

        const packageDetails = {
            use: usePackage && !!singleSelectedService,
            pkg: availablePackageForService || undefined,
            serviceId: singleSelectedService?.id,
        };

        const dataToSave = {
            ...formData,
            serviceIds: selectedServices.map(s => s.id),
            startTime,
            endTime,
            status: usePackage ? 'Paid' : (formData.status as 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show' | 'Paid'),
        };

        if (appointment) {
            onSaveProp({ ...appointment, ...dataToSave, payment: appointment.payment }, packageDetails);
        } else {
            onSaveProp(dataToSave as Omit<Appointment, 'id'>, packageDetails);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                    <div className="flex items-center gap-2">
                        <select name="clientId" value={formData.clientId} onChange={e => setFormData(p => ({...p, clientId: e.target.value}))} className={inputClass}>
                            <option value="">Select Client</option>
                            {currentTenant?.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button type="button" onClick={() => setIsNewClientModalOpen(true)} className="p-2 bg-light-pink text-rose-pink rounded-md hover:bg-rose-pink/20 transition-colors">
                            <UserPlusIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input type="date" name="startTimeDate" value={formData.startTimeDate} onChange={e => setFormData(p => ({...p, startTimeDate: e.target.value}))} className={inputClass} />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                    <input type="time" name="startTimeTime" value={formData.startTimeTime} onChange={e => setFormData(p => ({...p, startTimeTime: e.target.value}))} className={inputClass} />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Services *</label>
                {selectedServices.length > 0 && (
                    <div className="p-3 bg-light-purple/50 rounded-lg mb-4 text-sm">
                        <p className="font-semibold text-purple-800">Selected: {selectedServices.map(s => s.name).join(', ')}</p>
                        <p className="text-gray-700">Total Duration: <span className="font-bold">{formatDuration(totalDuration)}</span></p>
                        <p className="text-gray-700">Total Price: <span className="font-bold">${totalPrice.toFixed(2)}</span></p>
                    </div>
                )}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                    {currentTenant?.services.map(service => {
                        const isSelected = selectedServices.some(s => s.id === service.id);
                        return (
                            <div key={service.id} className="p-3 border rounded-lg bg-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{service.name}</h4>
                                        <p className="text-xs text-gray-500">{service.description}</p>
                                    </div>
                                    <button type="button" onClick={() => handleServiceToggle(service)} className={`px-4 py-1 text-sm font-semibold rounded-full ${isSelected ? 'bg-gray-300 text-gray-700' : 'bg-rose-pink text-white'}`}>
                                        {isSelected ? 'Remove' : 'Add'}
                                    </button>
                                </div>
                                <div className="flex justify-between items-baseline mt-2 text-xs">
                                    <span className="text-gray-600">{formatDuration(service.duration)}</span>
                                    <span className="font-bold text-lg text-gray-800">${service.price}</span>
                                </div>
                            </div>
                        )
                    })}
                 </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member *</label>
                <select name="staffId" value={formData.staffId} onChange={e => setFormData(p => ({...p, staffId: e.target.value}))} className={`${inputClass} ${disabledInputClass}`} disabled={selectedServices.length === 0}>
                    <option value="">{selectedServices.length === 0 ? 'Select services first' : 'Select Staff'}</option>
                    {filteredStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            {availablePackageForService && (
                <div className="pt-4 border-t">
                    <label className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer">
                        <input type="checkbox" checked={usePackage} onChange={(e) => setUsePackage(e.target.checked)} className="h-5 w-5 rounded text-rose-pink focus:ring-rose-pink"/>
                        <div className="flex items-center">
                            <GiftIcon className="w-6 h-6 mr-2 text-green-600"/>
                            <div>
                                <p className="font-semibold text-green-800">Redeem from Package</p>
                                <p className="text-sm text-green-700">Use 1 <span className="font-bold">{singleSelectedService?.name}</span> from '{currentTenant?.packages.find(p => p.id === availablePackageForService.packageId)?.name}'</p>
                            </div>
                        </div>
                    </label>
                </div>
            )}

            <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                 <textarea name="notes" value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} rows={3} className={inputClass} placeholder="Any special requests or notes..."/>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-rose-pink text-white rounded-lg hover:bg-rose-pink/90 font-semibold">{appointment ? 'Save Changes' : 'Book Appointment'}</button>
            </div>
            
             <Modal isOpen={isNewClientModalOpen} onClose={() => setIsNewClientModalOpen(false)} title="Add New Client">
                <NewClientForm onSave={handleSaveNewClient} onCancel={() => setIsNewClientModalOpen(false)} />
            </Modal>
        </form>
    );
};

const BookingsPage: React.FC = () => {
    const { currentTenant, updateTenantData, addToast } = useContext(DataContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

    const handleSaveAppointment = (appointmentData: Omit<Appointment, 'id'> | Appointment, usePackage: { use: boolean, pkg?: PurchasedPackage, serviceId?: string }) => {
        if (!currentTenant) return;

        let tenantUpdates: Partial<typeof currentTenant> = {};

        // --- Package Redemption Logic ---
        if (usePackage.use && usePackage.pkg && usePackage.serviceId) {
            const clientIndex = currentTenant.clients.findIndex(c => c.id === appointmentData.clientId);
            if (clientIndex !== -1) {
                const updatedClients = [...currentTenant.clients];
                const client = { ...updatedClients[clientIndex] };
                const clientPackageIndex = client.purchasedPackages?.findIndex(p => p.packageId === usePackage.pkg?.packageId) ?? -1;
                
                if (clientPackageIndex !== -1 && client.purchasedPackages) {
                    const serviceInPackageIndex = client.purchasedPackages[clientPackageIndex].remainingServices.findIndex(s => s.serviceId === usePackage.serviceId);
                    if (serviceInPackageIndex !== -1) {
                        client.purchasedPackages[clientPackageIndex].remainingServices[serviceInPackageIndex].quantity -= 1;
                        if (client.purchasedPackages[clientPackageIndex].remainingServices[serviceInPackageIndex].quantity <= 0) {
                            client.purchasedPackages[clientPackageIndex].remainingServices.splice(serviceInPackageIndex, 1);
                        }
                    }
                }
                updatedClients[clientIndex] = client;
                tenantUpdates.clients = updatedClients;
            }
        }

        // --- Automatic Stock Deduction Logic ---
        const completedStatuses: Appointment['status'][] = ['Completed', 'Paid'];
        const previousStatus = 'id' in appointmentData ? currentTenant.appointments.find(a => a.id === appointmentData.id)?.status : null;
        const isNowCompleted = completedStatuses.includes(appointmentData.status);
        const wasNotCompleted = previousStatus ? !completedStatuses.includes(previousStatus) : true;

        if (isNowCompleted && wasNotCompleted) {
            let updatedInventory = [...currentTenant.inventory];
            let newStockMovements: StockMovement[] = [];

            appointmentData.serviceIds.forEach(serviceId => {
                const service = currentTenant.services.find(s => s.id === serviceId);
                service?.professionalUseProducts?.forEach(prodUsage => {
                    const productIndex = updatedInventory.findIndex(p => p.id === prodUsage.productId);
                    if (productIndex !== -1) {
                        const product = updatedInventory[productIndex];
                        updatedInventory[productIndex] = { ...product, stock: product.stock - prodUsage.quantityUsed };
                        newStockMovements.push({
                            id: `sm${Date.now()}-${Math.random()}`,
                            productId: prodUsage.productId,
                            date: new Date().toISOString(),
                            type: 'out',
                            quantity: prodUsage.quantityUsed,
                            reason: 'Professional Use',
                            notes: `Used in service: ${service.name}`,
                        });
                    }
                });
            });

            if (newStockMovements.length > 0) {
                tenantUpdates.inventory = updatedInventory;
                tenantUpdates.stockMovements = [...currentTenant.stockMovements, ...newStockMovements];
                addToast(`${newStockMovements.length} product(s) deducted from stock.`, 'info');
            }
        }
        
        // --- Save Appointment ---
        if ('id' in appointmentData) {
            const updatedAppointment = { ...appointmentData };
            tenantUpdates.appointments = currentTenant.appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a);
            addToast('Appointment updated successfully!', 'success');
        } else {
            const newAppointment: Appointment = { id: `a${Date.now()}`, ...appointmentData };
            tenantUpdates.appointments = [...currentTenant.appointments, newAppointment];
            addToast('Appointment booked successfully!', 'success');
        }
        
        updateTenantData(currentTenant.id, tenantUpdates);

        setIsModalOpen(false);
        setEditingAppointment(undefined);
    };

    const handleAddNew = () => {
        setEditingAppointment(undefined);
        setIsModalOpen(true);
    };
    
    const handleEdit = (appointment: Appointment) => {
        setEditingAppointment(appointment);
        setIsModalOpen(true);
    };
    
    const filteredAppointments = useMemo(() => {
        if (!currentTenant) return [];
        return currentTenant.appointments
            .filter(app => {
                const appDate = new Date(app.startTime);
                const filterDate = new Date(dateFilter);
                const filterDateUTC = new Date(filterDate.valueOf() + filterDate.getTimezoneOffset() * 60 * 1000);
                
                const isSameDay = appDate.getFullYear() === filterDateUTC.getFullYear() &&
                                  appDate.getMonth() === filterDateUTC.getMonth() &&
                                  appDate.getDate() === filterDateUTC.getDate();

                if (!isSameDay) return false;

                const client = currentTenant.clients.find(c => c.id === app.clientId);
                const staff = currentTenant.staff.find(s => s.id === app.staffId);
                const searchTermLower = searchTerm.toLowerCase();

                const searchMatch = client?.name.toLowerCase().includes(searchTermLower) ||
                    staff?.name.toLowerCase().includes(searchTermLower) ||
                    app.status.toLowerCase().includes(searchTermLower);

                return searchMatch;
            })
            .sort((a,b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }, [currentTenant, searchTerm, dateFilter]);

    const statusColors: { [key: string]: string } = {
        Scheduled: 'bg-blue-100 text-blue-800',
        Completed: 'bg-green-100 text-green-800',
        Paid: 'bg-purple-100 text-purple-800',
        Cancelled: 'bg-red-100 text-red-800',
        'No-Show': 'bg-yellow-100 text-yellow-800',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
                <button onClick={handleAddNew} className="px-5 py-2.5 bg-rose-pink text-white font-semibold rounded-lg shadow-md hover:bg-rose-pink/90 transition-all duration-300 transform hover:scale-105 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Book New Appointment
                </button>
            </div>
            
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex items-center gap-4 flex-wrap">
                 <input
                    type="text"
                    placeholder="Search client, staff, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-pink text-gray-900 bg-white"
                />
                 <div>
                    <label htmlFor="dateFilter" className="text-sm font-medium text-gray-700 mr-2">Date:</label>
                    <input
                        type="date"
                        id="dateFilter"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-1.5 border border-blue-400 rounded-md shadow-sm focus:outline-none focus:ring-rose-pink text-black bg-blue-200"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-4">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map(app => {
                            if (!currentTenant) return null;
                            const client = currentTenant.clients.find(c => c.id === app.clientId);
                            const staff = currentTenant.staff.find(s => s.id === app.staffId);
                            const services = app.serviceIds.map(id => currentTenant.services.find(s => s.id === id)).filter(Boolean);
                            return (
                                <div key={app.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex-1 mb-3 md:mb-0">
                                        <p className="text-lg font-bold text-rose-pink">{client?.name || 'Unknown Client'}</p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">{services.map(s => s?.name).join(', ') || 'Unknown Service'}</span> with <span className="font-semibold">{staff?.name || 'Unknown Staff'}</span>
                                        </p>
                                        {app.payment?.method === 'Package' && (
                                            <div className="flex items-center text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit mt-1">
                                                <GiftIcon className="w-3 h-3 mr-1.5" />
                                                Paid via Package
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left md:text-center mb-3 md:mb-0">
                                        <p className="font-medium text-gray-800">{new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(app.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-sm text-gray-500">{new Date(app.startTime).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {app.status}
                                        </span>
                                        <button onClick={() => handleEdit(app)} className="text-sm font-medium text-rose-pink hover:underline">Details</button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-center text-gray-500 py-8">No appointments found for this date.</p>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAppointment ? 'Edit Appointment' : 'Book New Appointment'} size="3xl">
                <AppointmentForm appointment={editingAppointment} onSave={handleSaveAppointment} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default BookingsPage;