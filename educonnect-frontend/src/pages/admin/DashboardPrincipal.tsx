import { Users, GraduationCap, DollarSign, Bell, Loader2, AlertCircle, AlertTriangle, History, LayoutDashboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Tipagem baseada no DashboardAdminDto do C#
interface AlunoRisco {
  nome: string;
  turma: string;
  motivo: string;
}

interface ReceitaGrafico {
  mes: string;
  receita: number;
}

interface DashboardData {
  totalAlunos: number;
  totalProfessores: number;
  matriculasPendentes: number;
  receitaMensal: number;
  mensalidadesEmAberto: number;
  comunicadosHoje: number;
  alunosEmRisco: AlunoRisco[];
  evolucaoReceita: ReceitaGrafico[];
}

export function DashboardPrincipal() {
  // A MÁGICA DO REACT QUERY ACONTECE AQUI
  const { data, isLoading, isError, error } = useQuery<DashboardData>({
    queryKey: ['dashboard-admin-data'], // O "nome" do cache
    queryFn: async () => {
      const response = await api.get('/api/Dashboard/admin');
      return response.data;
    }
  });

  // ESTADO DE CARREGAMENTO (Enquanto busca da API na 1ª vez)
  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 py-20">
        <Loader2 className="animate-spin" size={40} />
        <p>Calculando indicadores gerais...</p>
      </div>
    );
  }

  // ESTADO DE ERRO (Se a API cair ou der erro 500)
  if (isError) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex items-center gap-4 text-red-600">
        <AlertCircle size={32} />
        <div>
          <h3 className="font-bold">Erro ao carregar o dashboard</h3>
          <p className="text-sm">{error?.message}</p>
        </div>
      </div>
    );
  }

  const formatarMoeda = (valor?: number) => {
  return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // MAPEANDO OS DADOS REAIS DA API
  // O fallback "|| 0" garante que não quebre se vier nulo
  const stats = [
    { label: 'Total de Alunos', value: data?.totalAlunos || 0, icon: GraduationCap, color: 'text-blue-600' },
    { label: 'Professores Ativos', value: data?.totalProfessores || 0, icon: Users, color: 'text-indigo-600' },
    { label: 'Receita Mensal', value: formatarMoeda(data?.receitaMensal), icon: DollarSign, color: 'text-emerald-600' },
    { label: 'Matrículas Pendentes', value: data?.matriculasPendentes || 0, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Aguardando Pagamento', value: data?.mensalidadesEmAberto || 0, icon: History, color: 'text-amber-400' },
    { label: 'Avisos Hoje', value: data?.comunicadosHoje || 0, icon: Bell, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="text-indigo-500" />Visão Geral</h2>
        <p className="text-slate-500 dark:text-slate-400">Dados oficiais processados em tempo real do Livro-Razão.</p>
      </header>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item) => (
          <div key={item.label} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-900 ${item.color}`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ÁREA INFERIOR (Gráfico Real + Alunos em Risco) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO RECHARTS REAL (Ocupa 2/3 da tela em monitores grandes) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Evolução de Receita (Semestre)
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* É passado o 'data.evolucaoReceita' aqui */}
              <AreaChart data={data?.evolucaoReceita} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.3} />
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [formatarMoeda(value), 'Receita']} 
                />
                <Area type="monotone" dataKey="receita" stroke="#4f46e5" fill="#818cf8" fillOpacity={0.2} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ALUNOS EM RISCO (Ocupa 1/3 da tela) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
            <AlertTriangle size={20} /> Atenção Pedagógica
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {data?.alunosEmRisco?.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">
                Nenhum aluno com média ou frequência crítica.
              </p>
            ) : (
              data?.alunosEmRisco?.map((aluno, idx) => (
                <div key={idx} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                  <p className="font-bold text-slate-800 dark:text-white text-sm">{aluno.nome}</p>
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className="text-slate-500">{aluno.turma}</span>
                    <span className="text-red-600 dark:text-red-400 font-semibold">{aluno.motivo}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}