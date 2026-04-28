import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useFilhoStore } from '../../store/useFilhoStore';
import { Users, ChevronRight, GraduationCap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MeusFilhos() {
  const setFilho = useFilhoStore((state) => state.setFilho);
  const navigate = useNavigate();

  const { data: filhos, isLoading } = useQuery({
    queryKey: ['meus-filhos'],
    queryFn: async () => (await api.get('/api/Responsavel/meus-filhos')).data
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="text-indigo-500" /> Meus Filhos
        </h2>
        <p className="text-slate-500 mt-1">Selecione um estudante para gerenciar as informações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filhos?.map((filho: any) => (
          <button
            key={filho.id}
            onClick={() => {
              setFilho(filho.id, filho.nome, filho.turmaId || "");
              navigate('/responsavel/dashboard');
            }}
            className="flex items-center justify-between p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-sm hover:shadow-md group text-left cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                {filho.nome.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-lg text-slate-800 dark:text-white">{filho.nome}</p>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <GraduationCap size={14} /> RA: {filho.ra} • {filho.turmaNome}
                </p>
              </div>
            </div>
            <ChevronRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}