import apiClient from '../client';

const BASE = '/api/sows';

export const sowService = {
  list:   ()         => apiClient.get(BASE).then(r => r.data),
  get:    (id)       => apiClient.get(`${BASE}/${id}`).then(r => r.data),
  create: (data)     => apiClient.post(BASE, data).then(r => r.data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data),
  delete: (id)       => apiClient.delete(`${BASE}/${id}`),
  filter: (params)   => apiClient.get(BASE, { params }).then(r => r.data),

  deliverables: (id) => apiClient.get(`${BASE}/${id}/deliverables`).then(r => r.data),
  invoices:     (id) => apiClient.get(`${BASE}/${id}/invoices`).then(r => r.data),
};
