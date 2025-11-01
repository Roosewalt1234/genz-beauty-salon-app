import React, { useState, useEffect } from 'react';

interface AccountingDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountingStats {
  totalSales: number;
  totalExpenses: number;
  accountsReceivable: number;
  accountsPayable: number;
  pendingPayroll: number;
}

const AccountingDashboardModal: React.FC<AccountingDashboardModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AccountingStats>({
    totalSales: 0,
    totalExpenses: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
    pendingPayroll: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAccountingStats();
    }
  }, [isOpen]);

  const fetchAccountingStats = async () => {
    setLoading(true);
    try {
      // Here you would typically make API calls to fetch accounting data
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        totalSales: 45250.75,
        totalExpenses: 28950.25,
        accountsReceivable: 12890.50,
        accountsPayable: 7650.75,
        pendingPayroll: 15420.00
      });
    } catch (error) {
      console.error('Error fetching accounting stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-gradient-bg rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 animate-scale-in">
      <div className="flex justify-between items-center p-4 border-b border-gray-200/80">
        <h3 className="text-2xl font-semibold text-gray-800">Accounting Dashboard</h3>
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-pink"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-green-600">${stats.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-red-600">${stats.totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold text-blue-600">${(stats.totalSales - stats.totalExpenses).toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Accounts Receivable</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Outstanding Amount</span>
                    <span className="font-semibold text-orange-600">${stats.accountsReceivable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Overdue</span>
                    <span className="font-semibold text-red-600">$2,450.25</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Due This Month</span>
                    <span className="font-semibold text-blue-600">$8,340.25</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Accounts Payable</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Outstanding Amount</span>
                    <span className="font-semibold text-orange-600">${stats.accountsPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Due This Week</span>
                    <span className="font-semibold text-red-600">$1,250.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Due This Month</span>
                    <span className="font-semibold text-blue-600">$6,400.25</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payroll Summary */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Payroll Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">${stats.pendingPayroll.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Pending Payroll</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">$12,850.00</p>
                  <p className="text-sm text-gray-600">Paid This Month</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">15</p>
                  <p className="text-sm text-gray-600">Active Employees</p>
                </div>
              </div>
            </div>
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

export default AccountingDashboardModal;