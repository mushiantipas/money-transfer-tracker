import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import RatesDisplay from './RatesDisplay';
import RateChart from './RateChart';

const ExchangeRates = () => {
  const [rates, setRates] = useState({ tzsToUsd: 0.000388, usdToUsdt: 0.998, usdtToRmb: 7.26 });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { register, handleSubmit } = useForm({ defaultValues: rates });

  const onSubmit = (data) => {
    setRates({
      tzsToUsd: parseFloat(data.tzsToUsd),
      usdToUsdt: parseFloat(data.usdToUsdt),
      usdtToRmb: parseFloat(data.usdtToRmb),
    });
    setLastUpdated(new Date());
    toast.success('Exchange rates updated!');
  };

  return (
    <div className="space-y-6">
      {/* Current Rates */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Current Exchange Rates</h2>
          <span className="text-xs text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
        <RatesDisplay rates={rates} />
      </div>

      {/* Update Form */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Update Exchange Rates</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">TZS → USD Rate</label>
              <input {...register('tzsToUsd')} type="number" step="0.000001" className="input" />
            </div>
            <div>
              <label className="label">USD → USDT Rate</label>
              <input {...register('usdToUsdt')} type="number" step="0.0001" className="input" />
            </div>
            <div>
              <label className="label">USDT → RMB Rate</label>
              <input {...register('usdtToRmb')} type="number" step="0.0001" className="input" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">Update Rates</button>
          </div>
        </form>
      </div>

      {/* Rate History Chart */}
      <RateChart />

      {/* Rate Alert Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-800 mb-1">⚠️ Rate Change Alerts</h4>
        <p className="text-sm text-amber-700">
          TZS/USD rate has increased by 0.52% today. USDT/RMB at 7.26 – monitor for further changes.
        </p>
      </div>
    </div>
  );
};

export default ExchangeRates;
