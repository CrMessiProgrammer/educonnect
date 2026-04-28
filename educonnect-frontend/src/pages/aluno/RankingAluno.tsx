import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Trophy, Medal, Loader2 } from 'lucide-react';

export function RankingAluno() {
  const { user } = useAuthStore();

  // 1. Precisamos saber a TurmaId do Aluno.
  const { data: alunoInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ['aluno-info', user?.id],
    queryFn: async () => {
      const response = await api.get(`/api/Aluno/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id
  });

  // 2. Busca o Ranking restrito (o backend já cuida do Top 5)
  const { data: ranking, isLoading: loadingRanking } = useQuery({
    queryKey: ['ranking-turma-aluno', alunoInfo?.turmaId],
    queryFn: async () => {
      const response = await api.get(`/api/Ranking/turma/${alunoInfo?.turmaId}`);
      return response.data;
    },
    enabled: !!alunoInfo?.turmaId
  });

  const getMedalha = (posicao: number) => {
    switch (posicao) {
      case 1: return <Trophy className="text-amber-400 drop-shadow-md" size={32} />;
      case 2: return <Medal className="text-slate-300 drop-shadow-md" size={28} />;
      case 3: return <Medal className="text-orange-400 drop-shadow-md" size={28} />;
      default: return <span className="text-slate-400 font-bold w-8 text-center">{posicao}º</span>;
    }
  };

  if (loadingInfo || loadingRanking) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Trophy className="text-indigo-500" /> Top 5 - Ranking Acadêmico
        </h2>
        <p className="text-slate-500 mt-1">Veja os alunos com melhor desempenho da sua classe.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">

        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Desempenho: {ranking?.turmaNome}</h3>
          </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold border-b dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 w-24 text-center">Posição</th>
              <th className="px-6 py-4">Nome do Aluno</th>
              <th className="px-6 py-4 text-right">Média Geral</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {ranking?.alunos?.map((aluno: any) => (
              <tr key={aluno.alunoNome} className={`transition-colors ${aluno.alunoNome === user?.nome ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/20'}`}>
                <td className="px-6 py-4 flex justify-center items-center">{getMedalha(aluno.posicao)}</td>
                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                  {aluno.alunoNome}
                  {aluno.alunoNome === user?.nome && <span className="ml-2 text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Você</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                    {aluno.mediaGeral.toFixed(1).replace('.', ',')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}