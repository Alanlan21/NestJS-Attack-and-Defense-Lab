import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - remover token
      localStorage.removeItem('access_token');
      // NÃO recarrega a página - deixa o AuthContext lidar com isso
    }
    return Promise.reject(error);
  },
);

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

  /**
   * Reset dashboard (modo apresentação)
   */
  async resetDashboard() {
    try {
      const response = await api.delete('/monitoring/reset');
      return response.data;
    } catch (error) {
      console.error('Error resetting dashboard:', error);
      throw error;
    }
  },
};

export default api;
