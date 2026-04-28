import apiClient from './client';

export const authApi = {
  login: async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  register: async (email, password, fullName) => {
    const { data } = await apiClient.post('/auth/register', { email, password, fullName });
    localStorage.setItem('auth_token', data.token);
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isLoggedIn: () => !!localStorage.getItem('auth_token'),
};
