import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { formatCurrency } from '../../utils/formatters';

const AgentList = ({ agents = [], onEdit, onDelete }) => {
  if (agents.length === 0) return <EmptyState title="No agents found" />;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Commission %</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Total Earned</th>
            <th className="text-center px-4 py-3 font-medium text-gray-600">Transactions</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
              <td className="px-4 py-3 text-gray-600">{a.phone}</td>
              <td className="px-4 py-3 text-gray-600 capitalize">{a.role?.replace('_', ' ')}</td>
              <td className="px-4 py-3 text-right text-gray-700">{a.commissionRate}%</td>
              <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(a.totalEarned, 'USD')}</td>
              <td className="px-4 py-3 text-center font-semibold text-primary-600">{a.transactionCount || 0}</td>
              <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {onEdit && <button onClick={() => onEdit(a)} className="p-1 text-gray-400 hover:text-amber-600 rounded"><PencilIcon className="w-4 h-4" /></button>}
                  {onDelete && <button onClick={() => onDelete(a)} className="p-1 text-gray-400 hover:text-red-600 rounded"><TrashIcon className="w-4 h-4" /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AgentList;
