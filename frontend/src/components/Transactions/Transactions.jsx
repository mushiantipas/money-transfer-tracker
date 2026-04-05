import { useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import TransactionTable from './TransactionTable';
import TransactionForm from './TransactionForm';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';
import LoadingSpinner from '../shared/LoadingSpinner';

const SAMPLE_TRANSACTIONS = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  ref: `TXN-${String(i + 1).padStart(3, '0')}`,
  customerName: ['Ali Hassan', 'Fatuma Said', 'John Mwangi', 'Mary Juma', 'Ahmed Rashid'][i % 5],
  sourceTZS: (Math.random() * 5000000 + 500000).toFixed(0),
  destRMB: (Math.random() * 15000 + 1000).toFixed(2),
  status: ['pending', 'confirmed', 'completed', 'failed'][i % 4],
  agent: ['Agent Ali', 'Agent Fatuma', 'Agent John'][i % 3],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
}));

const Transactions = () => {
  const [transactions, setTransactions] = useState(SAMPLE_TRANSACTIONS);
  const [filtered, setFiltered] = useState(SAMPLE_TRANSACTIONS);
  const [loading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [viewTx, setViewTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    let result = transactions;
    if (search) result = result.filter(t =>
      t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      t.ref?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) result = result.filter(t => t.status === statusFilter);
    if (dateFrom) result = result.filter(t => new Date(t.createdAt) >= new Date(dateFrom));
    if (dateTo) result = result.filter(t => new Date(t.createdAt) <= new Date(dateTo + 'T23:59:59'));
    setFiltered(result);
  }, [transactions, search, statusFilter, dateFrom, dateTo]);

  const handleSubmit = (data) => {
    if (editTx) {
      setTransactions(prev => prev.map(t => t.id === editTx.id ? { ...t, ...data } : t));
      toast.success('Transaction updated!');
    } else {
      const newTx = {
        ...data,
        id: Date.now(),
        ref: `TXN-${String(transactions.length + 1).padStart(3, '0')}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions(prev => [newTx, ...prev]);
      toast.success('Transaction added!');
    }
    setShowForm(false);
    setEditTx(null);
  };

  const handleDelete = () => {
    setTransactions(prev => prev.filter(t => t.id !== deleteTx.id));
    toast.success('Transaction deleted!');
    setDeleteTx(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} transaction(s) found</p>
        <button onClick={() => { setEditTx(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" />
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <FunnelIcon className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search by name or ref..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input" placeholder="From date" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input" placeholder="To date" />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="p-4">
            <TransactionTable
              transactions={filtered}
              onView={setViewTx}
              onEdit={(tx) => { setEditTx(tx); setShowForm(true); }}
              onDelete={setDeleteTx}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTx(null); }}
        title={editTx ? 'Edit Transaction' : 'New Transaction'}
        size="lg"
      >
        <TransactionForm onSubmit={handleSubmit} defaultValues={editTx || {}} />
      </Modal>

      {/* View Modal */}
      {viewTx && (
        <Modal isOpen={!!viewTx} onClose={() => setViewTx(null)} title="Transaction Details" size="md">
          <div className="space-y-3 text-sm">
            {Object.entries(viewTx).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-gray-900 font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete transaction ${deleteTx?.ref}? This action cannot be undone.`}
      />
    </div>
  );
};

export default Transactions;
