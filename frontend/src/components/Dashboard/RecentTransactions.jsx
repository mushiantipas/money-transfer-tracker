import { Link } from 'react-router-dom';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import StatusBadge from '../shared/StatusBadge';

const sampleTransactions = [
  { id: 1, ref: 'TXN-001', customer: 'Ali Hassan', sourceTZS: 2000000, destRMB: 5200, status: 'completed', createdAt: new Date().toISOString() },
  { id: 2, ref: 'TXN-002', customer: 'Fatuma Said', sourceTZS: 3500000, destRMB: 9100, status: 'pending', createdAt: new Date().toISOString() },
  { id: 3, ref: 'TXN-003', customer: 'John Mwangi', sourceTZS: 1200000, destRMB: 3120, status: 'confirmed', createdAt: new Date().toISOString() },
  { id: 4, ref: 'TXN-004', customer: 'Mary Juma', sourceTZS: 5000000, destRMB: 13000, status: 'completed', createdAt: new Date().toISOString() },
];

const RecentTransactions = ({ transactions = sampleTransactions }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Recent Transactions</h3>
        <Link to="/transactions" className="text-sm text-primary-600 hover:underline">View all</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2 font-medium text-gray-500">Ref</th>
              <th className="text-left py-2 font-medium text-gray-500">Customer</th>
              <th className="text-right py-2 font-medium text-gray-500">TZS</th>
              <th className="text-right py-2 font-medium text-gray-500">RMB</th>
              <th className="text-left py-2 font-medium text-gray-500">Status</th>
              <th className="text-left py-2 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2.5 font-mono text-xs text-gray-600">{tx.ref}</td>
                <td className="py-2.5 text-gray-900">{tx.customer}</td>
                <td className="py-2.5 text-right text-gray-700">{formatCurrency(tx.sourceTZS, 'TZS')}</td>
                <td className="py-2.5 text-right text-gray-700">¥{tx.destRMB?.toLocaleString()}</td>
                <td className="py-2.5"><StatusBadge status={tx.status} /></td>
                <td className="py-2.5 text-gray-500">{formatDateTime(tx.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;
