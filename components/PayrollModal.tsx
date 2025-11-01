import React, { useState, useEffect } from 'react';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PayrollEntry {
  id: string;
  staffName: string;
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeAmount: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  netPay: number;
  paymentDate: string;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  notes: string;
}

const PayrollModal: React.FC<PayrollModalProps> = ({ isOpen, onClose }) => {
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');

  useEffect(() => {
    if (isOpen) {
      fetchPayrollEntries();
    }
  }, [isOpen]);

  const fetchPayrollEntries = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to fetch payroll data
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData: PayrollEntry[] = [
        {
          id: '1',
          staffName: 'Alice Johnson',
          payPeriodStart: '2024-11-01',
          payPeriodEnd: '2024-11-15',
          baseSalary: 2500.00,
          overtimeHours: 5.5,
          overtimeAmount: 206.25,
          bonuses: 100.00,
          deductions: 125.00,
          grossPay: 2681.25,
          netPay: 2556.25,
          paymentDate: '2024-11-16',
          paymentStatus: 'paid',
          notes: 'Regular bi-weekly payroll'
        },
        {
          id: '2',
          staffName: 'Bob Smith',
          payPeriodStart: '2024-11-01',
          payPeriodEnd: '2024-11-15',
          baseSalary: 2200.00,
          overtimeHours: 0,
          overtimeAmount: 0,
          bonuses: 0,
          deductions: 110.00,
          grossPay: 2200.00,
          netPay: 2090.00,
          paymentDate: '',
          paymentStatus: 'pending',
          notes: 'Awaiting approval'
        },
        {
          id: '3',
          staffName: 'Carol Davis',
          payPeriodStart: '2024-10-16',
          payPeriodEnd: '2024-10-31',
          baseSalary: 2000.00,
          overtimeHours: 12.0,
          overtimeAmount: 360.00,
          bonuses: 50.00,
          deductions: 105.00,
          grossPay: 2305.00,
          netPay: 2200.00,
          paymentDate: '2024-11-01',
          paymentStatus: 'paid',
          notes: 'Previous pay period'
        },
        {
          id: '4',
          staffName: 'David Wilson',
          payPeriodStart: '2024-11-01',
          payPeriodEnd: '2024-11-15',
          baseSalary: 1800.00,
          overtimeHours: 8.0,
          overtimeAmount: 216.00,
          bonuses: 75.00,
          deductions: 95.25,
          grossPay: 1995.75,
          netPay: 1900.50,
          paymentDate: '',
          paymentStatus: 'pending',
          notes: 'Includes performance bonus'
        }
      ];

      setPayrollEntries(mockData);
    } catch (error) {
      console.error('Error fetching payroll entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = payrollEntries.filter(entry => {
    if (filter === 'all') return true;
    return entry.paymentStatus === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h3 className="text-2xl font-semibold text-gray-800">Payroll Management</h3>
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
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'cancelled' ? 'bg-rose-pink text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Cancelled
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overtime</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonuses</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deductions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Pay</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Pay</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{entry.staffName}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.payPeriodStart).toLocaleDateString()} - {new Date(entry.payPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">${entry.baseSalary.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.overtimeHours}h (${entry.overtimeAmount.toFixed(2)})
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600">+${entry.bonuses.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600">-${entry.deductions.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${entry.grossPay.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-blue-600">${entry.netPay.toFixed(2)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.paymentStatus)}`}>
                          {entry.paymentStatus.charAt(0).toUpperCase() + entry.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
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

export default PayrollModal;