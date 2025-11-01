import React, { useState, useEffect } from 'react';

interface SalesRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SalesEntry {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'overdue';
  paymentDate: string;
  createdAt: string;
}

const SalesRegisterModal: React.FC<SalesRegisterModalProps> = ({ isOpen, onClose }) => {
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchSalesEntries();
    }
  }, [isOpen]);

  const fetchSalesEntries = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to fetch sales data
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: SalesEntry[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          customerName: 'John Smith',
          amount: 150.00,
          taxAmount: 22.50,
          totalAmount: 172.50,
          paymentStatus: 'paid',
          paymentDate: '2024-11-15',
          createdAt: '2024-11-01'
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          customerName: 'Sarah Johnson',
          amount: 200.00,
          taxAmount: 30.00,
          totalAmount: 230.00,
          paymentStatus: 'pending',
          paymentDate: '',
          createdAt: '2024-11-05'
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          customerName: 'Mike Davis',
          amount: 75.00,
          taxAmount: 11.25,
          totalAmount: 86.25,
          paymentStatus: 'overdue',
          paymentDate: '',
          createdAt: '2024-10-28'
        }
      ];

      setSalesEntries(mockData);
    } catch (error) {
      console.error('Error fetching sales entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = salesEntries.filter(entry => {
    if (filter === 'all') return true;
    return entry.paymentStatus === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h3 className="text-2xl font-semibold text-gray-800">Sales Register</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div className="p-6 overflow-y-auto">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Sales Transactions</h3>
            <p className="text-sm text-gray-600">Manage your sales invoices and payments</p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAddSaleModal'))}
            className="px-4 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Sale
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-rose-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending' ? 'bg-rose-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'paid' ? 'bg-rose-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'overdue' ? 'bg-rose-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-pink"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.taxAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${entry.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.paymentStatus)}`}>
                          {entry.paymentStatus.charAt(0).toUpperCase() + entry.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.paymentDate || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No sales entries found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
        .modal-gradient-bg {
          background-color: #F7FAFC;
          background-image: radial-gradient(circle at 50% 50%, #e6f7ff, #f3e8ff, #fff2fb);
        }
      `}</style>
    </div>
  );
};

export default SalesRegisterModal;