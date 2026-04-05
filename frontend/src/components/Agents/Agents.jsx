import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AgentList from './AgentList';
import AgentForm from './AgentForm';
import Modal from '../shared/Modal';
import ConfirmDialog from '../shared/ConfirmDialog';

const SAMPLE_AGENTS = [
  { id: 1, name: 'Agent Ali', phone: '+255712345678', email: 'ali@makomu.com', role: 'senior_agent', commissionRate: 2.5, totalEarned: 1250, transactionCount: 45, status: 'active' },
  { id: 2, name: 'Agent Fatuma', phone: '+255787654321', email: 'fatuma@makomu.com', role: 'agent', commissionRate: 2.0, totalEarned: 890, transactionCount: 38, status: 'active' },
  { id: 3, name: 'Agent John', phone: '+255765432198', email: 'john@makomu.com', role: 'agent', commissionRate: 2.0, totalEarned: 650, transactionCount: 28, status: 'active' },
  { id: 4, name: 'Agent Mary', phone: '+255745678901', email: 'mary@makomu.com', role: 'agent', commissionRate: 1.5, totalEarned: 320, transactionCount: 15, status: 'inactive' },
];

const Agents = () => {
  const [agents, setAgents] = useState(SAMPLE_AGENTS);
  const [showForm, setShowForm] = useState(false);
  const [editAgent, setEditAgent] = useState(null);
  const [deleteAgent, setDeleteAgent] = useState(null);

  const handleSubmit = (data) => {
    if (editAgent) {
      setAgents(prev => prev.map(a => a.id === editAgent.id ? { ...a, ...data } : a));
      toast.success('Agent updated!');
    } else {
      setAgents(prev => [...prev, { ...data, id: Date.now(), totalEarned: 0, transactionCount: 0 }]);
      toast.success('Agent added!');
    }
    setShowForm(false);
    setEditAgent(null);
  };

  const handleDelete = () => {
    setAgents(prev => prev.filter(a => a.id !== deleteAgent.id));
    toast.success('Agent removed!');
    setDeleteAgent(null);
  };

  const totalCommission = agents.reduce((sum, a) => sum + (a.totalEarned || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{agents.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Agents</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{agents.filter(a => a.status === 'active').length}</p>
          <p className="text-xs text-gray-500 mt-1">Active</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-amber-600">${totalCommission.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total Commission</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-700">{agents.reduce((s, a) => s + (a.transactionCount || 0), 0)}</p>
          <p className="text-xs text-gray-500 mt-1">Total Transactions</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => { setEditAgent(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <PlusIcon className="w-4 h-4" />
          Add Agent
        </button>
      </div>

      <div className="card p-4">
        <AgentList
          agents={agents}
          onEdit={(a) => { setEditAgent(a); setShowForm(true); }}
          onDelete={setDeleteAgent}
        />
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditAgent(null); }}
        title={editAgent ? 'Edit Agent' : 'Add Agent'}
        size="lg"
      >
        <AgentForm
          onSubmit={handleSubmit}
          defaultValues={editAgent || {}}
          onCancel={() => { setShowForm(false); setEditAgent(null); }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteAgent}
        onClose={() => setDeleteAgent(null)}
        onConfirm={handleDelete}
        title="Remove Agent"
        message={`Are you sure you want to remove ${deleteAgent?.name}?`}
      />
    </div>
  );
};

export default Agents;
