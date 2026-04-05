import { InboxIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ title = 'No data found', description = '', action }) => (
  <div className="text-center py-12">
    <InboxIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
    <h3 className="text-sm font-medium text-gray-900">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
