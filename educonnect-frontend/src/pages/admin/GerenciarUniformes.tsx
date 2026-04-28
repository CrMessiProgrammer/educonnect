import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Shirt, Package, Truck, User, MapPin, Loader2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface PedidoUniforme {
  id: string;
  aluno: { nome: string };
  tamanho: string;
  peca: string;
  tipoEntrega: string;
  enderecoEntrega: string | null;
  status: 'Pendente' | 'Separado' | 'Entregue';
  dataPedido: string;
}

export function GerenciarUniformes() {
  const queryClient = useQueryClient();

  const { data: pedidos, isLoading } = useQuery<PedidoUniforme[]>({
    queryKey: ['uniformes-admin'],
    queryFn: async () => {
      const response = await api.get('/api/Uniforme');
      return response.data;
    }
  });

  const mutationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/api/Uniforme/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success('Status do uniforme atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['uniformes-admin'] });
    },
    onError: () => {
      toast.error('Erro ao atualizar o pedido.');
    }
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="animate-spin mr-2" /> Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Shirt className="text-indigo-500" /> Loja de Uniformes
        </h2>
        <p className="text-slate-500 mt-1">Gerencie as solicitações de uniformes e as entregas.</p>
      </header>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {pedidos?.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mb-4"><Package size={32} /></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhum pedido de uniforme</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4">Item Solicitado</th>
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4">Logística</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {pedidos?.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{pedido.peca}</p>
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-0.5 rounded">
                        Tamanho: {pedido.tamanho}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium flex items-center gap-2 mt-2">
                      <User size={14} className="text-slate-400" /> {pedido.aluno?.nome || 'Aluno Removido'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          {pedido.tipoEntrega === 'Retirada na Escola' ? <Package size={14} className="text-amber-500" /> : <Truck size={14} className="text-emerald-500" />}
                          {pedido.tipoEntrega}
                        </span>
                        {pedido.enderecoEntrega && (
                          <span className="text-xs text-slate-400 flex items-start gap-1 max-w-[200px] truncate" title={pedido.enderecoEntrega}>
                            <MapPin size={12} className="shrink-0 mt-0.5" /> {pedido.enderecoEntrega}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        pedido.status === 'Entregue' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        pedido.status === 'Separado' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {pedido.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {pedido.status === 'Pendente' && (
                          <button onClick={() => mutationStatus.mutate({ id: pedido.id, status: 'Separado' })} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                            Marcar Separado
                          </button>
                        )}
                        {pedido.status === 'Separado' && (
                          <button onClick={() => mutationStatus.mutate({ id: pedido.id, status: 'Entregue' })} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                            <Check size={14} /> Finalizar
                          </button>
                        )}
                      </div>
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