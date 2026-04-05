import { useState, useEffect, useCallback } from 'react';
import {
  ChatBubbleLeftIcon,
  BellIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import MessageLog from './MessageLog';
import api from '../../services/api';

// ---------------------------------------------------------------------------
// Notification trigger forms
// ---------------------------------------------------------------------------

const PaymentConfirmForm = ({ onSent }) => {
  const [form, setForm] = useState({
    customer_phone: '',
    customer_name: '',
    reference_number: '',
    source_amount: '',
    source_currency: 'TZS',
    destination_amount: '',
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/notifications/payment-confirmed', form);
      toast.success('Payment confirmation sent!');
      onSent && onSent();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Customer Phone *</label>
          <input name="customer_phone" value={form.customer_phone} onChange={handleChange} required className="input" placeholder="+255712345678" />
        </div>
        <div>
          <label className="label">Customer Name *</label>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} required className="input" placeholder="Ali Hassan" />
        </div>
        <div>
          <label className="label">Reference Number *</label>
          <input name="reference_number" value={form.reference_number} onChange={handleChange} required className="input" placeholder="TXN-001" />
        </div>
        <div>
          <label className="label">Source Currency</label>
          <select name="source_currency" value={form.source_currency} onChange={handleChange} className="input">
            <option value="TZS">TZS</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className="label">Source Amount *</label>
          <input name="source_amount" type="number" value={form.source_amount} onChange={handleChange} required className="input" placeholder="2000000" />
        </div>
        <div>
          <label className="label">Destination Amount (RMB)</label>
          <input name="destination_amount" type="number" value={form.destination_amount} onChange={handleChange} className="input" placeholder="5200" />
        </div>
      </div>
      <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 text-sm">
        <PaperAirplaneIcon className="w-4 h-4" />
        {sending ? 'Sending...' : 'Send Payment Confirmation'}
      </button>
    </form>
  );
};

const OrderCompleteForm = ({ onSent }) => {
  const [form, setForm] = useState({
    customer_phone: '',
    customer_name: '',
    reference_number: '',
    source_amount: '',
    source_currency: 'TZS',
    destination_amount: '',
    recipient_name: '',
    payment_method: 'WeChat',
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/notifications/order-completed', form);
      toast.success('Order completion message sent!');
      onSent && onSent();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Customer Phone *</label>
          <input name="customer_phone" value={form.customer_phone} onChange={handleChange} required className="input" placeholder="+255712345678" />
        </div>
        <div>
          <label className="label">Customer Name *</label>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} required className="input" placeholder="Ali Hassan" />
        </div>
        <div>
          <label className="label">Reference Number *</label>
          <input name="reference_number" value={form.reference_number} onChange={handleChange} required className="input" placeholder="TXN-001" />
        </div>
        <div>
          <label className="label">Recipient Name *</label>
          <input name="recipient_name" value={form.recipient_name} onChange={handleChange} required className="input" placeholder="Wang Wei" />
        </div>
        <div>
          <label className="label">Source Currency</label>
          <select name="source_currency" value={form.source_currency} onChange={handleChange} className="input">
            <option value="TZS">TZS</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label className="label">Source Amount</label>
          <input name="source_amount" type="number" value={form.source_amount} onChange={handleChange} className="input" placeholder="2000000" />
        </div>
        <div>
          <label className="label">Destination Amount (RMB)</label>
          <input name="destination_amount" type="number" value={form.destination_amount} onChange={handleChange} className="input" placeholder="5200" />
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select name="payment_method" value={form.payment_method} onChange={handleChange} className="input">
            <option value="WeChat">WeChat</option>
            <option value="Alipay">Alipay</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
      </div>
      <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 text-sm">
        <PaperAirplaneIcon className="w-4 h-4" />
        {sending ? 'Sending...' : 'Send Completion Message'}
      </button>
    </form>
  );
};

const ExchangeRateForm = ({ onSent }) => {
  const [form, setForm] = useState({
    tzs_usd_rate: '',
    usd_usdt_rate: '',
    usdt_rmb_rate: '',
    phone_numbers_raw: '',
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const phones = form.phone_numbers_raw
        ? form.phone_numbers_raw.split(',').map(p => p.trim()).filter(Boolean)
        : undefined;
      await api.post('/notifications/exchange-rate', {
        tzs_usd_rate:  parseFloat(form.tzs_usd_rate),
        usd_usdt_rate: parseFloat(form.usd_usdt_rate),
        usdt_rmb_rate: parseFloat(form.usdt_rmb_rate),
        phone_numbers: phones,
      });
      toast.success('Exchange rate update broadcast!');
      onSent && onSent();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to broadcast rates.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">TZS per 1 USD *</label>
          <input name="tzs_usd_rate" type="number" step="any" value={form.tzs_usd_rate} onChange={handleChange} required className="input" placeholder="2590" />
        </div>
        <div>
          <label className="label">USD per 1 USDT *</label>
          <input name="usd_usdt_rate" type="number" step="any" value={form.usd_usdt_rate} onChange={handleChange} required className="input" placeholder="0.998" />
        </div>
        <div>
          <label className="label">USDT per 1 RMB *</label>
          <input name="usdt_rmb_rate" type="number" step="any" value={form.usdt_rmb_rate} onChange={handleChange} required className="input" placeholder="7.24" />
        </div>
      </div>
      <div>
        <label className="label">Phone Numbers (comma-separated, leave blank to send to all customers)</label>
        <input name="phone_numbers_raw" value={form.phone_numbers_raw} onChange={handleChange} className="input" placeholder="+255712345678, +255787654321" />
      </div>
      <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 text-sm">
        <PaperAirplaneIcon className="w-4 h-4" />
        {sending ? 'Broadcasting...' : 'Broadcast Exchange Rates'}
      </button>
    </form>
  );
};

const DebtReminderForm = ({ onSent }) => {
  const [form, setForm] = useState({
    customer_phone: '',
    customer_name: '',
    debt_amount: '',
    debt_currency: 'TZS',
    due_date: '',
  });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/notifications/debt-reminder', form);
      toast.success('Debt reminder sent!');
      onSent && onSent();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reminder.');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Customer Phone *</label>
          <input name="customer_phone" value={form.customer_phone} onChange={handleChange} required className="input" placeholder="+255712345678" />
        </div>
        <div>
          <label className="label">Customer Name *</label>
          <input name="customer_name" value={form.customer_name} onChange={handleChange} required className="input" placeholder="Ali Hassan" />
        </div>
        <div>
          <label className="label">Debt Amount *</label>
          <input name="debt_amount" type="number" value={form.debt_amount} onChange={handleChange} required className="input" placeholder="500000" />
        </div>
        <div>
          <label className="label">Currency</label>
          <select name="debt_currency" value={form.debt_currency} onChange={handleChange} className="input">
            <option value="TZS">TZS</option>
            <option value="USD">USD</option>
            <option value="RMB">RMB</option>
          </select>
        </div>
        <div>
          <label className="label">Due Date</label>
          <input name="due_date" type="date" value={form.due_date} onChange={handleChange} className="input" />
        </div>
      </div>
      <button type="submit" disabled={sending} className="btn-primary flex items-center gap-2 text-sm">
        <PaperAirplaneIcon className="w-4 h-4" />
        {sending ? 'Sending...' : 'Send Debt Reminder'}
      </button>
    </form>
  );
};

// ---------------------------------------------------------------------------
// Main WhatsApp page
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'history',         label: 'Message History',      icon: ChatBubbleLeftIcon },
  { id: 'payment',         label: 'Payment Confirmed',    icon: CheckCircleIcon },
  { id: 'completion',      label: 'Order Completed',      icon: CheckCircleIcon },
  { id: 'exchange-rate',   label: 'Rate Update',          icon: CurrencyDollarIcon },
  { id: 'debt-reminder',   label: 'Debt Reminder',        icon: BellIcon },
];

const WhatsApp = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, sent: 0, delivered: 0, failed: 0 });
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications/history', { params: { limit: 100 } });
      setMessages(data);
      setStats({
        total:     data.length,
        sent:      data.filter(m => m.status === 'sent').length,
        delivered: data.filter(m => m.status === 'delivered').length,
        failed:    data.filter(m => m.status === 'failed').length,
      });
    } catch {
      // If backend is unavailable, keep empty state silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = filter ? messages.filter(m => m.status === filter) : messages;

  const normalised = filtered.map(m => ({
    id:        m.id,
    recipient: m.to_number,
    message:   m.body,
    status:    m.status,
    sentAt:    m.sent_at || m.created_at,
  }));

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

      {/* Tabs */}
      <div className="card p-0 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-700 bg-primary-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          {/* History tab */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
                <select value={filter} onChange={e => setFilter(e.target.value)} className="input max-w-xs">
                  <option value="">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
                <button onClick={fetchHistory} disabled={loading} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                  <ArrowPathIcon className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <span className="text-sm text-gray-500">{normalised.length} messages</span>
              </div>
              <MessageLog messages={normalised} onResend={null} />
            </div>
          )}

          {/* Payment confirmation tab */}
          {activeTab === 'payment' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Send a WhatsApp message to a customer confirming their payment has been received.
              </p>
              <PaymentConfirmForm onSent={fetchHistory} />
            </div>
          )}

          {/* Order completion tab */}
          {activeTab === 'completion' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Send a WhatsApp message when the RMB payout to the recipient in China is complete.
              </p>
              <OrderCompleteForm onSent={fetchHistory} />
            </div>
          )}

          {/* Exchange rate update tab */}
          {activeTab === 'exchange-rate' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Broadcast current TZS/USD → USDT → RMB exchange rates to customers via WhatsApp.
              </p>
              <ExchangeRateForm onSent={fetchHistory} />
            </div>
          )}

          {/* Debt reminder tab */}
          {activeTab === 'debt-reminder' && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Send an automated WhatsApp reminder when Makomu Exchange owes a customer money.
              </p>
              <DebtReminderForm onSent={fetchHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WhatsApp;
