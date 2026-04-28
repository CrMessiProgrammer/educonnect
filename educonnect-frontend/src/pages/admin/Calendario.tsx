import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import axios from 'axios';
import { useAuthStore } from '../../store/useAuthStore';
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  tipoEvento: string;
}

export function Calendario() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const podeCriarEvento = user?.tipo === 'Administrador' || user?.tipo === 'Professor';

  // 1. Busca os eventos do Backend C#
  const { data: eventosDB, isLoading: isLoadingDB } = useQuery<Evento[]>({
    queryKey: ['calendario-db'],
    queryFn: async () => {
      const response = await api.get('/api/Calendario');
      return response.data;
    }
  });

  // 2. Busca Feriados da Brasil API
  const anoAtual = currentDate.getFullYear();
  const { data: feriadosAPI } = useQuery({
    queryKey: ['feriados-api', anoAtual],
    queryFn: async () => {
      const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${anoAtual}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });

  // 3. Mescla tudo
  const todosEventos = [
    ...(eventosDB || []),
    ...(feriadosAPI?.map((f: any) => ({
      id: f.date, 
      titulo: f.name, 
      descricao: 'Feriado Nacional',
      dataInicio: f.date + "T00:00:00", 
      dataFim: f.date + "T23:59:59", 
      tipoEvento: 'Feriado'
    })) || [])
  ];

  // Ordena os próximos eventos a partir de hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const proximosEventos = todosEventos
    .filter(ev => new Date(ev.dataInicio) >= hoje)
    .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
    .slice(0, 5); // Pega apenas os 5 próximos para não quebrar o layout lateral

  const mutationCriar = useMutation({
    mutationFn: async (novoEvento: any) => await api.post('/api/Calendario', novoEvento),
    onSuccess: () => {
      toast.success('Evento adicionado à agenda!');
      queryClient.invalidateQueries({ queryKey: ['calendario-db'] });
      setIsModalOpen(false);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutationCriar.mutate({
      titulo: formData.get('titulo'),
      descricao: formData.get('descricao'),
      tipoEvento: formData.get('tipoEvento'),
      dataInicio: formData.get('dataInicio'),
      dataFim: formData.get('dataFim'),
    });
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventosDoDia = (dia: number) => {
    return todosEventos.filter(ev => {
      const evDate = new Date(ev.dataInicio);
      return evDate.getDate() === dia && evDate.getMonth() === currentDate.getMonth() && evDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const getCorEvento = (tipo: string) => {
    switch (tipo) {
      case 'Feriado': return 'bg-red-50 text-red-700 border-l-2 border-red-500 dark:bg-red-900/30 dark:text-red-400';
      case 'Prova': return 'bg-amber-50 text-amber-700 border-l-2 border-amber-500 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Reunião de Pais': return 'bg-indigo-50 text-indigo-700 border-l-2 border-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in flex flex-col h-full">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize flex items-center gap-3">
              {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={prevMonth} className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"><ChevronLeft size={16} /></button>
              <button onClick={nextMonth} className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        {podeCriarEvento && (
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm shadow-indigo-500/30 transition-colors cursor-pointer">
            <Plus size={18} /> Novo Evento
          </button>
        )}
      </header>

      <div className="flex flex-col xl:flex-row gap-6 items-start">
        {/* LADO ESQUERDO: GRADE DO CALENDÁRIO */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex-1 w-full">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
              <div key={dia} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-widest border-r border-slate-200 dark:border-slate-700 last:border-0">
                {dia}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 auto-rows-fr h-[500px]">
            {blanks.map(blank => (
              <div key={`blank-${blank}`} className="border-r border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/20 p-2"></div>
            ))}
            
            {days.map(dia => {
              const eventosHoje = getEventosDoDia(dia);
              const isHoje = dia === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div key={dia} className={`border-r border-b border-slate-100 dark:border-slate-700/50 p-2 flex flex-col gap-1 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/20 ${isHoje ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isHoje ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-700 dark:text-slate-300'}`}>
                    {dia}
                  </span>
                  
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700">
                    {eventosHoje.map((ev, idx) => (
                      <div key={idx} className={`px-2 py-1 text-[10px] font-bold rounded shadow-sm truncate cursor-pointer hover:opacity-80 ${getCorEvento(ev.tipoEvento)}`} title={ev.titulo}>
                        {ev.titulo}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LADO DIREITO: LISTA DETALHADA DE PRÓXIMOS EVENTOS */}
        <div className="w-full xl:w-96 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 shrink-0">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="text-indigo-500" size={20} /> Próximos Eventos
          </h3>
          
          <div className="space-y-4">
            {proximosEventos.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Nenhum evento futuro programado.</p>
            ) : (
              proximosEventos.map((evento, idx) => {
                const dataInicio = new Date(evento.dataInicio);
                const isFeriado = evento.tipoEvento === 'Feriado';
                return (
                  <div key={evento.id + idx} className="relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-[-16px] before:w-px before:bg-slate-200 dark:before:bg-slate-700 last:before:hidden">
                  <span className="absolute left-1 top-1.5 w-[6px] h-[6px] rounded-full bg-indigo-500 ring-4 ring-white dark:ring-slate-800"></span>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-2 inline-block ${getCorEvento(evento.tipoEvento)}`}>
                      {evento.tipoEvento}
                    </span>
                    
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{evento.titulo}</h4>
                    {evento.descricao && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{evento.descricao}</p>}
                    
                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <CalendarIcon size={12} className="text-indigo-500" />
                        {dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </div>
                      
                      {!isFeriado && (
                        <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-600 pl-3">
                          <Clock size={12} className="text-indigo-500" />
                          {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* MODAL DE NOVO EVENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Criar Novo Evento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Título do Evento</label>
                <input required name="titulo" type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Feira de Ciências" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Tipo de Evento</label>
                <select required name="tipoEvento" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  <option value="Evento Técnico / Cultural">Evento Técnico / Cultural</option>
                  <option value="Prova">Prova / Avaliação</option>
                  <option value="Reunião de Pais">Reunião de Pais</option>
                  <option value="Feriado">Feriado / Recesso</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Início</label>
                  <input required name="dataInicio" type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Término</label>
                  <input required name="dataFim" type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Descrição (Opcional)</label>
                <textarea name="descricao" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Detalhes adicionais..."></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={mutationCriar.isPending} className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                  {mutationCriar.isPending ? 'Salvando...' : 'Salvar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}