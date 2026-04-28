import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Trophy, Medal, Award, Loader2, ChevronDown, BookOpen } from 'lucide-react';

interface Turma {
  id: string;
  nome: string;
}

interface PosicaoRanking {
  posicao: number;
  alunoNome: string;
  mediaGeral: number;
}

interface RankingTurma {
  turmaNome: string;
  alunos: PosicaoRanking[];
}

export function RankingAcademico() {
  const [turmaSelecionadaId, setTurmaSelecionadaId] = useState<string>('');

  // 1. Busca as turmas para preencher o Select
  const { data: turmas, isLoading: loadingTurmas } = useQuery<Turma[]>({
    queryKey: ['turmas-select'],
    queryFn: async () => {
      const response = await api.get('/api/Turma');
      return response.data;
    }
  });

  // 2. Busca o ranking da turma selecionada
  const { data: ranking, isLoading: loadingRanking } = useQuery<RankingTurma>({
    queryKey: ['ranking', turmaSelecionadaId],
    queryFn: async () => {
      const response = await api.get(`/api/Ranking/turma/${turmaSelecionadaId}`);
      return response.data;
    },
    enabled: !!turmaSelecionadaId, // Só dispara a requisição se tiver uma turma selecionada
  });

  // Função para renderizar o ícone/cor da medalha dependendo da posição
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
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Trophy className="text-indigo-500" /> Ranking Acadêmico
          </h2>
          <p className="text-slate-500 mt-1">Acompanhe o desempenho geral dos alunos por turma.</p>
        </div>

        {/* Filtro de Turma */}
        <div className="w-full md:w-72 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Selecione a Turma</label>
          <div className="relative">
            <select
              value={turmaSelecionadaId}
              onChange={(e) => setTurmaSelecionadaId(e.target.value)}
              disabled={loadingTurmas}
              className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl py-3 pl-4 pr-10 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all font-medium disabled:opacity-50 cursor-pointer"
            >
              <option value="">Selecione...</option>
              {turmas?.map(turma => (
                <option key={turma.id} value={turma.id}>{turma.nome}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>
      </header>

      {/* Área Principal de Exibição */}
      {!turmaSelecionadaId ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={40} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Nenhuma turma selecionada</h3>
          <p className="text-slate-500 mt-1 max-w-sm">Escolha uma turma no filtro acima para visualizar o ranking de desempenho dos alunos.</p>
        </div>
      ) : loadingRanking ? (
        <div className="flex justify-center items-center h-64 text-slate-500">
          <Loader2 className="animate-spin mr-2" /> Calculando ranking...
        </div>
      ) : ranking?.alunos?.length === 0 ? (
         <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500">
            Nenhum aluno com notas registradas nesta turma ainda.
         </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Desempenho: {ranking?.turmaNome}</h3>
          </div>

          <div className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 w-24 text-center">Posição</th>
                  <th className="px-6 py-4">Nome do Aluno</th>
                  <th className="px-6 py-4 text-right">Média Geral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {ranking?.alunos.map((aluno) => (
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
        </div>
      )}
    </div>
  );
}