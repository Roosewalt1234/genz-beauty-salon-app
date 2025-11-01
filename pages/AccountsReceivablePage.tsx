import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ReceivableEntry {
  id: string;
  customerName: string;
  invoiceNumber?: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'outstanding' | 'paid' | 'overdue' | 'written_off';
  notes: string;
  createdAt: string;
}

const AccountsReceivablePage: React.FC = () => {
  const [receivables, setReceivables] = useState<ReceivableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'paid' | 'overdue' | 'written_off'>('all');

  useEffect(() => {
    fetchReceivables();
  }, []);

  const fetchReceivables = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to fetch receivables data
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockReceivables: ReceivableEntry[] = [
        {
          id: '1',
          customerName: 'John Smith',
          invoiceNumber: 'INV-2024-001',
          amount: 172.50,
          dueDate: '2024-11-20',
          paymentDate: '2024-11-18',
          status: 'paid',
          notes: 'Payment received via bank transfer',
          createdAt: '2024-11-10'
        },
        {
          id: '2',
          customerName: 'Sarah Johnson',
          invoiceNumber: 'INV-2024-002',
          amount: 230.00,
          dueDate: '2024-11-25',
          status: 'outstanding',
          notes: 'Follow up call scheduled for next week',
          createdAt: '2024-11-12'
        },
        {
          id: '3',
          customerName: 'Mike Davis',
          invoiceNumber: 'INV-2024-003',
          amount: 86.25,
          dueDate: '2024-11-15',
          status: 'overdue',
          notes: 'Multiple reminder emails sent',
          createdAt: '2024-11-08'
        }
      ];

      setReceivables(mockReceivables);
    } catch (error) {
      console.error('Error fetching receivables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReceivables = receivables.filter(receivable => {
    if (filter === 'all') return true;
    return receivable.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'outstanding': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'written_off': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'written_off') return false;
    return new Date(dueDate) < new Date();
  };

  const totalReceivables = filteredReceivables.reduce((sum, receivable) => sum + receivable.amount, 0);
  const paidReceivables = filteredReceivables.filter(receivable => receivable.status === 'paid').length;
  const outstandingReceivables = filteredReceivables.filter(receivable => receivable.status === 'outstanding').length;
  const overdueReceivables = filteredReceivables.filter(receivable => receivable.status === 'overdue' || isOverdue(receivable.dueDate, receivable.status)).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-pink"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Accounts Receivable</h1>
          <p className="text-gray-600 mt-1">Track outstanding customer payments</p>
        </div>
        <Link
          to="/dashboard/accounting/receivables/new"
          className="px-6 py-3 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Receivable
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Receivables</p>
          <p className="text-2xl font-bold text-gray-800">${totalReceivables.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidReceivables}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-2xl font-bold text-blue-600">{outstandingReceivables}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{overdueReceivables}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex gap-2">
            {(['all', 'outstanding', 'paid', 'overdue', 'written_off'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-rose-pink text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Receivables Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceivables.map(receivable => (
                <tr key={receivable.id} className={`hover:bg-gray-50 ${isOverdue(receivable.dueDate, receivable.status) && receivable.status !== 'paid' ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {receivable.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receivable.invoiceNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${receivable.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(receivable.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(receivable.status)}`}>
                      {receivable.status.charAt(0).toUpperCase() + receivable.status.slice(1).replace('_', ' ')}
                    </span>
                    {isOverdue(receivable.dueDate, receivable.status) && receivable.status !== 'paid' && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receivable.paymentDate ? new Date(receivable.paymentDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={receivable.notes}>
                    {receivable.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReceivables.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No receivable entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsReceivablePage;