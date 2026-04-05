const StatusBadge = ({ status }) => {
  const map = {
    pending: 'badge-pending',
    confirmed: 'badge-confirmed',
    completed: 'badge-completed',
    failed: 'badge-failed',
    sent: 'badge-confirmed',
    delivered: 'badge-completed',
    active: 'badge-completed',
    inactive: 'badge-failed',
  };
  const cls = map[status] || 'badge-pending';
  return <span className={cls}>{status?.charAt(0).toUpperCase() + status?.slice(1)}</span>;
};

export default StatusBadge;
