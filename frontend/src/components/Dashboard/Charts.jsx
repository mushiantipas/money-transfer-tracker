import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const dailyData = [
  { day: 'Mon', transactions: 12, amount: 8200000 },
  { day: 'Tue', transactions: 19, amount: 12400000 },
  { day: 'Wed', transactions: 8, amount: 5100000 },
  { day: 'Thu', transactions: 25, amount: 18700000 },
  { day: 'Fri', transactions: 31, amount: 24600000 },
  { day: 'Sat', transactions: 22, amount: 17800000 },
  { day: 'Sun', transactions: 14, amount: 9500000 },
];

const rateData = [
  { date: '01/04', tzsUsd: 0.00039, usdtRmb: 7.24 },
  { date: '02/04', tzsUsd: 0.00038, usdtRmb: 7.26 },
  { date: '03/04', tzsUsd: 0.00040, usdtRmb: 7.22 },
  { date: '04/04', tzsUsd: 0.00039, usdtRmb: 7.25 },
  { date: '05/04', tzsUsd: 0.00041, usdtRmb: 7.28 },
];

const agentData = [
  { name: 'Agent Ali', value: 35, profit: 450 },
  { name: 'Agent Fatuma', value: 28, profit: 380 },
  { name: 'Agent John', value: 22, profit: 290 },
  { name: 'Agent Mary', value: 15, profit: 120 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Charts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Transactions */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Transaction Volume</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Transactions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Exchange Rate Trends */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Exchange Rate Trends</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rateData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="tzsUsd" stroke="#3b82f6" strokeWidth={2} dot={false} name="TZS/USD" />
            <Line type="monotone" dataKey="usdtRmb" stroke="#10b981" strokeWidth={2} dot={false} name="USDT/RMB" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Profit by Agent */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Profit by Agent (USD)</h3>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={agentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="profit"
              >
                {agentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${v}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Amount */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Weekly Amount (TZS M)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
            <Tooltip formatter={(v) => `TZS ${(v/1000000).toFixed(1)}M`} />
            <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} name="Amount (TZS)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
