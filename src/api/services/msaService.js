import apiClient from '../client';

const BASE = '/api/msas';

export const msaService = {
  list:   ()         => apiClient.get(BASE).then(r => r.data),
  get:    (id)       => apiClient.get(`${BASE}/${id}`).then(r => r.data),
  create: (data)     => apiClient.post(BASE, data).then(r => r.data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data).then(r => r.data),
  delete: (id)       => apiClient.delete(`${BASE}/${id}`),
  filter: (params)   => apiClient.get(BASE, { params }).then(r => r.data),

  keyClauses: (id) => apiClient.get(`${BASE}/${id}/key-clauses`).then(r => r.data),
};
