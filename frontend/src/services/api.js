import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const securityAPI = {
  /**
   * Busca métricas do dashboard
   */
  async getDashboard() {
    try {
      const response = await api.get('/monitoring/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  },

  /**
   * Busca status do sistema
   */
  async getStatus() {
    try {
      const response = await api.get('/monitoring/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching status:', error);
      throw error;
    }
  },

  /**
   * Login (para futura autenticação)
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },
};

export default api;
