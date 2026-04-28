import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useFilhoStore } from '../../store/useFilhoStore';
import { Trophy, Medal, AlertCircle } from 'lucide-react';

export function RankingResponsavel() {
  const { turmaId, filhoNome } = useFilhoStore();

  const { data: ranking, isLoading } = useQuery({
    queryKey: ['ranking-turma', turmaId],
    queryFn: async () => (await api.get(`/api/Ranking/turma/${turmaId}`)).data,
    enabled: !!turmaId
  });

  if (!turmaId) return (
    <div className="p-10 bg-amber-50 rounded-3xl border border-amber-200 text-amber-800 flex items-center gap-3">
      <AlertCircle /> Selecione um filho para ver o ranking da turma.
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex p-4 bg-amber-100 text-amber-600 rounded-full mb-4">
            <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-black italic">RANKING DA TURMA</h2>
        <p className="text-slate-500 uppercase tracking-widest text-sm">Turma: {ranking?.turmaNome}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border shadow-xl overflow-hidden">
        {ranking?.alunos.map((aluno: any, index: number) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-6 border-b last:border-0 ${aluno.alunoNome === filhoNome ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : ''}`}
          >
            <div className="flex items-center gap-6">
              <span className={`w-10 h-10 flex items-center justify-center rounded-full font-black text-lg
                ${index === 0 ? 'bg-amber-400 text-white shadow-lg' : 
                  index === 1 ? 'bg-slate-300 text-white' : 
                  index === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {index + 1}º
              </span>
              <div>
                <p className="font-bold text-lg text-slate-800 dark:text-white">
                    {aluno.alunoNome}
                    {aluno.alunoNome === filhoNome && <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-md uppercase">Seu Filho</span>}
                </p>
                <p className="text-sm text-slate-400">Desempenho Acadêmico</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-indigo-600">{aluno.mediaGeral.toFixed(2)}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Média Geral</p>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-center text-xs text-slate-400 italic">
        * Por questões de privacidade, apenas o Top 5 é exibido para alunos e responsáveis.
      </p>
    </div>
  );
}