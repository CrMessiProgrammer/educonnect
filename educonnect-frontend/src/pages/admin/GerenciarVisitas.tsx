import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { CalendarDays, Clock, User, Phone, Mail, CheckCircle, XCircle, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Visita {
  id: string;
  nomeVisitante: string;
  email: string;
  telefone: string;
  dataHoraVisita: string;
  status: 'Pendente' | 'Confirmada' | 'Cancelada' | 'Realizada';
}

export function GerenciarVisitas() {
  const queryClient = useQueryClient();

  const { data: visitas, isLoading } = useQuery<Visita[]>({
    queryKey: ['visitas-admin'],
    queryFn: async () => {
      const response = await api.get('/api/Visita');
      return response.data;
    }
  });

  const mutationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/api/Visita/${id}/status`, { status });
    },
    onSuccess: () => {
      toast.success('Status atualizado e e-mail enviado ao visitante!');
      queryClient.invalidateQueries({ queryKey: ['visitas-admin'] });
    },
    onError: () => {
      toast.error('Erro ao atualizar o status da visita.');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Realizada': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Cancelada': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800'; // Pendente
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="animate-spin mr-2" /> Carregando visitas...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-indigo-500" /> Agenda de Visitas
        </h2>
        <p className="text-slate-500 mt-1">Gerencie os pais e responsáveis que desejam conhecer a escola.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {visitas?.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 font-medium">Nenhuma visita agendada até o momento.</p>
          </div>
        ) : (
          visitas?.map((visita) => (
            <div key={visita.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col hover:shadow-md transition-shadow">
              
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(visita.status)}`}>
                  {visita.status}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1 justify-end">
                    <CalendarDays size={14} className="text-indigo-500" />
                    {new Date(visita.dataHoraVisita).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 justify-end mt-0.5">
                    <Clock size={16} />
                    {new Date(visita.dataHoraVisita).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="space-y-3 flex-1 mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                <p className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                  <User size={16} className="text-slate-400" /> {visita.nomeVisitante}
                </p>
                <p className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <Phone size={16} className="text-slate-400" /> {visita.telefone}
                </p>
                <p className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                  <Mail size={16} className="text-slate-400 shrink-0" /> {visita.email}
                </p>
              </div>

              {/* Botões de Ação Dinâmicos dependendo do Status */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                {visita.status === 'Pendente' && (
                  <>
                    <button onClick={() => mutationStatus.mutate({ id: visita.id, status: 'Confirmada' })} className="py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-xl font-bold text-sm flex justify-center items-center gap-1 transition-colors cursor-pointer">
                      <CheckCircle size={16} /> Confirmar
                    </button>
                    <button onClick={() => mutationStatus.mutate({ id: visita.id, status: 'Cancelada' })} className="py-2.5 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-xl font-bold text-sm flex justify-center items-center gap-1 transition-colors cursor-pointer">
                      <XCircle size={16} /> Cancelar
                    </button>
                  </>
                )}
                {visita.status === 'Confirmada' && (
                  <button onClick={() => mutationStatus.mutate({ id: visita.id, status: 'Realizada' })} className="col-span-2 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 rounded-xl font-bold text-sm flex justify-center items-center gap-1 transition-colors cursor-pointer">
                    <MapPin size={16} /> Marcar como Realizada
                  </button>
                )}
                {(visita.status === 'Realizada' || visita.status === 'Cancelada') && (
                  <div className="col-span-2 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl font-medium text-sm text-center border border-slate-200 dark:border-slate-700">
                    Nenhuma ação disponível
                  </div>
                )}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}