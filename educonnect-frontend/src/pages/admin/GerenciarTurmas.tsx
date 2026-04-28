import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Users, Plus, Loader2, X, PlusSquare, UserPlus, User, Trash2, BookOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

// Tipagem baseada no meu TurmaResponseDto
interface Turma {
  id: string;
  nome: string;
  turno: string;
  anoLetivo: number;
  totalAlunos: number;
}

export function GerenciarTurmas() {
  const queryClient = useQueryClient();
  const [isModalAberto, setIsModalAberto] = useState(false);
  
  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear());
  const [turno, setTurno] = useState('0'); // 0 = Matutino, 1 = Vespertino, 2 = Noturno

  // Novos estados para visualizar alunos
  const [isModalAlunosAberto, setIsModalAlunosAberto] = useState(false);
  const [alunosDaTurma, setAlunosDaTurma] = useState<any[]>([]);
  const [turmaSelecionadaNome, setTurmaSelecionadaNome] = useState('');
  const [isLoadingAlunos, setIsLoadingAlunos] = useState(false);

  // Estados para o Modal de Vincular Professor
  const [isModalVincularAberto, setIsModalVincularAberto] = useState(false);
  const [turmaParaVincular, setTurmaParaVincular] = useState<{id: string, nome: string} | null>(null);
  const [professorSelecionadoId, setProfessorSelecionadoId] = useState('');

  // Busca a lista de professores para o <select> do modal
  const { data: professores } = useQuery({
    queryKey: ['professores-lista'],
    queryFn: async () => {
      const response = await api.get('/api/Professor');
      return response.data;
    }
  });

  // Mutação para fazer o POST de vínculo
  const vincularProfessorMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/Turma/${turmaParaVincular?.id}/vincular-professor/${professorSelecionadoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] }); // Recarrega as turmas
      setIsModalVincularAberto(false);
      setProfessorSelecionadoId(''); // Limpa a seleção
      toast.success('Professor vinculado à turma com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao vincular professor.');
    }
  });

  const handleAbrirVincular = (turmaId: string, turmaNome: string) => {
    setTurmaParaVincular({ id: turmaId, nome: turmaNome });
    setProfessorSelecionadoId('');
    setIsModalVincularAberto(true);
  };

  // BUSCAR TURMAS (GET)
  const { data: turmas, isLoading } = useQuery<Turma[]>({
    queryKey: ['turmas'],
    queryFn: async () => {
      const response = await api.get('/api/Turma');
      return response.data;
    }
  });

  // CRIAR TURMA (POST)
  const criarTurmaMutation = useMutation({
    mutationFn: async () => {
      // O payload deve bater com o meu TurmaCreateDto
      await api.post('/api/Turma', {
        nome,
        anoLetivo: Number(anoLetivo),
        turno: Number(turno)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] }); // Recarrega a tela
      setIsModalAberto(false);
      setNome(''); // Limpa o form
      toast.success('Turma criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar turma.');
    }
  });

  // INATIVAR TURMA (DELETE)
  const inativarTurmaMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/Turma/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['turmas'] });
      toast.success('Turma inativada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao inativar turma.');
    }
  });

  const handleDeletarTurma = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja inativar a turma "${nome}"? \nAlunos e professores perderão o vínculo com ela.`)) {
      inativarTurmaMutation.mutate(id);
    }
  };

  // VER ALUNOS DA TURMA (GET)
  const handleVerAlunos = async (turmaId: string, turmaNome: string) => {
    setTurmaSelecionadaNome(turmaNome);
    setIsModalAlunosAberto(true);
    setIsLoadingAlunos(true);
    try {
      // Endpoint que traz os alunos por TurmaId
      const response = await api.get(`/api/Turma/${turmaId}/alunos`);
      setAlunosDaTurma(response.data);
    } catch (error) {
      toast.error('Erro ao carregar alunos da turma.');
    } finally {
      setIsLoadingAlunos(false);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64 text-slate-500">
      <Loader2 className="animate-spin mr-2" /> Carregando turmas...
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="text-indigo-500" /> Gerenciar Turmas</h2>
          <p className="text-slate-500">Visualize e crie novas turmas acadêmicas.</p>
        </div>
        <Button
          onClick={() => setIsModalAberto(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer"
          title="Adicionar Nova Turma"
        >
          <Plus size={18} /> Nova Turma
        </Button>
      </header>

      {/* GRID DE TURMAS */}
      {/* Grid fixo em no máximo 3 colunas para dar mais respiro aos cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {turmas?.map((turma) => (
          <div 
            key={turma.id} 
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col hover:shadow-lg transition-all duration-300"
          >
            
            {/* Cabeçalho do Card */}
            <div className="flex justify-between items-start mb-6">
              <div className="pr-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                  {turma.nome}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Ano Letivo: {turma.anoLetivo}
                </p>
              </div>
              
              {/* Turno e Botão de Deletar agrupados */}
              <div className="flex flex-col items-end gap-2">
                <span className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wide">
                  {turma.turno}
                </span>
                
                <button 
                  onClick={() => handleDeletarTurma(turma.id, turma.nome)}
                  disabled={inativarTurmaMutation.isPending}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  title="Inativar Turma"
                >
                  {inativarTurmaMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>

            {/* Informações Rápidas */}
            <div className="flex items-center gap-2 mb-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <User size={18} className="text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {turma.totalAlunos} Aluno(s) matriculado(s)
              </span>
            </div>

            {/* Rodapé: Botões empilhados verticalmente */}
            <div className="mt-auto pt-5 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-3">
              
              <button 
                onClick={() => handleAbrirVincular(turma.id, turma.nome)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
              >
                <UserPlus size={18} className="shrink-0" />
                <span>Vincular Professor</span>
              </button>
              
              <button 
                onClick={() => handleVerAlunos(turma.id, turma.nome)}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
              >
                <Users size={18} className="shrink-0" />
                <span>Ver Lista de Alunos</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CRIAÇÃO */}
      {isModalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 relative">
            
            <button 
              onClick={() => setIsModalAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-4 dark:border-slate-700">
              Cadastrar Nova Turma
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome da Turma</label>
                <input 
                  type="text" 
                  placeholder="Ex: 1º Ano A"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ano Letivo</label>
                <input 
                  type="number" 
                  value={anoLetivo}
                  onChange={(e) => setAnoLetivo(Number(e.target.value))}
                  className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Turno</label>
                <select 
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="0">Matutino</option>
                  <option value="1">Vespertino</option>
                  <option value="2">Noturno</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button 
                  onClick={() => criarTurmaMutation.mutate()}
                  isLoading={criarTurmaMutation.isPending}
                  disabled={!nome}
                >
                  Salvar Turma
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE VINCULAR PROFESSOR */}
      {isModalVincularAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 relative">
            
            <button 
              onClick={() => setIsModalVincularAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Vincular Professor
            </h3>
            <p className="text-sm text-slate-500 mb-6 border-b pb-4 dark:border-slate-700">
              Turma selecionada: <strong className="text-indigo-600 dark:text-indigo-400">{turmaParaVincular?.nome}</strong>
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Selecione o Professor
                </label>
                <select 
                  value={professorSelecionadoId}
                  onChange={(e) => setProfessorSelecionadoId(e.target.value)}
                  className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled>-- Escolha um professor --</option>
                  {professores?.map((prof: any) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button 
                  onClick={() => vincularProfessorMutation.mutate()}
                  isLoading={vincularProfessorMutation.isPending}
                  disabled={!professorSelecionadoId}
                >
                  Confirmar Vínculo
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL PARA VER ALUNOS DA TURMA */}
      {isModalAlunosAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 relative flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => setIsModalAlunosAberto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
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
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Responsável: {aluno.responsavelNome}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400 uppercase font-semibold">RA</span>
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          {aluno.ra || 'Aguardando'}
                        </span>
                      </div>
                      
                      {/* Badge de Status */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        aluno.status === 'Aprovado' || aluno.status === 'Ativo' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {aluno.status}
                      </span>
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