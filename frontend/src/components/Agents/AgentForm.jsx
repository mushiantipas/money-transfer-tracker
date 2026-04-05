import { useForm } from 'react-hook-form';
import { required, isEmail, isPhone } from '../../utils/validators';

const AgentForm = ({ onSubmit, defaultValues = {}, loading = false, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input {...register('name', { validate: required })} className="input" placeholder="Agent name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Phone *</label>
          <input {...register('phone', { validate: { required, phone: isPhone } })} className="input" placeholder="+255..." />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input {...register('email', { validate: isEmail })} className="input" placeholder="email@example.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="label">Commission Rate (%)</label>
          <input {...register('commissionRate')} type="number" step="0.1" className="input" placeholder="e.g. 2.5" />
        </div>
        <div>
          <label className="label">Role</label>
          <select {...register('role')} className="input">
            <option value="agent">Agent</option>
            <option value="senior_agent">Senior Agent</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : 'Save Agent'}
        </button>
      </div>
    </form>
  );
};

export default AgentForm;
