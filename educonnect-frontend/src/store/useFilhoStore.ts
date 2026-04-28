import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilhoState {
  filhoId: string | null;
  filhoNome: string | null;
  turmaId: string | null;
  setFilho: (id: string, nome: string, turmaId: string) => void;
  limparFilho: () => void;
}

export const useFilhoStore = create<FilhoState>()(
  persist(
    (set) => ({
      filhoId: null,
      filhoNome: null,
      turmaId: null,
      setFilho: (id, nome, turmaId) => set({ filhoId: id, filhoNome: nome, turmaId }),
      limparFilho: () => set({ filhoId: null, filhoNome: null, turmaId: null }),
    }),
    { name: 'selected-filho-storage' }
  )
);