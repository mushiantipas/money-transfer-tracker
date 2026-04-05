import api from './api';

export const getExchangeRates = () => api.get('/exchange-rates');
export const updateExchangeRates = (data) => api.put('/exchange-rates', data);
export const getRateHistory = (params) => api.get('/exchange-rates/history', { params });
