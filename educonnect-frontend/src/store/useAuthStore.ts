import { create } from 'zustand';

// 1. Cria a Interface do que o Store guarda
interface User {
  id: string;
  nome: string;
  tipo: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// 2. Avisa o Zustand (<AuthState>) qual é o formato
export const useAuthStore = create<AuthState>((set) => {
  // Pegando dados do LocalStorage de forma segura
  const storedUser = localStorage.getItem('@EduConnect:user');
  const initialUser = storedUser ? JSON.parse(storedUser) : null;

  return {
    user: initialUser,
    token: localStorage.getItem('@EduConnect:token') || null,
    
    login: (user, token) => {
      localStorage.setItem('@EduConnect:user', JSON.stringify(user));
      localStorage.setItem('@EduConnect:token', token);
      set({ user, token });
    },

    logout: () => {
      localStorage.removeItem('@EduConnect:user');
      localStorage.removeItem('@EduConnect:token');
      set({ user: null, token: null });
    }
  };
});