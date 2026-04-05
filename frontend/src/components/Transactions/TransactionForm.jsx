import { useForm } from 'react-hook-form';
import { required, isPositiveNumber } from '../../utils/validators';

const TransactionForm = ({ onSubmit, defaultValues = {}, loading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Customer Name *</label>
          <input
            {...register('customerName', { validate: required })}
            className="input"
            placeholder="Enter customer name"
          />
          {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input {...register('phone')} className="input" placeholder="+255..." />
        </div>
        <div>
          <label className="label">Source Amount (TZS) *</label>
          <input
            {...register('sourceTZS', { validate: { required, positive: isPositiveNumber } })}
            type="number"
            className="input"
            placeholder="0"
          />
          {errors.sourceTZS && <p className="text-red-500 text-xs mt-1">{errors.sourceTZS.message}</p>}
        </div>
        <div>
          <label className="label">Destination Amount (RMB)</label>
          <input
            {...register('destRMB', { validate: isPositiveNumber })}
            type="number"
            className="input"
            placeholder="0"
          />
          {errors.destRMB && <p className="text-red-500 text-xs mt-1">{errors.destRMB.message}</p>}
        </div>
        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div>
          <label className="label">Agent</label>
          <input {...register('agent')} className="input" placeholder="Agent name" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea {...register('notes')} className="input" rows={3} placeholder="Optional notes..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
