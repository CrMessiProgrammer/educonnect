import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Megaphone, Send, Loader2, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';

interface Comunicado {
  id: string;
  titulo: string;
  mensagem: string;
  publicoAlvo: string;
  dataPublicacao: string;
}

export function Comunicados() {
  const { user } = useAuthStore();

  // Definimos quem PODE ver o formulário
  // Se for Aluno ou Responsavel, essa variável será FALSE
  const temPermissaoDePostar = user?.tipo === 'Administrador' || user?.tipo === 'Professor';

  const queryClient = useQueryClient();
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('Todos');

  // BUSCAR MURAL
  const { data: mural, isLoading } = useQuery<Comunicado[]>({
    queryKey: ['mural-comunicados'],
    queryFn: async () => {
      const response = await api.get('/api/Comunicado/mural');
      return response.data;
    }
  });

  // CRIAR COMUNICADO
  const publicarMutation = useMutation({
    mutationFn: async () => {
      await api.post('/api/Comunicado', { titulo, mensagem, publicoAlvo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mural-comunicados'] });
      setTitulo(''); setMensagem('');
      toast.success('Comunicado enviado (e e-mails disparados) com sucesso!');
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
      
      {/* FORMULÁRIO DE ENVIO */}
      {temPermissaoDePostar && (
      <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-fit">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-white">
          <Megaphone className="text-indigo-500" /> Novo Comunicado
        </h3>
        
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Título</label>
            <input 
              type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Público Alvo</label>
            <select 
              value={publicoAlvo} onChange={e => setPublicoAlvo(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            >
              <option value="Todos">Todos na Escola</option>
              <option value="Responsaveis">Apenas Responsáveis (Pais)</option>
              <option value="Professores">Apenas Professores</option>
              <option value="Alunos">Apenas Alunos</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mensagem</label>
            <textarea 
              rows={4} value={mensagem} onChange={e => setMensagem(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-900 dark:text-white"
            />
          </div>

          <Button 
            className="w-full flex items-center justify-center gap-2 mt-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer"
            onClick={() => publicarMutation.mutate()}
            disabled={!titulo || !mensagem || publicarMutation.isPending}
            isLoading={publicarMutation.isPending}
          >
            {/* Esconde o ícone de Send se estiver carregando para não ficar 2 ícones girando */}
            {!publicarMutation.isPending && <Send size={18} />} 
            {publicarMutation.isPending ? "Publicando..." : "Publicar e Disparar E-mail"}
          </Button>
        </div>
      </div>
      )}

      {/* TIMELINE DO MURAL */}
      <div className={`${temPermissaoDePostar ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Mural Histórico</h2>
        
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-500"><Loader2 className="animate-spin" /> Carregando mural...</div>
        ) : mural?.length === 0 ? (
          <p className="text-slate-500">Nenhum comunicado publicado ainda.</p>
        ) : (
          mural?.map(aviso => (
            <div key={aviso.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border-l-4 border-indigo-500 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{aviso.titulo}</h4>
                <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">
                  {new Date(aviso.dataPublicacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm">{aviso.mensagem}</p>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-indigo-500 dark:text-indigo-400">
                <Users size={14} /> Enviado para: {aviso.publicoAlvo}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}