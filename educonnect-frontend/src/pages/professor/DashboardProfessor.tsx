import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, BookOpen, CheckSquare, Loader2, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DashboardProfessor() {
  const { user } = useAuthStore();
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-professor', user?.id],
    queryFn: async () => {
      const response = await api.get(`/api/Dashboard/professor/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id
  });

  if (isLoading) return <div className="flex justify-center p-12 text-slate-500"><Loader2 className="animate-spin" size={32} /></div>;

  // 1. O chartData agora vem do 'data' da API
  const chartData = data?.mediaPorTurma || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Olá, Prof. {user?.nome?.split(' ')[0]}! 👋</h2>
          <p className="text-indigo-100 font-medium max-w-lg">Preparado para inspirar mentes hoje? Aqui está o resumo das suas turmas.</p>
        </div>
        <GraduationCap size={160} className="absolute -right-10 -bottom-10 text-white opacity-10 rotate-12" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl"><BookOpen size={28} /></div>
          <div><p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Minhas Turmas</p><p className="text-3xl font-black text-slate-800 dark:text-white">{data?.totalTurmas || 0}</p></div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl"><Users size={28} /></div>
          <div><p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Alunos Impactados</p><p className="text-3xl font-black text-slate-800 dark:text-white">{data?.alunosImpactados || 0}</p></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="p-4 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><CheckSquare size={28} /></div>
          <div><p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Diários Pendentes</p><p className="text-3xl font-black text-amber-600">{data?.avaliacoesPendentes || 0}</p></div>
        </div>
      </div>

      {/* NOVO GRÁFICO (RECHARTS) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-lg">Desempenho por Turma (Média)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="nome" // Note que agora o 'n' é minúsculo (padrão JSON)
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 12}} 
                dy={10} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 10]} dx={-10} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="media" radius={[6, 6, 0, 0]}>
                {
                  chartData.map((entry: any, index: number) => (
                    // Se a média for abaixo de 6, fica laranja, senão roxo
                    <Cell key={`cell-${index}`} fill={entry.media >= 6 ? '#8b5cf6' : '#f59e0b'} />
                  ))
                }
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}