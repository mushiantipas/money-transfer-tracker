import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';

const CustomerList = ({ customers = [], onView, onEdit, onDelete }) => {
  if (customers.length === 0) {
    return <EmptyState title="No customers found" description="Add your first customer to get started." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">WeChat</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Transactions</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
              <td className="px-4 py-3 text-gray-600">{c.phone}</td>
              <td className="px-4 py-3 text-gray-600">{c.email || '-'}</td>
              <td className="px-4 py-3 text-gray-600">{c.wechatId || '-'}</td>
              <td className="px-4 py-3 text-center font-semibold text-primary-600">{c.transactionCount || 0}</td>
              <td className="px-4 py-3"><StatusBadge status={c.status || 'active'} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {onView && <button onClick={() => onView(c)} className="p-1 text-gray-400 hover:text-primary-600 rounded"><EyeIcon className="w-4 h-4" /></button>}
                  {onEdit && <button onClick={() => onEdit(c)} className="p-1 text-gray-400 hover:text-amber-600 rounded"><PencilIcon className="w-4 h-4" /></button>}
                  {onDelete && <button onClick={() => onDelete(c)} className="p-1 text-gray-400 hover:text-red-600 rounded"><TrashIcon className="w-4 h-4" /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
