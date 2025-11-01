import React, { useState, useContext, useMemo, useCallback } from 'react';
import { DataContext } from '../App';
import Modal from '../components/Modal';
import { Product, Supplier, PurchaseOrder, PurchaseOrderItem } from '../types';
import ProductDetailModal from '../components/ProductDetailModal';
import BarcodeScanner from '../components/BarcodeScanner';

import PlusIcon from '../components/icons/PlusIcon';
import PencilIcon from '../components/icons/PencilIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ArrowsUpDownIcon from '../components/icons/ArrowsUpDownIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import QrCodeIcon from '../components/icons/QrCodeIcon';

type SortKey = keyof Product;
type SortDirection = 'asc' | 'desc';

// --- Reusable Form Components ---
const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }> = ({ label, error, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input {...props} className={`mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900`} />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
);

// --- Product Form Modal ---
const ProductForm: React.FC<{ product?: Product; onSave: (product: Omit<Product, 'id'> | Product) => void; onCancel: () => void }> = ({ product, onSave, onCancel }) => {
    const { currentTenant } = useContext(DataContext);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        brand: product?.brand || '',
        sku: product?.sku || '',
        barcode: product?.barcode || '',
        category: product?.category || 'Retail',
        stock: product?.stock || 0,
        reorderLevel: product?.reorderLevel || 0,
        price: product?.price || 0,
        cost: product?.cost || 0,
        supplierId: product?.supplierId || '',
        isActive: product?.isActive === undefined ? true : product.isActive,
        description: product?.description || '',
        expiryDate: product?.expiryDate ? product.expiryDate.split('T')[0] : '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            // Ensure empty date string is saved as undefined to clear the date
            expiryDate: formData.expiryDate || undefined, 
        };
        onSave(product ? { ...product, ...dataToSave } : dataToSave);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Product Name *" name="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                <FormInput label="Brand" name="brand" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} />
                <FormInput label="SKU" name="sku" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                <FormInput label="Barcode" name="barcode" value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} />
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <select name="category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as 'Retail' | 'Professional' })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900" required>
                        <option value="Retail">Retail</option>
                        <option value="Professional">Professional</option>
                    </select>
                </div>
                <FormInput label="Stock *" name="stock" type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: +e.target.value })} required />
                <FormInput label="Reorder Level *" name="reorderLevel" type="number" value={formData.reorderLevel} onChange={e => setFormData({ ...formData, reorderLevel: +e.target.value })} required />
                <FormInput label="Price (Selling) *" name="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: +e.target.value })} required />
                <FormInput label="Cost (Purchase) *" name="cost" type="number" step="0.01" value={formData.cost} onChange={e => setFormData({ ...formData, cost: +e.target.value })} required />
                <div>
                    <label className="block text-sm font-medium text-gray-700">Supplier</label>
                    <select name="supplierId" value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900">
                        <option value="">Select Supplier</option>
                        {currentTenant?.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-rose-pink focus:border-rose-pink text-gray-900" />
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-rose-pink text-white font-semibold rounded-lg">{product ? 'Save Changes' : 'Add Product'}</button>
            </div>
        </form>
    );
};


const InventoryPage: React.FC = () => {
    const { currentTenant, updateTenantData, addToast } = useContext(DataContext);
    
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);

    const [isScannerOpen, setIsScannerOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ stockStatus: 'all', category: 'all' });
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'name', direction: 'asc' });

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredProducts = useMemo(() => {
        if (!currentTenant) return [];
        let products = [...currentTenant.inventory];
        
        // Filtering
        products = products.filter(p => {
            const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase());
            const stockMatch = filters.stockStatus === 'all' || (filters.stockStatus === 'low' && p.stock <= p.reorderLevel) || (filters.stockStatus === 'in' && p.stock > p.reorderLevel);
            const categoryMatch = filters.category === 'all' || p.category === filters.category;
            return searchMatch && stockMatch && categoryMatch;
        });

        // Sorting
        if (sortConfig !== null) {
            products.sort((a, b) => {
                const valA = a[sortConfig.key];
                const valB = b[sortConfig.key];
                
                if (valA === null || valA === undefined) return 1;
                if (valB === null || valB === undefined) return -1;
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return products;
    }, [currentTenant, searchTerm, filters, sortConfig]);

    const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
        if (!currentTenant) return;
        if ('id' in productData) { // Editing
            const updatedInventory = currentTenant.inventory.map(p => p.id === productData.id ? productData : p);
            updateTenantData(currentTenant.id, { inventory: updatedInventory });
            addToast('Product updated successfully!', 'success');
        } else { // Adding
            const newProduct: Product = { id: `p${Date.now()}`, ...productData };
            updateTenantData(currentTenant.id, { inventory: [...currentTenant.inventory, newProduct] });
            addToast('Product added successfully!', 'success');
        }
        setIsProductModalOpen(false);
    };

    const handleScanSuccess = (decodedText: string) => {
        setSearchTerm(decodedText);
        setIsScannerOpen(false);
        addToast(`Scanned: ${decodedText}`, 'info');
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
                <button onClick={() => { setEditingProduct(undefined); setIsProductModalOpen(true); }} className="px-5 py-2.5 bg-rose-pink text-white font-semibold rounded-lg shadow-md hover:bg-rose-pink/90 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add New Product
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by name, brand, SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button onClick={() => setIsScannerOpen(true)} className="p-2 border rounded-lg hover:bg-gray-100 text-gray-600">
                    <QrCodeIcon className="w-5 h-5" />
                </button>
                <select value={filters.stockStatus} onChange={e => setFilters({...filters, stockStatus: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="all">All Stock Status</option>
                    <option value="low">Low Stock</option>
                    <option value="in">In Stock</option>
                </select>
                <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="all">All Categories</option>
                    <option value="Retail">Retail</option>
                    <option value="Professional">Professional</option>
                </select>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            {['name', 'sku', 'category', 'stock', 'expiryDate', 'price', 'cost'].map(key => (
                                <th key={key} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer" onClick={() => handleSort(key as SortKey)}>
                                    <span className="flex items-center gap-2 capitalize">{key.replace(/([A-Z])/g, ' $1')} <ArrowsUpDownIcon className="w-4 h-4" /></span>
                                </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredProducts.map(p => {
                             const thirtyDaysFromNow = new Date();
                             thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                             const isExpiringSoon = p.expiryDate && new Date(p.expiryDate) < thirtyDaysFromNow && new Date(p.expiryDate) > new Date();

                            return (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono">{p.sku || 'N/A'}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${p.category === 'Retail' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{p.category}</span></td>
                                    <td className="px-6 py-4 font-bold text-gray-800">
                                        <div className="flex items-center gap-2">
                                            {p.stock} {p.stock <= p.reorderLevel && <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" titleAccess="Low Stock" />}
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 ${isExpiringSoon ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                        {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-CA') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">${p.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-gray-600">${p.cost.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => { setViewingProduct(p); setIsDetailModalOpen(true); }} className="font-medium text-rose-pink hover:underline mr-4">Details</button>
                                        <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="p-2 text-gray-500 hover:text-gray-800"><PencilIcon className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                 </table>
            </div>

            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'} size="2xl">
                <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={() => setIsProductModalOpen(false)} />
            </Modal>
            
            <ProductDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} product={viewingProduct} />

            <Modal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} title="Scan Barcode/QR Code">
                <BarcodeScanner onScanSuccess={handleScanSuccess} onScanError={(err) => console.log(err)} />
            </Modal>
        </div>
    );
};

export default InventoryPage;