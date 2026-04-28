import apiClient from '../client';

const BASE = '/api/settings';

export const settingsService = {
  get:    ()     => apiClient.get(BASE).then(r => r.data),
  update: (data) => apiClient.put(BASE, data).then(r => r.data),
};
