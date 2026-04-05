import { useState } from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import MessageLog from './MessageLog';

const SAMPLE_MESSAGES = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  recipient: `+25571${String(2345678 + i).padStart(7, '0')}`,
  message: [
    'Your transfer of TZS 2,000,000 (¥5,200) is confirmed. Ref: TXN-001',
    'Payment completed. Your recipient has received ¥3,120. Ref: TXN-003',
    'Transfer pending approval. We will notify you shortly. Ref: TXN-002',
  ][i % 3],
  status: ['sent', 'delivered', 'failed'][i % 3],
  sentAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

const TEMPLATES = [
  { id: 1, name: 'Transfer Confirmed', body: 'Your transfer of {amount_tzs} (¥{amount_rmb}) is confirmed. Ref: {ref}' },
  { id: 2, name: 'Payment Completed', body: 'Payment completed. Your recipient has received ¥{amount_rmb}. Ref: {ref}' },
  { id: 3, name: 'Transfer Pending', body: 'Transfer pending approval. We will notify you shortly. Ref: {ref}' },
];

const WhatsApp = () => {
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [filter, setFilter] = useState('');

  const stats = {
    total: messages.length,
    sent: messages.filter(m => m.status === 'sent').length,
    delivered: messages.filter(m => m.status === 'delivered').length,
    failed: messages.filter(m => m.status === 'failed').length,
  };

  const filtered = filter ? messages.filter(m => m.status === filter) : messages;

  const handleResend = (msg) => {
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'sent' } : m));
    toast.success(`Message resent to ${msg.recipient}`);
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Total Messages</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
          <p className="text-xs text-gray-500 mt-1">Sent</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
          <p className="text-xs text-gray-500 mt-1">Delivered</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
          <p className="text-xs text-gray-500 mt-1">Failed</p>
        </div>
      </div>

      {/* Filter */}
      <div className="card flex items-center gap-3">
        <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input max-w-xs">
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
        </select>
        <span className="text-sm text-gray-500">{filtered.length} messages</span>
      </div>

      {/* Message Log */}
      <div className="card p-4">
        <MessageLog messages={filtered} onResend={handleResend} />
      </div>

      {/* Templates */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Message Templates</h3>
        <div className="space-y-2">
          {TEMPLATES.map(t => (
            <div key={t.id} className="border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-800">{t.name}</p>
              <p className="text-xs text-gray-500 mt-1 font-mono">{t.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
