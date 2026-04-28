import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useFilhoStore } from '../../store/useFilhoStore';
import { Award, AlertCircle, TrendingUp, TrendingDown, Loader2, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function DashboardResponsavel() {
  const { filhoId, filhoNome } = useFilhoStore();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-filho', filhoId],
    queryFn: async () => (await api.get(`/api/Dashboard/aluno/${filhoId}`)).data,
    enabled: !!filhoId
  });

  if (!filhoId) return (
    <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl flex flex-col items-center gap-4 text-amber-800 text-center animate-in zoom-in duration-300">
      <AlertCircle size={48} />
      <div>
        <h3 className="text-xl font-black">Nenhum filho selecionado</h3>
        <p className="font-medium opacity-80">Por favor, escolha um estudante na aba <b>"Meus Filhos"</b> para ver os dados.</p>
      </div>
    </div>
  );

  if (isLoading) return <div className="flex justify-center p-12 text-slate-500"><Loader2 className="animate-spin" size={32} /></div>;

  const chartData = metrics?.ultimasNotas ? [...metrics.ultimasNotas].reverse().map((n: any) => ({
    name: n.disciplina.substring(0, 10),
    nota: n.valor
  })) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Visão do Responsável</p>
          <h2 className="text-3xl font-black mb-2">Monitorando: {filhoNome} 📖</h2>
          <p className="text-blue-50 font-medium">Confira abaixo o resumo do desempenho acadêmico e frequência.</p>
        </div>
        <BarChart3 size={160} className="absolute -right-10 -bottom-10 text-white opacity-10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-emerald-100 text-emerald-600 rotate-3 shadow-sm">
            <Award size={32} className="-rotate-3" />
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Média Geral</p>
          <p className="text-4xl font-black text-emerald-600">{metrics?.mediaGeral?.toFixed(1) || '0.0'}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-amber-100 text-amber-600 rotate-3 shadow-sm">
            <AlertCircle size={32} className="-rotate-3" />
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Faltas Acumuladas</p>
          <p className="text-4xl font-black text-slate-800 dark:text-white">{metrics?.faltasAcumuladas || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 overflow-y-auto max-h-[200px]">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wider">Desempenho Recente</h3>
          <ul className="space-y-3">
            {metrics?.ultimasNotas?.map((nota: any, index: number) => (
              <li key={index} className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0">
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{nota.disciplina}</span>
                <span className={`font-black px-2 py-0.5 rounded text-xs ${nota.valor >= 6 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {nota.valor.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 dark:text-white mb-6 text-lg">Evolução das Notas</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorNotaParent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="nota" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorNotaParent)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}