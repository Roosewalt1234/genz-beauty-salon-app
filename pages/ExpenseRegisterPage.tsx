import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ExpenseEntry {
  id: string;
  expenseNumber: string;
  category: string;
  description: string;
  vendorName: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  paymentDate: string;
  createdAt: string;
}

const ExpenseRegisterPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to fetch expense data
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockExpenses: ExpenseEntry[] = [
        {
          id: '1',
          expenseNumber: 'EXP-2024-001',
          category: 'Office Supplies',
          description: 'Printer paper and ink cartridges',
          vendorName: 'Office Depot',
          amount: 120.00,
          taxAmount: 18.00,
          totalAmount: 138.00,
          paymentStatus: 'paid',
          paymentDate: '2024-11-15',
          createdAt: '2024-11-10'
        },
        {
          id: '2',
          expenseNumber: 'EXP-2024-002',
          category: 'Utilities',
          description: 'Monthly electricity bill',
          vendorName: 'Electric Company',
          amount: 250.00,
          taxAmount: 37.50,
          totalAmount: 287.50,
          paymentStatus: 'pending',
          paymentDate: '',
          createdAt: '2024-11-12'
        },
        {
          id: '3',
          expenseNumber: 'EXP-2024-003',
          category: 'Marketing',
          description: 'Facebook ads campaign',
          vendorName: 'Facebook Ads',
          amount: 500.00,
          taxAmount: 75.00,
          totalAmount: 575.00,
          paymentStatus: 'paid',
          paymentDate: '2024-11-08',
          createdAt: '2024-11-08'
        }
      ];

      setExpenses(mockExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filter === 'all') return true;
    return expense.paymentStatus === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);
  const paidExpenses = filteredExpenses.filter(expense => expense.paymentStatus === 'paid').length;
  const pendingExpenses = filteredExpenses.filter(expense => expense.paymentStatus === 'pending').length;
  const cancelledExpenses = filteredExpenses.filter(expense => expense.paymentStatus === 'cancelled').length;

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
          <h1 className="text-3xl font-bold text-gray-800">Expense Register</h1>
          <p className="text-gray-600 mt-1">Track and manage business expenses</p>
        </div>
        <Link
          to="/dashboard/accounting/expenses/new"
          className="px-6 py-3 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Expense
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-800">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidExpenses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingExpenses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-gray-600">{cancelledExpenses}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex gap-2">
            {(['all', 'pending', 'paid', 'cancelled'] as const).map(status => (
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

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {expense.expenseNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={expense.description}>
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.vendorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${expense.taxAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${expense.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(expense.paymentStatus)}`}>
                      {expense.paymentStatus.charAt(0).toUpperCase() + expense.paymentStatus.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.paymentDate ? new Date(expense.paymentDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No expense entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseRegisterPage;