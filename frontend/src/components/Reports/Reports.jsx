import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const transactionSummary = [
  { month: 'Jan', count: 120, amount: 240000000 },
  { month: 'Feb', count: 145, amount: 290000000 },
  { month: 'Mar', count: 132, amount: 264000000 },
  { month: 'Apr', count: 158, amount: 316000000 },
];

const revenueSummary = [
  { month: 'Jan', profit: 3200, commission: 1800 },
  { month: 'Feb', profit: 3850, commission: 2100 },
  { month: 'Mar', profit: 3500, commission: 1950 },
  { month: 'Apr', profit: 4200, commission: 2300 },
];

const agentPerformance = [
  { name: 'Agent Ali', transactions: 45, profit: 1250 },
  { name: 'Agent Fatuma', transactions: 38, profit: 890 },
  { name: 'Agent John', transactions: 28, profit: 650 },
  { name: 'Agent Mary', transactions: 15, profit: 320 },
];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('transactions');

  const tabs = [
    { id: 'transactions', label: 'Transaction Summary' },
    { id: 'revenue', label: 'Revenue Report' },
    { id: 'agents', label: 'Agent Performance' },
    { id: 'rates', label: 'Rate Analysis' },
  ];

  const handleExport = (format) => {
    alert(`Export to ${format} - This would generate a ${format} file in production`);
  };

  return (
    <div className="space-y-4">
      {/* Tab Bar + Export Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === t.id ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('CSV')} className="btn-secondary flex items-center gap-1 text-sm">
            <ArrowDownTrayIcon className="w-4 h-4" />
            CSV
          </button>
          <button onClick={() => handleExport('PDF')} className="btn-secondary flex items-center gap-1 text-sm">
            <ArrowDownTrayIcon className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Transaction Summary */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <p className="text-2xl font-bold text-primary-600">555</p>
              <p className="text-xs text-gray-500 mt-1">Total Transactions</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-teal-600">TZS 1.1B</p>
              <p className="text-xs text-gray-500 mt-1">Total Volume</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-green-600">$14,750</p>
              <p className="text-xs text-gray-500 mt-1">Total Profit</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-amber-600">138.75</p>
              <p className="text-xs text-gray-500 mt-1">Avg per Transaction</p>
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Monthly Transaction Count</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={transactionSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Revenue Report */}
      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs Commission (USD)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueSummary}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `$${v}`} />
                <Legend />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit (USD)" />
                <Bar dataKey="commission" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Commission (USD)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Agent Performance */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Agent Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Agent</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Transactions</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Profit Earned</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Avg per Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {agentPerformance.map((a) => (
                    <tr key={a.name} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 font-medium">{a.name}</td>
                      <td className="px-4 py-2.5 text-right">{a.transactions}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-green-600">${a.profit}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">${(a.profit / a.transactions).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Rate Analysis */}
      {activeTab === 'rates' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Rate Trends Analysis</h3>
            <p className="text-sm text-gray-500">
              TZS/USD average this month: 0.000388 | USDT/RMB average: 7.25
            </p>
            <div className="mt-4 space-y-2">
              {[
                { label: 'TZS/USD High', val: '0.000391', change: '+0.52%' },
                { label: 'TZS/USD Low', val: '0.000384', change: '-1.03%' },
                { label: 'USDT/RMB High', val: '7.28', change: '+0.41%' },
                { label: 'USDT/RMB Low', val: '7.22', change: '-0.41%' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium">{item.val}</span>
                    <span className={`text-xs ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{item.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
