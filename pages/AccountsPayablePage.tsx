import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface PayableEntry {
  id: string;
  vendorName: string;
  expenseNumber?: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: 'outstanding' | 'paid' | 'overdue' | 'cancelled';
  notes: string;
  createdAt: string;
}

const AccountsPayablePage: React.FC = () => {
  const [payables, setPayables] = useState<PayableEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'outstanding' | 'paid' | 'overdue' | 'cancelled'>('all');

  useEffect(() => {
    fetchPayables();
  }, []);

  const fetchPayables = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to fetch payables data
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockPayables: PayableEntry[] = [
        {
          id: '1',
          vendorName: 'Office Depot',
          expenseNumber: 'EXP-2024-001',
          amount: 138.00,
          dueDate: '2024-11-20',
          paymentDate: '2024-11-18',
          status: 'paid',
          notes: 'Paid via check #1234',
          createdAt: '2024-11-10'
        },
        {
          id: '2',
          vendorName: 'Electric Company',
          expenseNumber: 'EXP-2024-002',
          amount: 287.50,
          dueDate: '2024-11-25',
          status: 'outstanding',
          notes: 'Monthly utility bill',
          createdAt: '2024-11-12'
        },
        {
          id: '3',
          vendorName: 'Facebook Ads',
          expenseNumber: 'EXP-2024-003',
          amount: 575.00,
          dueDate: '2024-11-15',
          status: 'overdue',
          notes: 'Marketing campaign payment',
          createdAt: '2024-11-08'
        }
      ];

      setPayables(mockPayables);
    } catch (error) {
      console.error('Error fetching payables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayables = payables.filter(payable => {
    if (filter === 'all') return true;
    return payable.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'outstanding': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  };

  const totalPayables = filteredPayables.reduce((sum, payable) => sum + payable.amount, 0);
  const paidPayables = filteredPayables.filter(payable => payable.status === 'paid').length;
  const outstandingPayables = filteredPayables.filter(payable => payable.status === 'outstanding').length;
  const overduePayables = filteredPayables.filter(payable => payable.status === 'overdue' || isOverdue(payable.dueDate, payable.status)).length;

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
          <h1 className="text-3xl font-bold text-gray-800">Accounts Payable</h1>
          <p className="text-gray-600 mt-1">Manage vendor payments and outstanding bills</p>
        </div>
        <Link
          to="/dashboard/accounting/payables/new"
          className="px-6 py-3 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Payable
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Payables</p>
          <p className="text-2xl font-bold text-gray-800">${totalPayables.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidPayables}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Outstanding</p>
          <p className="text-2xl font-bold text-blue-600">{outstandingPayables}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{overduePayables}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex gap-2">
            {(['all', 'outstanding', 'paid', 'overdue', 'cancelled'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-rose-pink text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payables Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense #
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
              {filteredPayables.map(payable => (
                <tr key={payable.id} className={`hover:bg-gray-50 ${isOverdue(payable.dueDate, payable.status) && payable.status !== 'paid' ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {payable.vendorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payable.expenseNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${payable.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payable.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payable.status)}`}>
                      {payable.status.charAt(0).toUpperCase() + payable.status.slice(1)}
                    </span>
                    {isOverdue(payable.dueDate, payable.status) && payable.status !== 'paid' && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payable.paymentDate ? new Date(payable.paymentDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={payable.notes}>
                    {payable.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayables.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payable entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountsPayablePage;