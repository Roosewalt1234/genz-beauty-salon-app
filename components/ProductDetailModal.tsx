import React, { useContext, useMemo } from 'react';
import Modal from './Modal';
import { Product, StockMovement } from '../types';
import { DataContext } from '../App';
import TrendingUpIcon from './icons/TrendingUpIcon';

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

const Stat: React.FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
        {icon && <div className="text-gray-500">{icon}</div>}
        <div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-lg font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const StockMovementRow: React.FC<{ movement: StockMovement }> = ({ movement }) => {
    const isStockIn = movement.type === 'in';
    return (
        <tr className="border-b border-gray-100">
            <td className="p-3 text-sm text-gray-700">{new Date(movement.date).toLocaleDateString()}</td>
            <td className="p-3 text-sm">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isStockIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {movement.type.toUpperCase()}
                </span>
            </td>
            <td className={`p-3 text-sm font-bold ${isStockIn ? 'text-green-600' : 'text-red-600'}`}>
                {isStockIn ? '+' : '-'}{movement.quantity}
            </td>
            <td className="p-3 text-sm text-gray-600">{movement.reason}</td>
            <td className="p-3 text-sm text-gray-500 italic">{movement.notes || '-'}</td>
        </tr>
    );
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product }) => {
    const { currentTenant } = useContext(DataContext);

    const relatedMovements = useMemo(() => {
        if (!product || !currentTenant) return [];
        return currentTenant.stockMovements
            .filter(m => m.productId === product.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [product, currentTenant]);

    if (!product) return null;

    const supplier = currentTenant?.suppliers.find(s => s.id === product.supplierId);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Product Details" size="3xl">
            <div className="space-y-6">
                {/* Header */}
                <div className="pb-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                    <p className="text-gray-500">{product.brand}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-semibold">{product.category}</span>
                        {product.sku && <span>SKU: <span className="font-mono text-gray-700">{product.sku}</span></span>}
                    </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Stat label="Current Stock" value={product.stock} />
                    <Stat label="Reorder Level" value={product.reorderLevel} />
                    <Stat label="Selling Price" value={`$${product.price.toFixed(2)}`} />
                    <Stat label="Purchase Cost" value={`$${product.cost.toFixed(2)}`} />
                </div>
                
                {/* Additional Info */}
                <div>
                     <h4 className="font-semibold text-gray-700 mb-2">Additional Information</h4>
                     <div className="text-sm space-y-2 text-gray-800 bg-gray-50 p-4 rounded-lg">
                        <p><strong>Description:</strong> {product.description || 'N/A'}</p>
                        <p><strong>Size/Volume:</strong> {product.size || 'N/A'}</p>
                        <p><strong>Supplier:</strong> {supplier?.name || 'N/A'}</p>
                        <p><strong>Expiry Date:</strong> {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</p>
                     </div>
                </div>

                {/* Stock Movement History */}
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrendingUpIcon className="w-5 h-5" />
                        Stock Movement History
                    </h3>
                    <div className="max-h-80 overflow-y-auto border rounded-lg">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                                    <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relatedMovements.length > 0 ? (
                                    relatedMovements.map(m => <StockMovementRow key={m.id} movement={m} />)
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center p-8 text-gray-500">No stock movements recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="flex justify-end pt-4">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Close</button>
                </div>
            </div>
        </Modal>
    );
};

export default ProductDetailModal;
