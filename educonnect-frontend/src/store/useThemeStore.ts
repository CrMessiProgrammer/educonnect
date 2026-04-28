import { create } from 'zustand';

// Tipa que o tema só pode ser essas duas strings
interface ThemeState {
  theme: 'light' | 'dark' | string;
  toggleTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: localStorage.getItem('@EduConnect:theme') || 'light',
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('@EduConnect:theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    return { theme: newTheme };
  }),

  initTheme: () => {
    const theme = localStorage.getItem('@EduConnect:theme') || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }
}));