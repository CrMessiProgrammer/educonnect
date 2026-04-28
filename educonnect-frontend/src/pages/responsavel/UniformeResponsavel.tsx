import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useFilhoStore } from '../../store/useFilhoStore';
import { ShoppingBag, Loader2, CheckCircle2, QrCode, Copy, Zap, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export function UniformeResponsavel() {
  const { filhoId, filhoNome } = useFilhoStore();
  
  const [form, setForm] = useState({ 
    peca: 'Camisa', 
    tamanho: 'M', 
    tipoEntrega: 'Retirada na Escola', 
    enderecoEntrega: '' 
  });

  const [dadosPix, setDadosPix] = useState<{ copiaECola: string, valor: number, transacaoId: string } | null>(null);
  const [pagamentoAprovado, setPagamentoAprovado] = useState(false);

  const mutation = useMutation({
    mutationFn: async (dados: any) => {
      const respPedido = await api.post('/api/Uniforme/solicitar', { ...dados, alunoId: filhoId });
      const respPix = await api.post(`/api/Pagamento/gerar-pix-uniforme/${respPedido.data.pedidoId}`);
      return respPix.data; 
    },
    onSuccess: (data) => {
      setDadosPix({ copiaECola: data.pixCopiaECola, valor: data.valor, transacaoId: data.transacaoId });
      toast.success("Pedido gerado! Aguardando pagamento.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Erro ao processar solicitação.");
    }
  });

  const webhookMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/Pagamento/webhook-simulador/${dadosPix?.transacaoId}`);
    },
    onSuccess: () => {
      setPagamentoAprovado(true);
      toast.success("Pagamento aprovado!");
    }
  });

  const copiarPix = () => {
    if (dadosPix) {
      navigator.clipboard.writeText(dadosPix.copiaECola);
      toast.success("PIX copiado para a área de transferência!");
    }
  };

  if (!filhoId) return (
    <div className="flex justify-center p-12 text-slate-500 animate-in fade-in">
        <div className="text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
            <p>Selecione um filho no topo para acessar a loja.</p>
        </div>
    </div>
  );

  // TELA 3: SUCESSO (Após simular pagamento)
  if (pagamentoAprovado) {
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
                onClick={() => window.location.reload()}
                className="mt-8 px-8 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm cursor-pointer"
            >
                Finalizar e Voltar
            </button>
        </div>
      </div>
    );
  }

  // TELA 2: PAGAMENTO
  if (dadosPix) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 max-w-lg mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 sm:p-10">
            <div className="flex flex-col items-center text-center">
                
                {/* Cabeçalho Centralizado */}
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <QrCode size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Pagamento via PIX</h2>
                <p className="text-slate-500 text-sm mb-8 px-4">
                  Abra o app do seu banco, escolha a opção PIX Copia e Cola e cole o código abaixo para finalizar o pedido de {filhoNome}.
                </p>

                {/* Resumo da Transação */}
                <div className="w-full bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 mb-6 border border-slate-100 dark:border-slate-700 text-left space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-500 text-sm font-medium">Valor a Pagar</span>
                    <span className="text-3xl font-bold text-slate-800 dark:text-white leading-none">R$ {dadosPix.valor.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50 space-y-1">
                    <p className="text-xs text-slate-500 flex justify-between"><span>Favorecido:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">Sistema EduConnect</span></p>
                    <p className="text-xs text-slate-500 flex justify-between"><span>Referência:</span> <span className="font-mono text-slate-700 dark:text-slate-300 uppercase">{form.peca} - Tam {form.tamanho}</span></p>
                  </div>
                </div>

                {/* Área do Código */}
                <div className="w-full relative mb-6">
                  <div className="w-full p-4 pr-12 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 break-all select-all font-mono text-left h-24 overflow-y-auto custom-scrollbar">
                      {dadosPix.copiaECola}
                  </div>
                  <button 
                      onClick={copiarPix}
                      title="Copiar PIX"
                      className="absolute right-2 top-2 p-2 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                      <Copy size={18} />
                  </button>
                </div>

                {/* Botões de Ação */}
                <div className="flex flex-col sm:flex-row w-full gap-3 pt-2">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="flex-1 py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold flex justify-center items-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm cursor-pointer"
                    >
                        Cancelar
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

  // TELA 1: FORMULÁRIO PADRONIZADO
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Cabeçalho no padrão do Financeiro */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <ShoppingBag className="text-indigo-500" /> Loja de Uniformes
        </h2>
        <p className="text-slate-500 mt-1">Solicite novos kits e peças para <span className="font-medium text-slate-700 dark:text-slate-300">{filhoNome}</span></p>
      </div>

      {/* Card Principal */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Coluna 1 */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Peça do Uniforme</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm cursor-pointer"
                value={form.peca} onChange={e => setForm({...form, peca: e.target.value})}
              >
                <option value="Camisa">Camiseta Padrão</option>
                <option value="Agasalho">Agasalho de Inverno</option>
                <option value="Bermuda">Bermuda Masculina</option>
                <option value="Calça">Calça Tactel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tamanho</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm cursor-pointer"
                value={form.tamanho} onChange={e => setForm({...form, tamanho: e.target.value})}
              >
                <option value="P">Tamanho P</option><option value="M">Tamanho M</option><option value="G">Tamanho G</option>
                <option value="10">Infantil 10</option><option value="12">Infantil 12</option><option value="14">Infantil 14</option>
              </select>
            </div>
          </div>

          {/* Coluna 2 */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Forma de Entrega</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm cursor-pointer"
                value={form.tipoEntrega} onChange={e => setForm({...form, tipoEntrega: e.target.value})}
              >
                <option value="Retirada na Escola">Retirar na Secretaria</option>
                <option value="Entrega em Domicílio">Entrega em Domicílio</option>
              </select>
            </div>

            {form.tipoEntrega === 'Entrega em Domicílio' ? (
              <div className="animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Endereço de Entrega</label>
                <input 
                  type="text" 
                  placeholder="Ex: Rua das Flores, 123 - Apto 4" 
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" 
                  onChange={e => setForm({...form, enderecoEntrega: e.target.value})} 
                />
              </div>
            ) : (
                <div className="h-[74px] flex items-center justify-center gap-2 border border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl text-indigo-600 dark:text-indigo-400 text-xs px-4">
                    <Info size={16} />
                    <span>O kit ficará disponível para retirada na secretaria após o pagamento.</span>
                </div>
            )}
          </div>
        </div>

        {/* Rodapé do Form */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 text-sm">
                Valor total: <span className="text-lg font-bold text-slate-800 dark:text-white">R$ 89,90</span>
            </div>
            
            <button 
                type="button"
                onClick={() => mutation.mutate(form)}
                disabled={mutation.isPending}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
            >
                {mutation.isPending ? (
                <><Loader2 className="animate-spin" size={18} /> Gerando Pedido...</>
                ) : (
                <><QrCode size={18} /> Pagar via PIX</>
                )}
            </button>
        </div>

      </div>
    </div>
  );
}