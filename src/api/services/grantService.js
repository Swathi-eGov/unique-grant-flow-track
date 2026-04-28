import apiClient from '../client';

const BASE = '/api/grants';

export const grantService = {
  list:   ()          => apiClient.get(BASE).then(r => r.data),
  get:    (id)        => apiClient.get(`${BASE}/${id}`).then(r => r.data),
  create: (data)      => apiClient.post(BASE, data).then(r => r.data),
  update: (id, data)  => apiClient.put(`${BASE}/${id}`, data).then(r => r.data),
  delete: (id)        => apiClient.delete(`${BASE}/${id}`),
  filter: (params)    => apiClient.get(BASE, { params }).then(r => r.data),

  // child resources
  tranches:     (id) => apiClient.get(`${BASE}/${id}/tranches`).then(r => r.data),
  deliverables: (id) => apiClient.get(`${BASE}/${id}/deliverables`).then(r => r.data),
  milestones:   (id) => apiClient.get(`${BASE}/${id}/milestones`).then(r => r.data),
  reporting:    (id) => apiClient.get(`${BASE}/${id}/reporting`).then(r => r.data),
};
