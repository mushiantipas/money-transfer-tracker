import {
  ArrowsRightLeftIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatNumber } from '../../utils/formatters';

const cards = [
  {
    key: 'totalTransactions',
    label: "Today's Transactions",
    icon: ArrowsRightLeftIcon,
    color: 'bg-blue-500',
    format: (v) => formatNumber(v),
  },
  {
    key: 'totalTZS',
    label: 'Total Amount (TZS)',
    icon: BanknotesIcon,
    color: 'bg-teal-500',
    format: (v) => formatCurrency(v, 'TZS'),
  },
  {
    key: 'totalProfit',
    label: 'Total Profit (USD)',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500',
    format: (v) => formatCurrency(v, 'USD'),
  },
  {
    key: 'pendingCount',
    label: 'Pending Payments',
    icon: ClockIcon,
    color: 'bg-orange-500',
    format: (v) => formatNumber(v),
  },
];

const OverviewCards = ({ data = {} }) => {
  const sampleData = {
    totalTransactions: data?.totalTransactions ?? 24,
    totalTZS: data?.totalTZS ?? 48500000,
    totalProfit: data?.totalProfit ?? 1240.50,
    pendingCount: data?.pendingCount ?? 6,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, format }) => (
        <div key={key} className="card flex items-center gap-4">
          <div className={`${color} p-3 rounded-xl text-white shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{format(sampleData[key])}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
