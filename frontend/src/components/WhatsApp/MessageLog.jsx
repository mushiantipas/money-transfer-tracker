import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatDateTime } from '../../utils/formatters';
import StatusBadge from '../shared/StatusBadge';

const MessageLog = ({ messages = [], onResend }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Recipient</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Message</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Sent At</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
        </tr>
      </thead>
      <tbody>
        {messages.map((m) => (
          <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
            <td className="px-4 py-3 font-medium text-gray-900">{m.recipient}</td>
            <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{m.message}</td>
            <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
            <td className="px-4 py-3 text-gray-500">{formatDateTime(m.sentAt)}</td>
            <td className="px-4 py-3">
              {m.status !== 'delivered' && onResend && (
                <button onClick={() => onResend(m)} className="flex items-center gap-1 text-xs text-primary-600 hover:underline">
                  <ArrowPathIcon className="w-3 h-3" />
                  Resend
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MessageLog;
