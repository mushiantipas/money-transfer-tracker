import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const historicalData = [
  { date: '01/04', tzsUsd: 0.000385, usdtRmb: 7.22 },
  { date: '02/04', tzsUsd: 0.000387, usdtRmb: 7.24 },
  { date: '03/04', tzsUsd: 0.000384, usdtRmb: 7.23 },
  { date: '04/04', tzsUsd: 0.000389, usdtRmb: 7.25 },
  { date: '05/04', tzsUsd: 0.000388, usdtRmb: 7.26 },
  { date: '06/04', tzsUsd: 0.000391, usdtRmb: 7.28 },
  { date: '07/04', tzsUsd: 0.000388, usdtRmb: 7.27 },
];

const RateChart = () => (
  <div className="card">
    <h3 className="text-sm font-semibold text-gray-700 mb-4">Historical Rate Chart (Last 7 Days)</h3>
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={historicalData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} tickFormatter={(v) => v.toFixed(5)} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="tzsUsd" stroke="#3b82f6" strokeWidth={2} name="TZS/USD" dot={false} />
        <Line yAxisId="right" type="monotone" dataKey="usdtRmb" stroke="#10b981" strokeWidth={2} name="USDT/RMB" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default RateChart;
