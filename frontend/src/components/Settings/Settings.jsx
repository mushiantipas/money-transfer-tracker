import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Settings = () => {
  const { register: regProfile, handleSubmit: handleProfile } = useForm({
    defaultValues: { name: 'Admin', email: 'admin@makomu.com', phone: '+255700000000' }
  });
  const { register: regApp, handleSubmit: handleApp } = useForm({
    defaultValues: { currency: 'TZS', timezone: 'Africa/Dar_es_Salaam', language: 'en', notifyWhatsApp: true, notifyEmail: false }
  });

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">User Profile</h3>
        <form onSubmit={handleProfile((data) => { toast.success('Profile saved!'); console.log(data); })} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input {...regProfile('name')} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input {...regProfile('email')} type="email" className="input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...regProfile('phone')} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Change Password</label>
            <input type="password" className="input" placeholder="New password..." />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">Save Profile</button>
          </div>
        </form>
      </div>

      {/* App Settings */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">App Settings</h3>
        <form onSubmit={handleApp((data) => { toast.success('Settings saved!'); console.log(data); })} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Default Currency</label>
              <select {...regApp('currency')} className="input">
                <option value="TZS">TZS</option>
                <option value="USD">USD</option>
                <option value="RMB">RMB</option>
              </select>
            </div>
            <div>
              <label className="label">Timezone</label>
              <select {...regApp('timezone')} className="input">
                <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam (EAT)</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
              </select>
            </div>
            <div>
              <label className="label">Language</label>
              <select {...regApp('language')} className="input">
                <option value="en">English</option>
                <option value="sw">Swahili</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <p className="label">Notifications</p>
            <label className="flex items-center gap-2 text-sm">
              <input {...regApp('notifyWhatsApp')} type="checkbox" className="rounded border-gray-300 text-primary-600" />
              Send WhatsApp notifications on transaction updates
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input {...regApp('notifyEmail')} type="checkbox" className="rounded border-gray-300 text-primary-600" />
              Send email alerts on rate changes
            </label>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">Save Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
