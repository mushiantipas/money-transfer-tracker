export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  failed: 'Failed',
};

export const CURRENCIES = {
  TZS: 'TZS',
  USD: 'USD',
  USDT: 'USDT',
  RMB: 'RMB',
};

export const ITEMS_PER_PAGE = 10;
