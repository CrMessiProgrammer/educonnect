import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CreditCard, Download, QrCode, Loader2, Receipt, CheckCircle2, Copy, Zap, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFilhoStore } from '../../store/useFilhoStore';

export function FinanceiroResponsavel() {
  const queryClient = useQueryClient();
  const { filhoId, filhoNome } = useFilhoStore();

  const [faturaSelecionada, setFaturaSelecionada] = useState<any>(null);
  const [dadosPix, setDadosPix] = useState<{ copiaECola: string, valor: number, transacaoId: string } | null>(null);
  const [pagamentoAprovado, setPagamentoAprovado] = useState(false);

  const { data: faturas, isLoading } = useQuery({
    queryKey: ['extrato-responsavel'],
    queryFn: async () => (await api.get('/api/Financeiro/meu-extrato')).data
  });

  // 1. Mude a Mutation para usar o novo endpoint de transação existente
  const mutation = useMutation({
    mutationFn: async (fatura: any) => {
      // Pegamos o ID da fatura (que na verdade é uma Transacao)
      const resp = await api.post(`/api/Pagamento/gerar-pix-existente/${fatura.id}`);
      return resp.data; 
    },
    onSuccess: (data, variables) => {
      setFaturaSelecionada(variables); // Guarda qual fatura estamos pagando
      setDadosPix({ 
        copiaECola: data.pixCopiaECola, 
        valor: data.valor, 
        transacaoId: data.transacaoId 
      });
      toast.success("Código PIX gerado!");
    }
  });

  // 2. No Webhook, garanta que ele limpe o estado após o sucesso
  const webhookMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/Pagamento/webhook-simulador/${dadosPix?.transacaoId}`);
    },
    onSuccess: () => {
      setPagamentoAprovado(true);
      toast.success("Pagamento aprovado!");
      // Atualiza a lista da tabela para sumir o botão de pagar
      queryClient.invalidateQueries({ queryKey: ['extrato-responsavel'] });
    }
  });

  const copiarPix = () => {
    if (dadosPix) {
      navigator.clipboard.writeText(dadosPix.copiaECola);
      toast.success("PIX copiado!");
    }
  };

  const voltarParaExtrato = () => {
    setFaturaSelecionada(null);
    setDadosPix(null);
    setPagamentoAprovado(false);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

  // TELA 3: SUCESSO (CENTRALIZADO)
  if (pagamentoAprovado && faturaSelecionada) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto mt-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 size={40} />
            </div>
            
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-3 tracking-tight">
              Pedido Confirmado!
            </h3>
            
            <p className="text-slate-500">
                O pagamento foi aprovado e a escola já está preparando o uniforme. <br/>
                O recibo foi enviado para o seu e-mail.
            </p>

            <button
                onClick={voltarParaExtrato}
                className="mt-8 px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm flex items-center gap-2 cursor-pointer"
            >
                <ArrowLeft size={18} /> Voltar para o Financeiro
            </button>
        </div>
      </div>
    );
  }

  // TELA 2: PAGAMENTO
  if (dadosPix && faturaSelecionada) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto mt-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <QrCode size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Pagamento via PIX</h2>
                <p className="text-slate-500 text-sm mb-8 px-4">Utilize o PIX Copia e Cola para pagar esta fatura.</p>

                <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-700 text-left space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-500 text-sm font-medium">Valor a Pagar</span>
                    <span className="text-3xl font-bold text-slate-800 dark:text-white leading-none">R$ {dadosPix.valor.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50 space-y-1">
                    <p className="text-xs text-slate-500 flex justify-between"><span>Descrição:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{faturaSelecionada.descricao}</span></p>
                  </div>
                </div>

                <div className="w-full relative mb-6">
                  <div className="w-full p-4 pr-12 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 break-all select-all font-mono text-left h-24 overflow-y-auto custom-scrollbar">
                      {dadosPix.copiaECola}
                  </div>
                  <button onClick={copiarPix} title="Copiar PIX" className="absolute right-2 top-2 p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
                      <Copy size={18} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
                    <button 
                        onClick={voltarParaExtrato} 
                        className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex justify-center items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm gap-2 cursor-pointer"
                    >
                        <ArrowLeft size={16} /> Voltar
                    </button>
                    
                    <button 
                        onClick={() => webhookMutation.mutate()} 
                        disabled={webhookMutation.isPending}
                        className="flex-[2] py-3 px-4 bg-emerald-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-600 transition-all text-sm disabled:opacity-70 shadow-sm shadow-emerald-500/20 cursor-pointer"
                    >
                        {webhookMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                        Simular Pagamento
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // TELA 1: LISTA
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CreditCard className="text-indigo-500" /> Financeiro
          </h2>
          <p className="text-slate-500 mt-1">Gestão de mensalidades e cobranças</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-semibold border-b dark:border-slate-700 uppercase tracking-tighter">
              <tr>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-center">Vencimento</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {faturas?.map((f: any) => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500">
                        <Receipt size={18} />
                      </div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{f.descricao}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">{f.data}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      f.status === 'Pago' 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-800 dark:text-white">{f.valor}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {f.status !== 'Pago' && (
                        <button 
                          type="button"
                          onClick={() => mutation.mutate(f)}
                          disabled={mutation.isPending}
                          className="p-2.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer"
                          title="Gerar Código PIX"
                        >
                          {mutation.isPending ? (
                          <><Loader2 className="animate-spin" size={18} /> Gerando Pedido...</>
                          ) : (
                          <><QrCode size={18} /></>
                          )}
                        </button>
                      )}
                        <button
                          className="p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-xl hover:bg-slate-200 cursor-pointer transition-all"
                          title="Baixar Fatura (PDF)"
                        >
                          <Download size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}