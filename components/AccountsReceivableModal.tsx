import React, { useState, useEffect } from 'react';

interface AccountsReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReceivableEntry {
  id: string;
  customerName: string;
  invoiceId: string;
  amount: number;
  dueDate: string;
  paymentDate: string;
  status: 'outstanding' | 'paid' | 'overdue' | 'written_off';
  notes: string;
  createdAt: string;
}

const AccountsReceivableModal: React.FC<AccountsReceivableModalProps> = ({ isOpen, onClose }) => {
  const [receivableEntries, setReceivableEntries] = useState<ReceivableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'paid' | 'overdue' | 'written_off'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchReceivableEntries();
    }
  }, [isOpen]);

  const fetchReceivableEntries = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to fetch accounts receivable data
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: ReceivableEntry[] = [
        {
          id: '1',
          customerName: 'John Smith',
          invoiceId: 'INV-2024-001',
          amount: 172.50,
          dueDate: '2024-11-30',
          paymentDate: '2024-11-15',
          status: 'paid',
          notes: 'Payment received via bank transfer',
          createdAt: '2024-11-01'
        },
        {
          id: '2',
          customerName: 'Sarah Johnson',
          invoiceId: 'INV-2024-002',
          amount: 230.00,
          dueDate: '2024-11-25',
          paymentDate: '',
          status: 'outstanding',
          notes: 'Follow up call scheduled for next week',
          createdAt: '2024-11-05'
        },
        {
          id: '3',
          customerName: 'Mike Davis',
          invoiceId: 'INV-2024-003',
          amount: 86.25,
          dueDate: '2024-11-10',
          paymentDate: '',
          status: 'overdue',
          notes: 'Multiple reminder emails sent',
          createdAt: '2024-10-28'
        },
        {
          id: '4',
          customerName: 'Emma Wilson',
          invoiceId: 'INV-2024-004',
          amount: 145.75,
          dueDate: '2024-12-15',
          paymentDate: '',
          status: 'outstanding',
          notes: 'New customer - payment expected soon',
          createdAt: '2024-11-08'
        }
      ];

      setReceivableEntries(mockData);
    } catch (error) {
      console.error('Error fetching receivable entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = receivableEntries.filter(entry => {
    if (filter === 'all') return true;
    return entry.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'outstanding': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'written_off': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'written_off') return false;
    return new Date(dueDate) < new Date();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h3 className="text-2xl font-semibold text-gray-800">Accounts Receivable</h3>
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
            <h3 className="text-lg font-semibold text-gray-800">Accounts Receivable</h3>
            <p className="text-sm text-gray-600">Track outstanding customer payments</p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAddReceivableModal'))}
            className="px-4 py-2 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Receivable
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
              onClick={() => setFilter('outstanding')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'outstanding' ? 'bg-rose-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Outstanding
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className={`hover:bg-gray-50 ${isOverdue(entry.dueDate, entry.status) && entry.status !== 'paid' ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.invoiceId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${entry.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.dueDate).toLocaleDateString()}
                        {isOverdue(entry.dueDate, entry.status) && entry.status !== 'paid' && (
                          <span className="ml-2 text-red-500 text-xs">(Overdue)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.paymentDate ? new Date(entry.paymentDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={entry.notes}>
                        {entry.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredEntries.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No accounts receivable entries found</p>
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

export default AccountsReceivableModal;