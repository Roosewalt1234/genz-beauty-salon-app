import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AccountingDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingReceivables: 0,
    outstandingPayables: 0,
    pendingPayroll: 0
  });

  useEffect(() => {
    fetchAccountingStats();
  }, []);

  const fetchAccountingStats = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to fetch accounting stats
      // For now, we'll simulate the data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockStats = {
        totalSales: 45230.75,
        totalExpenses: 28341.20,
        netProfit: 16889.55,
        outstandingReceivables: 5678.90,
        outstandingPayables: 3245.67,
        pendingPayroll: 8920.00
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching accounting stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string;
    subtitle?: string;
    color: string;
    icon: string;
    linkTo?: string;
  }> = ({ title, value, subtitle, color, icon, linkTo }) => {
    const CardContent = () => (
      <div className={`bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg bg-gray-100`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    );

    if (linkTo) {
      return (
        <Link to={linkTo}>
          <CardContent />
        </Link>
      );
    }

    return <CardContent />;
  };

  const QuickActions = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/dashboard/accounting/sales"
          className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
        >
          <span className="text-2xl mr-3">💰</span>
          <span className="font-semibold text-blue-800">Add Sale</span>
        </Link>
        <Link
          to="/dashboard/accounting/expenses"
          className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
        >
          <span className="text-2xl mr-3">📊</span>
          <span className="font-semibold text-red-800">Add Expense</span>
        </Link>
        <Link
          to="/dashboard/accounting/receivables"
          className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
        >
          <span className="text-2xl mr-3">📈</span>
          <span className="font-semibold text-green-800">Add Receivable</span>
        </Link>
        <Link
          to="/dashboard/accounting/payables"
          className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200"
        >
          <span className="text-2xl mr-3">💳</span>
          <span className="font-semibold text-purple-800">Add Payable</span>
        </Link>
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold text-gray-800">Accounting Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your financial operations</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Sales"
          value={`$${stats.totalSales.toLocaleString()}`}
          subtitle="This month"
          color="border-blue-500"
          icon="💰"
          linkTo="/dashboard/accounting/sales"
        />
        <StatCard
          title="Total Expenses"
          value={`$${stats.totalExpenses.toLocaleString()}`}
          subtitle="This month"
          color="border-red-500"
          icon="📊"
          linkTo="/dashboard/accounting/expenses"
        />
        <StatCard
          title="Net Profit"
          value={`$${stats.netProfit.toLocaleString()}`}
          subtitle="This month"
          color="border-green-500"
          icon="📈"
        />
        <StatCard
          title="Outstanding Receivables"
          value={`$${stats.outstandingReceivables.toLocaleString()}`}
          subtitle="Awaiting payment"
          color="border-yellow-500"
          icon="⏳"
          linkTo="/dashboard/accounting/receivables"
        />
        <StatCard
          title="Outstanding Payables"
          value={`$${stats.outstandingPayables.toLocaleString()}`}
          subtitle="Due for payment"
          color="border-orange-500"
          icon="💳"
          linkTo="/dashboard/accounting/payables"
        />
        <StatCard
          title="Pending Payroll"
          value={`$${stats.pendingPayroll.toLocaleString()}`}
          subtitle="Ready for processing"
          color="border-purple-500"
          icon="👥"
          linkTo="/dashboard/accounting/payroll"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Sale recorded: $150.00</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Expense paid: $89.50</p>
                  <p className="text-xs text-gray-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Payment received: $250.00</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboardPage;