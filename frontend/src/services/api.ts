import axios from 'axios';
import { useAuthStore } from '../store/authStore';

/** Instancia de Axios con interceptores para JWT */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agregar token a cada request
api.interceptors.request.use((config) => {
  const { tokens } = useAuthStore.getState();
  if (tokens?.token) {
    config.headers.Authorization = `Bearer ${tokens.token}`;
  }
  return config;
});

// Interceptor: renovar token en caso de 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { tokens, setTokens, logout } = useAuthStore.getState();

      if (tokens?.refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', {
            refreshToken: tokens.refreshToken,
          });

          const newTokens = {
            token: res.data.data.token,
            refreshToken: res.data.data.refreshToken,
          };
          setTokens(newTokens);

          originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
          return api(originalRequest);
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api;
