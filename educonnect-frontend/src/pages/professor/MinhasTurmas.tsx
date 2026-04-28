import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, Loader2, ArrowRight, BookOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';

interface TurmaResumo {
  id: string;
  nome: string;
}

// Tipagem baseada no meu TurmaResponseDto
interface Turma {
  id: string;
  nome: string;
  turno: string;
  anoLetivo: number;
  totalAlunos: number;
}

export function MinhasTurmas() {
  const { user } = useAuthStore();
  const [isModalAlunosAberto, setIsModalAlunosAberto] = useState(false);
  const [alunosDaTurma, setAlunosDaTurma] = useState<any[]>([]);
  const [turmaSelecionadaNome, setTurmaSelecionadaNome] = useState('');
  const [isLoadingAlunos, setIsLoadingAlunos] = useState(false);

  const { data: turmas, isLoading } = useQuery<TurmaResumo[]>({
    queryKey: ['minhas-turmas', user?.id],
    queryFn: async () => {
      const response = await api.get(`/api/Professor/${user?.id}/minhas-turmas`);
      return response.data;
    },
    enabled: !!user?.id
  });

  const handleVerAlunos = async (turmaId: string, turmaNome: string) => {
    setTurmaSelecionadaNome(turmaNome);
    setIsModalAlunosAberto(true);
    setIsLoadingAlunos(true);
    try {
      // Usando a rota correta do seu ProfessorController
      const response = await api.get(`/api/Professor/${user?.id}/turma/${turmaId}/alunos`);
      setAlunosDaTurma(response.data);
    } catch (error) {
      toast.error('Erro ao carregar alunos da turma.');
      setIsModalAlunosAberto(false);
    } finally {
      setIsLoadingAlunos(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="text-indigo-500" /> Minhas Turmas
        </h2>
        <p className="text-slate-500">Clique em uma turma para ver a lista de alunos matriculados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas?.map((turma) => (
          <div 
            key={turma.id} 
            onClick={() => handleVerAlunos(turma.id, turma.nome)}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center transition-colors">
                <Users size={24} />
              </div>
              <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{turma.nome}</h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ver Integrantes</p>
          </div>
        ))}
      </div>

      {/* MODAL PARA VER ALUNOS DA TURMA */}
      {isModalAlunosAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 relative flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => setIsModalAlunosAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="mb-6 border-b pb-4 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="text-indigo-500" />
                Alunos da Turma: {turmaSelecionadaNome}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Total de {alunosDaTurma.length} aluno(s) vinculado(s).
              </p>
            </div>

            {/* CONTEÚDO DO MODAL (Com Scroll se tiver muitos alunos) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {isLoadingAlunos ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  Buscando lista de chamada...
                </div>
              ) : alunosDaTurma.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400">Nenhum aluno matriculado nesta turma ainda.</p>
                </div>
              ) : (
                alunosDaTurma.map((aluno) => (
                  <div key={aluno.id} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    <div className="flex items-center gap-4">
                      {/* Avatar Genérico */}
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        {aluno.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">{aluno.nome}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Responsável: {aluno.responsavel?.nome || 'Não informado'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 uppercase font-semibold">RA</span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          {aluno.ra || 'Aguardando'}
                        </span>
                      </div>
                      
                      
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t dark:border-slate-700 flex justify-end">
              <Button onClick={() => setIsModalAlunosAberto(false)} variant="outline">
                Fechar Lista
              </Button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}