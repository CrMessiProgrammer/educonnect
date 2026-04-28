import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Trophy, Medal, Loader2, ChevronDown, BookOpen } from 'lucide-react';

export function RankingProfessor() {
  const { user } = useAuthStore();
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>('');

  const { data: turmas, isLoading: loadingTurmas } = useQuery({
    queryKey: ['minhas-turmas-ranking', user?.id],
    queryFn: async () => {
      const response = await api.get(`/api/Professor/${user?.id}/minhas-turmas`);
      return response.data;
    },
    enabled: !!user?.id
  });

  const { data: ranking, isLoading: loadingRanking } = useQuery({
    queryKey: ['ranking-turma', turmaSelecionada],
    queryFn: async () => {
      const response = await api.get(`/api/Ranking/turma/${turmaSelecionada}`);
      return response.data;
    },
    enabled: !!turmaSelecionada
  });

  useEffect(() => {
    if (turmas?.length > 0 && !turmaSelecionada) setTurmaSelecionada(turmas[0].id);
  }, [turmas]);

  const getMedalha = (posicao: number) => {
    switch (posicao) {
      case 1: return <Trophy className="text-amber-400 drop-shadow-md" size={32} />;
      case 2: return <Medal className="text-slate-300 drop-shadow-md" size={28} />;
      case 3: return <Medal className="text-orange-400 drop-shadow-md" size={28} />;
      default: return <span className="text-slate-400 font-bold w-8 text-center">{posicao}º</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Trophy className="text-indigo-500" /> Ranking Acadêmico
          </h2>
          <p className="text-slate-500 mt-1">Desempenho dos alunos nas suas turmas vinculadas.</p>
        </div>

        <div className="w-full md:w-72 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Escolher Turma</label>
          <div className="relative">
            <select
              value={turmaSelecionada}
              onChange={(e) => setTurmaSelecionada(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 pl-4 pr-10 outline-none focus:border-indigo-500 transition-all font-medium cursor-pointer"
            >
              {turmas?.map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>
      </header>

      {!turmaSelecionada ? (
         <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center">
            <BookOpen size={40} className="text-indigo-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Carregando suas turmas...</h3>
         </div>
      ) : loadingRanking ? (
        <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="animate-spin mr-2" /> Calculando...</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Desempenho: {ranking?.turmaNome}</h3>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 w-24 text-center">Posição</th>
                <th className="px-6 py-4">Nome do Aluno</th>
                <th className="px-6 py-4 text-right">Média Geral</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {ranking?.alunos.map((aluno: any) => (
                <tr 
                    key={aluno.alunoNome} 
                    className={`transition-colors ${aluno.posicao <= 3 ? 'bg-amber-50/30 dark:bg-amber-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/20'}`}
                  >
                    <td className="px-6 py-4 flex justify-center items-center">
                      {getMedalha(aluno.posicao)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                      {aluno.alunoNome}
                      {aluno.posicao <= 3 && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full">
                          Top {aluno.posicao}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-extrabold text-base ${aluno.mediaGeral >= 7 ? 'text-emerald-600 dark:text-emerald-400' : aluno.mediaGeral >= 5 ? 'text-amber-500' : 'text-red-500'}`}>
                        {aluno.mediaGeral.toFixed(1).replace('.', ',')}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}