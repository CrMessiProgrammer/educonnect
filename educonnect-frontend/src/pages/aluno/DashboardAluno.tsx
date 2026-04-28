import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Award, AlertCircle, TrendingUp, TrendingDown, Loader2, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardAluno() {
  const { user } = useAuthStore();
  
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-aluno', user?.id],
    queryFn: async () => {
      const response = await api.get(`/api/Dashboard/aluno/${user?.id}`);
      return response.data;
    },
    enabled: !!user?.id
  });

  if (isLoading) return <div className="flex justify-center p-12 text-slate-500"><Loader2 className="animate-spin" size={32} /></div>;

  const isMediaBoa = (data?.mediaGeral || 0) >= 6;

  // Pegamos as últimas notas reais, invertemos (para a mais antiga vir primeiro no gráfico)
  // e limitamos o nome da disciplina para não quebrar o layout
  const chartData = data?.ultimasNotas
    ? [...data.ultimasNotas].reverse().map((nota: any) => ({
        name: nota.disciplina.length > 10 ? `${nota.disciplina.substring(0, 10)}...` : nota.disciplina,
        nota: nota.valor,
      }))
    : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER ESTILIZADO (Igual ao do Prof) */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">Olá, {user?.nome?.split(' ')[0]}! 🚀</h2>
          <p className="text-blue-100 font-medium max-w-lg">Acompanhe seu progresso e veja como você está se saindo neste ano letivo.</p>
        </div>
        <BookOpen size={160} className="absolute -right-10 -bottom-10 text-white opacity-10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD PRINCIPAL (Média) - Agora menor e alinhado */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isMediaBoa ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'} rotate-3 shadow-sm`}>
            <Award size={32} className="-rotate-3" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Média Geral</p>
          <p className={`text-4xl font-black ${isMediaBoa ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {data?.mediaGeral.toFixed(1) || '0.0'}
          </p>
        </div>

        {/* CARD FALTAS */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-amber-100 text-amber-600 rotate-3 shadow-sm">
             <AlertCircle size={32} className="-rotate-3" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Faltas Acumuladas</p>
          <p className="text-4xl font-black text-slate-800 dark:text-white">{data?.faltasAcumuladas || 0}</p>
        </div>

        {/* ULTIMAS AVALIAÇÕES */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-y-auto max-h-[220px]">
           <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Últimas Notas</h3>
            {data?.ultimasNotas?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhuma nota.</p>
            ) : (
              <ul className="space-y-3">
                {data?.ultimasNotas.map((nota: any, index: number) => {
                  const boa = nota.valor >= 6;
                  return (
                    <li key={index} className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0 last:pb-0">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{nota.disciplina}</p>
                      </div>
                      <div className={`flex items-center gap-1 font-black px-2 py-0.5 rounded text-xs ${boa ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {boa ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {nota.valor.toFixed(1)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
        </div>
      </div>

      {/* NOVO GRÁFICO (RECHARTS) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
         <h3 className="font-bold text-slate-800 dark:text-white mb-6 text-lg">Desempenho nas Últimas Avaliações</h3>
         <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNota" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 10]} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="nota" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorNota)" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
}