import { useState } from 'react';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import StatusBadge from '../shared/StatusBadge';
import Pagination from '../shared/Pagination';
import EmptyState from '../shared/EmptyState';

const ITEMS_PER_PAGE = 10;

const TransactionTable = ({ transactions = [], onView, onEdit, onDelete }) => {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...transactions].sort((a, b) => {
    let aVal = a[sortKey], bVal = b[sortKey];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const SortIcon = ({ col }) => (
    <span className="ml-1 text-gray-400">
      {sortKey === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  if (transactions.length === 0) {
    return <EmptyState title="No transactions found" description="Try adjusting your filters or add a new transaction." />;
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                { key: 'ref', label: 'Reference' },
                { key: 'customerName', label: 'Customer' },
                { key: 'sourceTZS', label: 'Amount (TZS)' },
                { key: 'destRMB', label: 'Amount (RMB)' },
                { key: 'status', label: 'Status' },
                { key: 'createdAt', label: 'Date/Time' },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className="text-left px-4 py-3 font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                >
                  {label}<SortIcon col={key} />
                </th>
              ))}
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((tx) => (
              <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{tx.ref}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{tx.customerName || tx.customer}</td>
                <td className="px-4 py-3 text-gray-700">{formatCurrency(tx.sourceTZS, 'TZS')}</td>
                <td className="px-4 py-3 text-gray-700">¥{parseFloat(tx.destRMB || 0).toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(tx.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button onClick={() => onView(tx)} className="p-1 text-gray-400 hover:text-primary-600 rounded transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(tx)} className="p-1 text-gray-400 hover:text-amber-600 rounded transition-colors">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(tx)} className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default TransactionTable;
