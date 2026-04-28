import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Loader2, AlertCircle, FileBarChart, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

interface RelatorioDesempenho {
  alunoId: string;
  alunoNome: string;
  mediaGeral: number;
  totalFaltas: number;
}

export function RelatorioGeral() {
  const { data: relatorios, isLoading, isError } = useQuery<RelatorioDesempenho[]>({
    queryKey: ['relatorio-geral'],
    queryFn: async () => {
      const response = await api.get('/api/Dashboard/relatorio-geral');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-slate-500">
        <Loader2 className="animate-spin" size={40} />
        <p>Gerando relatório consolidado...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl flex items-center gap-4">
        <AlertCircle size={32} />
        <p>Erro ao executar o relatório. Verifique a Stored Procedure no banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FileBarChart className="text-indigo-500" /> Relatório Geral de Desempenho
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Visão consolidada de notas e faltas de todos os alunos da instituição.</p>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4 text-center">Média Geral</th>
                <th className="px-6 py-4 text-center">Total de Faltas</th>
                <th className="px-6 py-4 text-center">Situação (Atenção)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {relatorios?.map((item) => {
                // Lógica de cores baseada em regras de negócio (Média < 6 é alerta)
                const isNotaBaixa = item.mediaGeral < 6;
                const isMuitasFaltas = item.totalFaltas > 15;

                return (
                  <tr key={item.alunoId} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {item.alunoNome}
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-md ${isNotaBaixa ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {isNotaBaixa ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                        {item.mediaGeral.toFixed(2)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center font-medium">
                      <span className={isMuitasFaltas ? 'text-red-600 font-bold' : ''}>
                        {item.totalFaltas}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      {(isNotaBaixa || isMuitasFaltas) ? (
                        <div className="flex justify-center" title="Atenção Pedagógica Necessária">
                          <AlertTriangle size={20} className="text-amber-500" />
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {relatorios?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Nenhum dado de desempenho encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}