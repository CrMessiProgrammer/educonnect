import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Search, Send, Loader2, MessageSquareOff } from 'lucide-react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import toast from 'react-hot-toast';

interface Contato {
  id: string;
  nome: string;
  papel: string;
  identificador: string;
}

interface Mensagem {
  id: string;
  conteudo: string;
  dataEnvio: string;
  souRemetente: boolean;
}

export function Chat() {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [mensagemAtual, setMensagemAtual] = useState('');
  const [busca, setBusca] = useState('');
  const [contatoAtivo, setContatoAtivo] = useState<Contato | null>(null);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isEnviando, setIsEnviando] = useState(false);
  const [mensagensNaoLidas, setMensagensNaoLidas] = useState<string[]>([]);

  // Uma referência que SEMPRE tem o ID do contato atualizado
  const contatoAtivoRef = useRef<string | null>(null);
  useEffect(() => {
    contatoAtivoRef.current = contatoAtivo?.id || null;
  }, [contatoAtivo]);

  // ==========================================
  // 1. CONFIGURAÇÃO DO SIGNALR (WEBSOCKET)
  // ==========================================
  useEffect(() => {
    // IMPORTANTE: Ajuste 'token' para a chave exata que você usa no seu localStorage
    const token = localStorage.getItem('@EduConnect:token');
    
    const newConnection = new HubConnectionBuilder()
      // IMPORTANTE: Ajuste a URL base do seu backend se não for a porta 5000
      .withUrl('http://localhost:5063/chathub', { 
        accessTokenFactory: () => token || ''
      })
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      newConnection.stop(); // Desconecta ao sair da tela
    };
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('⚡ Conectado ao SignalR!');

          // OUVINTE: Quando o C# enviar uma mensagem para nós
          connection.on('ReceberMensagem', (remetenteId: string, conteudo: string, dataEnvio: string) => {
            console.log('📥 Mensagem recebida no SignalR:', { remetenteId, conteudo });
            
            // BLINDAGEM: Forçamos o ID para minúsculo para evitar divergência com o banco
            const idNormalizado = remetenteId.toLowerCase();

            const novaMsg: Mensagem = {
              id: crypto.randomUUID(),
              conteudo,
              dataEnvio,
              souRemetente: false
            };

            // 1. Atualiza o histórico
            queryClient.setQueryData<Mensagem[]>(['chat-historico', remetenteId], (oldData) => {
              return oldData ? [...oldData, novaMsg] : [novaMsg];
            });

            // 2. Notificação (Usa o ID normalizado)
            if (contatoAtivoRef.current?.toLowerCase() !== idNormalizado) {
              setMensagensNaoLidas(prev => prev.includes(idNormalizado) ? prev : [...prev, idNormalizado]);
            }

            // 3. Move o contato para o topo (Usa o ID normalizado)
            queryClient.setQueryData<Contato[]>(['chat-contatos'], (oldContatos) => {
              if (!oldContatos) return oldContatos;
              
              const index = oldContatos.findIndex(c => c.id.toLowerCase() === idNormalizado);
              if (index > -1) {
                const novaLista = [...oldContatos];
                const contato = novaLista.splice(index, 1)[0]; // Remove
                return [contato, ...novaLista]; // Coloca no topo criando um array 100% novo
              }
              return oldContatos;
            });
          });
        })
        .catch(e => console.error('Erro na conexão SignalR: ', e));
    }
  }, [connection, queryClient]);

  // ==========================================
  // 2. BUSCAS (GET)
  // ==========================================
  const { data: contatos, isLoading: isLoadingContatos } = useQuery<Contato[]>({
    queryKey: ['chat-contatos'],
    queryFn: async () => {
      const response = await api.get('/api/Chat/contatos');
      return response.data;
    }
  });

  const contatosFiltrados = contatos?.filter(c => 
    c.nome?.toLowerCase().includes(busca.toLowerCase()) || 
    c.papel?.toLowerCase().includes(busca.toLowerCase())
  ) || [];

  useEffect(() => {
    if (contatosFiltrados.length > 0 && !contatoAtivo) {
      setContatoAtivo(contatosFiltrados[0]);
    }
  }, [contatos, contatoAtivo]);

  const { data: historico, isLoading: isLoadingHistorico } = useQuery<Mensagem[]>({
    queryKey: ['chat-historico', contatoAtivo?.id],
    queryFn: async () => {
      if (!contatoAtivo) return [];
      const response = await api.get(`/api/Chat/historico/${contatoAtivo.id}`);
      return response.data;
    },
    enabled: !!contatoAtivo,
    // REMOVIDO: refetchInterval (o SignalR fará o trabalho de atualizar a tela agora)
  });

  // EFEITO DE AUTO-SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historico]); // Sempre que o histórico mudar, ele desce a tela

  // ==========================================
  // 3. ENVIO PELO SIGNALR
  // ==========================================
  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagemAtual.trim() || !contatoAtivo || !connection) return;

    const texto = mensagemAtual;
    setMensagemAtual(''); // Limpa o input na hora para dar sensação de resposta instantânea
    setIsEnviando(true);

    try {
      // Chama o método "EnviarMensagem" que ajustamos lá no C# (Destinatário, Conteúdo)
      await connection.invoke('EnviarMensagem', contatoAtivo.id, texto);

      // Adiciona nossa própria mensagem no cache para aparecer na tela imediatamente
      const nossaMsg: Mensagem = {
        id: crypto.randomUUID(),
        conteudo: texto,
        dataEnvio: new Date().toISOString(),
        souRemetente: true
      };

      queryClient.setQueryData<Mensagem[]>(['chat-historico', contatoAtivo.id], (oldData) => {
        return oldData ? [...oldData, nossaMsg] : [nossaMsg];
      });

    } catch (error) {
      toast.error("Falha ao enviar a mensagem. Verifique sua conexão.");
    } finally {
      setIsEnviando(false);
    }
  };

  // O restante do seu JSX permanece exatamente igual!
  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden animate-in fade-in">
      
      {/* BARRA LATERAL (CONTATOS) */}
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-900/30">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Mensagens</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou papel..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
          {isLoadingContatos ? (
             <div className="flex justify-center p-8 text-slate-400"><Loader2 className="animate-spin" /></div>
          ) : contatosFiltrados.length === 0 ? (
             <div className="text-center p-8 text-sm text-slate-500">Nenhum usuário encontrado.</div>
          ) : (
            contatosFiltrados.map(contato => (
              <div 
                key={contato.id}
                onClick={() => {
                  setContatoAtivo(contato);
                  // Remove normalizando o ID
                  setMensagensNaoLidas(prev => prev.filter(id => id !== contato.id.toLowerCase()));
                }}
                className={`p-4 border-b border-slate-100 dark:border-slate-800/50 cursor-pointer flex items-center gap-3 transition-colors ${contatoAtivo?.id === contato.id ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-500' : 'hover:bg-white dark:hover:bg-slate-800'}`}
              >
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 font-bold shrink-0 relative">
                  {contato.nome.charAt(0).toUpperCase()}
                  
                  {/* CHECAGEM NORMALIZADA */}
                  {mensagensNaoLidas.includes(contato.id.toLowerCase()) && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
                  )}
             
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className={`font-bold truncate ${mensagensNaoLidas.includes(contato.id) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-white'}`}>
                      {contato.nome}
                    </h4>
                  </div>
                  
                  {/* AQUI ENTRA O RA (se for aluno) OU O E-MAIL (se for outro) */}
                  <p className="text-xs text-slate-500 truncate mb-1">{contato.identificador}</p>
                  
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {contato.papel}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ÁREA DO CHAT ATIVO */}
      <div className="flex-1 flex flex-col bg-[#FAFAFA] dark:bg-slate-900/50">
        
        {!contatoAtivo ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
             <MessageSquareOff size={48} className="mb-4 opacity-50" />
             <p>Selecione um contato para iniciar a conversa</p>
          </div>
        ) : (
          <>
            {/* Header do Chat */}
            <div className="h-20 px-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4 bg-white dark:bg-slate-800 shrink-0">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                {contatoAtivo.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">{contatoAtivo.nome}</h3>
                <p className="text-xs text-slate-500 font-medium">{contatoAtivo.papel}</p>
              </div>
            </div>

            {/* Histórico de Mensagens */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700flex-1 overflow-y-auto p-6 space-y-4 flex flex-col [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
              <div className="space-y-4">
                {isLoadingHistorico ? (
                  <div className="flex items-center justify-center py-8 text-slate-500">
                    <Loader2 className="animate-spin mr-2" /> Carregando conversa...
                  </div>
                ) : historico?.length === 0 ? (
                  <div className="text-center text-slate-400 my-10 bg-slate-100 dark:bg-slate-800 py-2 rounded-lg text-sm w-max mx-auto px-4">
                    Nenhuma mensagem ainda. Diga olá! 👋
                  </div>
                ) : (
                  historico?.map((msg) => {
                    const horario = new Date(msg.dataEnvio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={msg.id} className={`flex flex-col max-w-[70%] ${msg.souRemetente ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                        <div className={`px-4 py-2.5 text-sm ${msg.souRemetente ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm shadow-sm'}`}>
                          {msg.conteudo}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 mx-1">{horario}</span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input de Envio */}
            <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
              <form onSubmit={handleEnviar} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                <input 
                  type="text" 
                  value={mensagemAtual}
                  onChange={(e) => setMensagemAtual(e.target.value)}
                  placeholder={`Mensagem para ${contatoAtivo.nome.split(' ')[0]}...`} 
                  className="flex-1 bg-transparent px-3 outline-none text-slate-800 dark:text-white text-sm"
                  disabled={isEnviando}
                  autoComplete="off"
                />
                <button 
                  type="submit" 
                  disabled={isEnviando || !mensagemAtual.trim()}
                  className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isEnviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="-ml-0.5" />}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}