import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

const RateCard = ({ from, to, rate, change, changePercent }) => {
  const isUp = change >= 0;
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{from} → {to}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{rate}</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
          {isUp ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
          {Math.abs(changePercent).toFixed(2)}%
        </div>
      </div>
      <p className="text-xs text-gray-400">
        Change: {isUp ? '+' : ''}{change} today
      </p>
    </div>
  );
};

const RatesDisplay = ({ rates = {} }) => {
  const defaultRates = {
    tzsToUsd: rates?.tzsToUsd ?? 0.000388,
    usdToUsdt: rates?.usdToUsdt ?? 0.998,
    usdtToRmb: rates?.usdtToRmb ?? 7.26,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <RateCard from="TZS" to="USD" rate={defaultRates.tzsToUsd.toFixed(6)} change={0.000002} changePercent={0.52} />
      <RateCard from="USD" to="USDT" rate={defaultRates.usdToUsdt.toFixed(4)} change={-0.002} changePercent={-0.2} />
      <RateCard from="USDT" to="RMB" rate={defaultRates.usdtToRmb.toFixed(4)} change={0.03} changePercent={0.41} />
    </div>
  );
};

export default RatesDisplay;
