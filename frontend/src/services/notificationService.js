import api from './api';

export const sendPaymentConfirmation = (data) =>
  api.post('/notifications/payment-confirmed', data);

export const sendOrderCompletion = (data) =>
  api.post('/notifications/order-completed', data);

export const sendExchangeRateUpdate = (data) =>
  api.post('/notifications/exchange-rate', data);

export const sendDebtReminder = (data) =>
  api.post('/notifications/debt-reminder', data);

export const getNotificationHistory = (params) =>
  api.get('/notifications/history', { params });

export const getDebts = (params) =>
  api.get('/debts', { params });

export const createDebt = (data) =>
  api.post('/debts', data);

export const settleDebt = (id) =>
  api.patch(`/debts/${id}/settle`);
