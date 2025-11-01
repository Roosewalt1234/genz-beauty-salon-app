import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface PayrollEntry {
  id: string;
  employeeName: string;
  employeeId: string;
  payPeriod: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  deductions: number;
  netPay: number;
  status: 'pending' | 'processed' | 'paid';
  paymentDate?: string;
  createdAt: string;
}

const PayrollPage: React.FC = () => {
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processed' | 'paid'>('all');

  useEffect(() => {
    fetchPayrollEntries();
  }, []);

  const fetchPayrollEntries = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to fetch payroll data
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockPayrollEntries: PayrollEntry[] = [
        {
          id: '1',
          employeeName: 'John Smith',
          employeeId: 'EMP001',
          payPeriod: 'November 1-15, 2024',
          baseSalary: 3000.00,
          overtimeHours: 10,
          overtimeRate: 45.00,
          overtimePay: 450.00,
          deductions: 300.00,
          netPay: 3150.00,
          status: 'paid',
          paymentDate: '2024-11-15',
          createdAt: '2024-11-10'
        },
        {
          id: '2',
          employeeName: 'Sarah Johnson',
          employeeId: 'EMP002',
          payPeriod: 'November 1-15, 2024',
          baseSalary: 2800.00,
          overtimeHours: 5,
          overtimeRate: 42.00,
          overtimePay: 210.00,
          deductions: 280.00,
          netPay: 2730.00,
          status: 'processed',
          paymentDate: '2024-11-15',
          createdAt: '2024-11-12'
        },
        {
          id: '3',
          employeeName: 'Mike Davis',
          employeeId: 'EMP003',
          payPeriod: 'November 1-15, 2024',
          baseSalary: 2500.00,
          overtimeHours: 0,
          overtimeRate: 37.50,
          overtimePay: 0.00,
          deductions: 250.00,
          netPay: 2250.00,
          status: 'pending',
          createdAt: '2024-11-14'
        }
      ];

      setPayrollEntries(mockPayrollEntries);
    } catch (error) {
      console.error('Error fetching payroll entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = payrollEntries.filter(entry => {
    if (filter === 'all') return true;
    return entry.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPayroll = filteredEntries.reduce((sum, entry) => sum + entry.netPay, 0);
  const paidEntries = filteredEntries.filter(entry => entry.status === 'paid').length;
  const processedEntries = filteredEntries.filter(entry => entry.status === 'processed').length;
  const pendingEntries = filteredEntries.filter(entry => entry.status === 'pending').length;

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
          <h1 className="text-3xl font-bold text-gray-800">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Process and manage employee payroll</p>
        </div>
        <Link
          to="/dashboard/accounting/payroll/new"
          className="px-6 py-3 bg-gradient-to-r from-rose-pink to-lavender-purple text-white rounded-lg hover:from-rose-pink/90 hover:to-lavender-purple/90 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Process Payroll
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Payroll</p>
          <p className="text-2xl font-bold text-gray-800">${totalPayroll.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paidEntries}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Processed</p>
          <p className="text-2xl font-bold text-blue-600">{processedEntries}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingEntries}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex gap-2">
            {(['all', 'pending', 'processed', 'paid'] as const).map(status => (
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

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pay Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overtime
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Pay
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
              {filteredEntries.map(entry => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{entry.employeeName}</div>
                    <div className="text-sm text-gray-500">{entry.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.payPeriod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${entry.baseSalary.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>${entry.overtimePay.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{entry.overtimeHours}h @ ${entry.overtimeRate}/hr</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${entry.deductions.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${entry.netPay.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.paymentDate ? new Date(entry.paymentDate).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payroll entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollPage;