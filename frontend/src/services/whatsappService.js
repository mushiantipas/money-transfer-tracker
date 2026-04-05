import api from './api';

export const getMessages = (params) => api.get('/whatsapp/messages', { params });
export const resendMessage = (id) => api.post(`/whatsapp/messages/${id}/resend`);
export const getTemplates = () => api.get('/whatsapp/templates');
export const createTemplate = (data) => api.post('/whatsapp/templates', data);
export const updateTemplate = (id, data) => api.put(`/whatsapp/templates/${id}`, data);
export const deleteTemplate = (id) => api.delete(`/whatsapp/templates/${id}`);
