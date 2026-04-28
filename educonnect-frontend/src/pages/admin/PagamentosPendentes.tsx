import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { AlertCircle, Phone, User, Receipt, Loader2 } from 'lucide-react';

interface PagamentoPendente {
  transacaoId: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  responsavelNome: string;
  alunoNome: string;
  telefoneContato: string;
}

export function PagamentosPendentes() {
  const { data: pendentes, isLoading } = useQuery<PagamentoPendente[]>({
    queryKey: ['pagamentos-pendentes'],
    queryFn: async () => {
      const response = await api.get('/api/Pagamento/pendentes');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Carregando lista de inadimplência...
      </div>
    );
  }

  // Calcula o valor total a receber
  const totalReceber = pendentes?.reduce((acc, curr) => acc + curr.valor, 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Receipt className="text-indigo-500" /> Controle de Inadimplência
          </h2>
          <p className="text-slate-500 mt-1">Visão detalhada de transações aguardando pagamento.</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl text-right">
          <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase">Total a Receber</p>
          <p className="text-xl font-extrabold text-red-700 dark:text-red-300">
            {totalReceber.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {pendentes?.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhuma pendência financeira!</h3>
            <p className="text-slate-500">Todos os responsáveis estão em dia com a escola.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Descrição do Título</th>
                  <th className="px-6 py-4">Responsável</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Gerado Em</th>
                  <th className="px-6 py-4 text-right">Valor (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {pendentes?.map((item) => (
                  <tr key={item.transacaoId} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {item.descricao}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User size={14} className="text-slate-400" />
                      {item.responsavelNome}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                        <Phone size={14} />
                        {item.telefoneContato}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(item.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                      {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}