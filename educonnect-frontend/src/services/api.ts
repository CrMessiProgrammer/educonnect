import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5063', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Injeta o Token JWT em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@EduConnect:token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});