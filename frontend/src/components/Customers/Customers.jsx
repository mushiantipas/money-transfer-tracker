import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import CustomerList from './CustomerList';
import CustomerForm from './CustomerForm';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';

const SAMPLE_CUSTOMERS = [
  { id: 1, name: 'Ali Hassan', phone: '+255712345678', email: 'ali@gmail.com', wechatId: 'ali_hassan', status: 'active', transactionCount: 12 },
  { id: 2, name: 'Fatuma Said', phone: '+255787654321', email: 'fatuma@gmail.com', wechatId: 'fatuma_s', status: 'active', transactionCount: 8 },
  { id: 3, name: 'John Mwangi', phone: '+255765432198', email: 'john.m@gmail.com', wechatId: '', status: 'active', transactionCount: 5 },
  { id: 4, name: 'Mary Juma', phone: '+255745678901', email: '', wechatId: 'mary_j', status: 'inactive', transactionCount: 3 },
  { id: 5, name: 'Ahmed Rashid', phone: '+255756789012', email: 'ahmed@gmail.com', wechatId: 'ahmed_r', status: 'active', transactionCount: 15 },
];

const Customers = () => {
  const [customers, setCustomers] = useState(SAMPLE_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleSubmit = (data) => {
    if (editCustomer) {
      setCustomers(prev => prev.map(c => c.id === editCustomer.id ? { ...c, ...data } : c));
      toast.success('Customer updated!');
    } else {
      setCustomers(prev => [...prev, { ...data, id: Date.now(), transactionCount: 0 }]);
      toast.success('Customer added!');
    }
    setShowForm(false);
    setEditCustomer(null);
  };

  const handleDelete = () => {
    setCustomers(prev => prev.filter(c => c.id !== deleteCustomer.id));
    toast.success('Customer deleted!');
    setDeleteCustomer(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{filtered.length} customer(s)</p>
        <button onClick={() => { setEditCustomer(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="card">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input max-w-sm"
        />
      </div>

      <div className="card p-4">
        <CustomerList
          customers={filtered}
          onEdit={(c) => { setEditCustomer(c); setShowForm(true); }}
          onDelete={setDeleteCustomer}
        />
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditCustomer(null); }}
        title={editCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <CustomerForm
          onSubmit={handleSubmit}
          defaultValues={editCustomer || {}}
          onCancel={() => { setShowForm(false); setEditCustomer(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteCustomer}
        onClose={() => setDeleteCustomer(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${deleteCustomer?.name}? This will also affect their transaction history.`}
      />
    </div>
  );
};

export default Customers;
