import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import OverviewCards from './OverviewCards';
import Charts from './Charts';
import RecentTransactions from './RecentTransactions';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Welcome back, Admin!</h2>
          <p className="text-sm text-gray-500">Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/transactions" className="btn-primary flex items-center gap-2 text-sm">
            <PlusIcon className="w-4 h-4" />
            New Transaction
          </Link>
          <Link to="/exchange-rates" className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowPathIcon className="w-4 h-4" />
            Update Rates
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Charts */}
      <Charts />

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
};

export default Dashboard;
