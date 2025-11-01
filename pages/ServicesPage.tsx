import React, { useState, useContext, useMemo } from 'react';
import { DataContext } from '../App';
import Modal from '../components/Modal';
import { Service, ServicePackage, ServicePackageItem } from '../types';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import TagIcon from '../components/icons/TagIcon';
import GiftIcon from '../components/icons/GiftIcon';
import PlusIcon from '../components/icons/PlusIcon';

// Form for adding/editing a service
const ServiceForm: React.FC<{
    service?: Service;
    onSave: (service: Omit<Service, 'id'> | Service) => void;
    onCancel: () => void;
}> = ({ service, onSave, onCancel }) => {
    const { currentTenant } = useContext(DataContext);
    const [formData, setFormData] = useState({
        name: service?.name || '',
        description: service?.description || '',
        duration: service?.duration || '',
        price: service?.price || '',
        cost: service?.cost || '',
        professionalUseProducts: service?.professionalUseProducts || [],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedProduct, setSelectedProduct] = useState('');

    const professionalProducts = useMemo(() => {
        return currentTenant?.inventory.filter(p => p.category === 'Professional') || [];
    }, [currentTenant]);
    
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Service name is required';
        if (!formData.duration || +formData.duration <= 0) newErrors.duration = 'Duration must be a positive number';
        if (formData.price === '' || +formData.price < 0) newErrors.price = 'Price cannot be negative';
        if (formData.cost === '' || +formData.cost < 0) newErrors.cost = 'Cost cannot be negative';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = () => {
        if (selectedProduct && !formData.professionalUseProducts.some(p => p.productId === selectedProduct)) {
            setFormData(prev => ({
                ...prev,
                professionalUseProducts: [
                    ...prev.professionalUseProducts,
                    { productId: selectedProduct, quantityUsed: 1, unit: 'ml' }
                ]
            }));
            setSelectedProduct('');
        }
    };
    
    const handleProductChange = (index: number, field: 'quantityUsed' | 'unit', value: string) => {
        setFormData(prev => {
            const newProducts = [...prev.professionalUseProducts];
            const productToUpdate = { ...newProducts[index] };
    
            if (field === 'quantityUsed') {
                productToUpdate.quantityUsed = Number(value);
            } else {
                productToUpdate.unit = value as 'ml' | 'g' | 'pcs';
            }
    
            newProducts[index] = productToUpdate;
            return { ...prev, professionalUseProducts: newProducts };
        });
    };
    
    const handleRemoveProduct = (productId: string) => {
        setFormData(prev => ({
            ...prev,
            professionalUseProducts: prev.professionalUseProducts.filter(p => p.productId !== productId)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const dataToSave = {
                ...formData,
                duration: Number(formData.duration),
                price: Number(formData.price),
                cost: Number(formData.cost),
                professionalUseProducts: formData.professionalUseProducts.map(p => ({
                    ...p,
                    quantityUsed: Number(p.quantityUsed) || 0
                }))
            };
            if (service) {
                onSave({ ...service, ...dataToSave });
            } else {
                onSave(dataToSave as Omit<Service, 'id'>);
            }
        }
    };

    const inputClass = (fieldError?: string) => `mt-1 block w-full px-3 py-2 border ${fieldError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Service Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass(errors.name)} />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (in minutes) *</label>
                    <input type="number" name="duration" value={formData.duration} onChange={handleChange} className={inputClass(errors.duration)} />
                    {errors.duration && <p className="text-sm text-red-500 mt-1">{errors.duration}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price (AED) *</label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className={inputClass(errors.price)} />
                    {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Cost (AED) *</label>
                    <input type="number" step="0.01" name="cost" value={formData.cost} onChange={handleChange} className={inputClass(errors.cost)} />
                    {errors.cost && <p className="text-sm text-red-500 mt-1">{errors.cost}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClass()} />
                </div>

                <div className="md:col-span-2 pt-6 mt-4 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-800 mb-2">Professional Products Used</h3>
                    <p className="text-sm text-gray-500 mb-4">Link products from your inventory that are used during this service. This enables automatic stock deduction when an appointment is completed.</p>
                    
                    <div className="flex items-center gap-2 mb-4">
                        <select 
                            value={selectedProduct} 
                            onChange={e => setSelectedProduct(e.target.value)} 
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900"
                        >
                            <option value="">Select a professional product...</option>
                            {professionalProducts.map(p => (
                                <option key={p.id} value={p.id} disabled={formData.professionalUseProducts.some(fp => fp.productId === p.id)}>
                                    {p.name} ({p.brand})
                                </option>
                            ))}
                        </select>
                        <button 
                            type="button" 
                            onClick={handleAddProduct} 
                            disabled={!selectedProduct}
                            className="px-4 py-2 bg-lavender-purple text-white font-semibold rounded-lg text-sm shadow hover:bg-lavender-purple/90 disabled:bg-gray-300"
                        >
                            Add
                        </button>
                    </div>
            
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {formData.professionalUseProducts.map((prod, index) => {
                            const productInfo = currentTenant?.inventory.find(p => p.id === prod.productId);
                            return (
                                <div key={prod.productId} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                                    <span className="flex-grow font-medium text-sm text-gray-700">{productInfo?.name || 'Unknown Product'}</span>
                                    <input 
                                        type="number"
                                        value={prod.quantityUsed}
                                        onChange={e => handleProductChange(index, 'quantityUsed', e.target.value)}
                                        className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                                        placeholder="Qty"
                                        min="0"
                                    />
                                    <select
                                        value={prod.unit}
                                        onChange={e => handleProductChange(index, 'unit', e.target.value)}
                                        className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                                    >
                                        <option value="ml">ml</option>
                                        <option value="g">g</option>
                                        <option value="pcs">pcs</option>
                                    </select>
                                    <button type="button" onClick={() => handleRemoveProduct(prod.productId)} className="text-red-500 hover:text-red-700 p-1">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow font-semibold">{service ? 'Save Changes' : 'Add Service'}</button>
            </div>
        </form>
    );
};

const PackageForm: React.FC<{
    pkg?: ServicePackage;
    onSave: (pkg: Omit<ServicePackage, 'id'> | ServicePackage) => void;
    onCancel: () => void;
}> = ({ pkg, onSave, onCancel }) => {
    const { currentTenant } = useContext(DataContext);
    const [formData, setFormData] = useState({
        name: pkg?.name || '',
        description: pkg?.description || '',
        price: pkg?.price || '',
        isActive: pkg?.isActive === undefined ? true : pkg.isActive,
    });
    const [servicesInPackage, setServicesInPackage] = useState<ServicePackageItem[]>(pkg?.services || []);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const totalValue = useMemo(() => {
        return servicesInPackage.reduce((total, item) => {
            const service = currentTenant?.services.find(s => s.id === item.serviceId);
            return total + (service?.price || 0) * item.quantity;
        }, 0);
    }, [servicesInPackage, currentTenant?.services]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleServiceQuantityChange = (serviceId: string, quantity: number) => {
        if (quantity < 1) {
            setServicesInPackage(prev => prev.filter(s => s.serviceId !== serviceId));
        } else {
            setServicesInPackage(prev =>
                prev.map(s => s.serviceId === serviceId ? { ...s, quantity } : s)
            );
        }
    };
    
    const addServiceToPackage = (serviceId: string) => {
        if (!serviceId || servicesInPackage.some(s => s.serviceId === serviceId)) return;
        setServicesInPackage(prev => [...prev, { serviceId, quantity: 1 }]);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Package name is required';
        if (!formData.price || +formData.price <= 0) newErrors.price = 'Price must be a positive number';
        if (servicesInPackage.length === 0) newErrors.services = 'A package must contain at least one service';
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) return;

        const dataToSave = {
            ...formData,
            price: Number(formData.price),
            services: servicesInPackage,
        };
        if (pkg) {
            onSave({ ...pkg, ...dataToSave });
        } else {
            onSave(dataToSave as Omit<ServicePackage, 'id'>);
        }
    };

    const inputClass = (fieldError?: string) => `mt-1 block w-full px-3 py-2 border ${fieldError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" name="name" placeholder="Package Name *" value={formData.name} onChange={handleChange} className={inputClass(errors.name)} />
                <input type="number" step="0.01" placeholder="Package Price (AED) *" name="price" value={formData.price} onChange={handleChange} className={inputClass(errors.price)} />
                <div className="md:col-span-2">
                    <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} rows={2} className={inputClass()} />
                </div>
            </div>
            {errors.name && <p className="text-sm text-red-500 -mt-4">{errors.name}</p>}
            {errors.price && <p className="text-sm text-red-500 -mt-4">{errors.price}</p>}
            
            <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-700 mb-2">Included Services</h3>
                {errors.services && <p className="text-sm text-red-500 mb-2">{errors.services}</p>}

                <div className="flex gap-2 mb-4">
                    <select onChange={e => addServiceToPackage(e.target.value)} className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900" value="">
                        <option value="" disabled>Add a service to the package...</option>
                        {currentTenant?.services.map(s => <option key={s.id} value={s.id} disabled={servicesInPackage.some(sp => sp.serviceId === s.id)}>{s.name} (AED {s.price})</option>)}
                    </select>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {servicesInPackage.map(item => {
                        const service = currentTenant?.services.find(s => s.id === item.serviceId);
                        return (
                             <div key={item.serviceId} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                <p className="text-sm font-medium text-gray-800">{service?.name}</p>
                                <div className="flex items-center gap-2">
                                    <input type="number" value={item.quantity} onChange={e => handleServiceQuantityChange(item.serviceId, +e.target.value)} min="1" className="w-16 text-center border-gray-300 rounded-md" />
                                    <button type="button" onClick={() => handleServiceQuantityChange(item.serviceId, 0)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            
            <div className="pt-4 border-t">
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-5 w-5 rounded text-rose-pink focus:ring-rose-pink" />
                    <span className="text-sm font-medium text-gray-700">Package is Active and available for purchase</span>
                </label>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
                 <div>
                    <p className="text-sm text-gray-600">Total Value: <span className="font-semibold text-gray-800">AED {totalValue.toFixed(2)}</span></p>
                    <p className="text-sm text-green-600">Savings: <span className="font-semibold">AED {(totalValue - (+formData.price || 0)).toFixed(2)}</span></p>
                </div>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:opacity-90 transition-opacity shadow font-semibold">{pkg ? 'Save Package' : 'Create Package'}</button>
                </div>
            </div>
        </form>
    );
};

const ServicesPage: React.FC = () => {
    const { currentTenant, updateTenantData, addToast } = useContext(DataContext);
    const [activeTab, setActiveTab] = useState<'services' | 'packages'>('services');
    
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | undefined>(undefined);
    
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | undefined>(undefined);

    // --- Service Handlers ---
    const handleSaveService = (serviceData: Omit<Service, 'id'> | Service) => {
        if (!currentTenant) return;
        if ('id' in serviceData) {
            const updatedServices = currentTenant.services.map(s => s.id === serviceData.id ? serviceData : s);
            updateTenantData(currentTenant.id, { services: updatedServices });
            addToast('Service updated successfully!', 'success');
        } else {
            const newService: Service = { id: `s${Date.now()}`, ...serviceData };
            updateTenantData(currentTenant.id, { services: [...currentTenant.services, newService] });
            addToast('Service added successfully!', 'success');
        }
        setIsServiceModalOpen(false);
    };
    const handleDeleteService = (serviceId: string) => {
        if (!currentTenant) return;
        if (window.confirm('Are you sure? This will also affect any packages containing this service.')) {
            const updatedServices = currentTenant.services.filter(s => s.id !== serviceId);
            // Also remove from packages
            const updatedPackages = currentTenant.packages.map(p => ({
                ...p,
                services: p.services.filter(s => s.serviceId !== serviceId)
            }));
            updateTenantData(currentTenant.id, { services: updatedServices, packages: updatedPackages });
            addToast('Service deleted.', 'info');
        }
    };

    // --- Package Handlers ---
    const handleSavePackage = (packageData: Omit<ServicePackage, 'id'> | ServicePackage) => {
        if (!currentTenant) return;
        if ('id' in packageData) {
            const updatedPackages = currentTenant.packages.map(p => p.id === packageData.id ? packageData : p);
            updateTenantData(currentTenant.id, { packages: updatedPackages });
            addToast('Package updated successfully!', 'success');
        } else {
            const newPackage: ServicePackage = { id: `pkg${Date.now()}`, ...packageData };
            updateTenantData(currentTenant.id, { packages: [...currentTenant.packages, newPackage] });
            addToast('Package created successfully!', 'success');
        }
        setIsPackageModalOpen(false);
    };
    const handleDeletePackage = (packageId: string) => {
        if (!currentTenant) return;

        const isPackageInUse = currentTenant.clients.some(client =>
            client.purchasedPackages?.some(pp => pp.packageId === packageId)
        );

        if (isPackageInUse) {
            addToast('Cannot delete package. It has been purchased by clients.', 'error');
            alert('This package cannot be deleted because it has been purchased by clients. Please set it to "Inactive" instead if you wish to remove it from sale.');
            return;
        }

        if (window.confirm('Are you sure you want to delete this package?')) {
            const updatedPackages = currentTenant.packages.filter(p => p.id !== packageId);
            updateTenantData(currentTenant.id, { packages: updatedPackages });
            addToast('Package deleted.', 'info');
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Service & Package Management</h1>
                <button 
                    onClick={() => activeTab === 'services' ? setIsServiceModalOpen(true) : setIsPackageModalOpen(true)}
                    className="px-5 py-2.5 bg-rose-pink text-white font-semibold rounded-lg shadow-md hover:bg-rose-pink/90 transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    {activeTab === 'services' ? 'Add New Service' : 'Create New Package'}
                </button>
            </div>
            
            <div className="mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('services')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'services' ? 'border-rose-pink text-rose-pink' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                            <TagIcon className="w-5 h-5 mr-2" /> Individual Services
                        </button>
                        <button onClick={() => setActiveTab('packages')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'packages' ? 'border-rose-pink text-rose-pink' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                           <GiftIcon className="w-5 h-5 mr-2" /> Service Packages
                        </button>
                    </nav>
                </div>
            </div>

            {activeTab === 'services' && (
                 <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        {/* Table Head */}
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Service Name</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3 text-center">Duration (min)</th>
                                <th scope="col" className="px-6 py-3 text-center">Price (AED)</th>
                                <th scope="col" className="px-6 py-3 text-center">Cost (AED)</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {currentTenant?.services.map(service => (
                                <tr key={service.id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{service.name}</th>
                                    <td className="px-6 py-4 max-w-sm truncate">{service.description || '-'}</td>
                                    <td className="px-6 py-4 text-center">{service.duration}</td>
                                    <td className="px-6 py-4 text-center font-semibold">{service.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center text-red-600">{service.cost.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => { setEditingService(service); setIsServiceModalOpen(true); }} className="p-2 text-lavender-purple hover:text-lavender-purple/80"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDeleteService(service.id)} className="p-2 text-rose-pink hover:text-rose-pink/80"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {activeTab === 'packages' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentTenant?.packages.map(pkg => {
                        const totalValue = pkg.services.reduce((total, item) => {
                            const service = currentTenant.services.find(s => s.id === item.serviceId);
                            return total + (service?.price || 0) * item.quantity;
                        }, 0);
                        return (
                            <div key={pkg.id} className="bg-white rounded-xl shadow-lg flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{pkg.name}</h3>
                                            <span className={`mt-1 inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {pkg.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-bold text-rose-pink">AED {pkg.price}</p>
                                    </div>
                                    <p className="text-sm text-green-600 font-semibold mt-1">Save AED {(totalValue - pkg.price).toFixed(2)}</p>
                                    <p className="text-sm text-gray-500 mt-2 min-h-[40px]">{pkg.description}</p>
                                    <ul className="mt-4 space-y-2 text-sm text-gray-700 border-t pt-4">
                                        {pkg.services.map(item => {
                                            const service = currentTenant.services.find(s => s.id === item.serviceId);
                                            return <li key={item.serviceId} className="flex justify-between"><span>{service?.name || 'Unknown Service'}</span><span className="font-semibold">x{item.quantity}</span></li>;
                                        })}
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-3 flex justify-end items-center gap-2 rounded-b-xl">
                                    <button onClick={() => { setEditingPackage(pkg); setIsPackageModalOpen(true); }} className="p-2 text-sm font-medium text-lavender-purple hover:underline">Edit</button>
                                    <button onClick={() => handleDeletePackage(pkg.id)} className="p-2 text-sm font-medium text-rose-pink hover:underline">Delete</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title={editingService ? 'Edit Service' : 'Add New Service'} size="2xl">
                <ServiceForm service={editingService} onSave={handleSaveService} onCancel={() => setIsServiceModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isPackageModalOpen} onClose={() => setIsPackageModalOpen(false)} title={editingPackage ? 'Edit Package' : 'Create New Package'} size="3xl">
                <PackageForm pkg={editingPackage} onSave={handleSavePackage} onCancel={() => setIsPackageModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default ServicesPage;