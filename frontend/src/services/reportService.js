import api from './api';

export const getReport = (type, params) => api.get(`/reports/${type}`, { params });
export const exportReport = (type, format, params) =>
  api.get(`/reports/${type}/export`, { params: { ...params, format }, responseType: 'blob' });
