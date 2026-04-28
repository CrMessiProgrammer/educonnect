import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Loader2, AlertCircle, FileText, CheckCircle, X, Eye, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

// Tipagem baseada no backend (MatriculaService) retorna
interface MatriculaPendente {
  id: string;
  nomeAluno: string;
  dataNascimento: string;
  nomeResponsavel: string;
  seriePretendida: string;
  dataSolicitacao: string;
}

// Tipagem baseada no DTO anônimo de TurmaService.ListarDisponiveis()
interface TurmaDisponivel {
  id: string;
  nome: string;
  turno: number | string;
}

// Função auxiliar para traduzir o Enum do C# para algo legível no Front
const formatarTurno = (turno: number | string) => {
  if (turno === 0 || turno === 'Matutino') return 'Manhã';
  if (turno === 1 || turno === 'Vespertino') return 'Tarde';
  if (turno === 2 || turno === 'Noturno') return 'Noite';
  return turno;
};

export function GerenciarMatriculas() {
  const queryClient = useQueryClient();
  const [alunoSelecionado, setAlunoSelecionado] = useState<MatriculaPendente | null>(null);
  const [turmaIdSelecionada, setTurmaIdSelecionada] = useState('');

  // Estados para o Modal de Detalhes
  const [detalhesSelecionados, setDetalhesSelecionados] = useState<any>(null);
  const [isModalDetalhesAberto, setIsModalDetalhesAberto] = useState(false);
  const [isLoadingDetalhes, setIsLoadingDetalhes] = useState(false);

  // 1. BUSCAR AS MATRÍCULAS PENDENTES
  const { data: matriculas, isLoading, isError } = useQuery<MatriculaPendente[]>({
    queryKey: ['matriculas-pendentes'],
    queryFn: async () => {
      const response = await api.get('/api/Matricula/pendentes');
      return response.data;
    }
  });

  // 2. BUSCAR TURMAS DISPONÍVEIS
  const { data: turmas, isLoading: isLoadingTurmas } = useQuery<TurmaDisponivel[]>({
    queryKey: ['turmas-disponiveis'],
    queryFn: async () => {
      const response = await api.get('/api/Turma/disponiveis');
      return response.data;
    }
  });

  // 3. FUNÇÃO PARA BUSCAR E ABRIR OS DETALHES
  const handleAbrirDetalhes = async (alunoId: string) => {
    setIsLoadingDetalhes(true);
    setIsModalDetalhesAberto(true);
    try {
      const response = await api.get(`/api/Matricula/${alunoId}/detalhes`);
      setDetalhesSelecionados(response.data);
    } catch (error) {
      toast.error('Erro ao carregar detalhes da matrícula.');
      setIsModalDetalhesAberto(false);
    } finally {
      setIsLoadingDetalhes(false);
    }
  };

  // 4. FUNÇÃO PARA BAIXAR/ABRIR O PDF
  const handleBaixarHistorico = async (alunoId: string, nomeAluno: string) => {
    try {
      // Usa responseType 'blob' pois o C# retorna um arquivo físico (FileStream)
      const response = await api.get(`/api/Matricula/${alunoId}/historico`, { responseType: 'blob' });
      
      // Cria um link temporário na memória do navegador para abrir o PDF
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Historico_${nomeAluno}.pdf`); // Força o download
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      toast.error('Erro ao baixar o histórico. Verifique se o arquivo existe.');
    }
  };

  // 5. MUTATION PARA APROVAR MATRÍCULA
  const aprovarMutation = useMutation({
    mutationFn: async ({ id, turmaId }: { id: string, turmaId: string }) => {
      await api.put(`/api/Matricula/aprovar/${id}`, { turmaId });
    },
    onSuccess: () => {
      // Se der sucesso, fecha o modal e recarrega a tabela automaticamente!
      setAlunoSelecionado(null);
      setTurmaIdSelecionada('');
      queryClient.invalidateQueries({ queryKey: ['matriculas-pendentes'] });
      toast.success('Matrícula aprovada com sucesso! E-mail enviado ao responsável.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao aprovar matrícula.');
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-slate-500">
        <Loader2 className="animate-spin" size={40} />
        <p>Buscando solicitações...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl flex items-center gap-4">
        <AlertCircle size={32} />
        <p>Erro ao carregar matrículas. Verifique sua conexão ou se você tem permissão de Admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="text-indigo-500" /> Gerenciar Matrículas</h2>
        <p className="text-slate-500 dark:text-slate-400">Avalie os históricos e aprove a entrada de novos alunos.</p>
      </header>

      {/* TABELA DE DADOS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {matriculas?.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            Nenhuma solicitação de matrícula pendente no momento. 🎉
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Aluno</th>
                  <th className="px-6 py-4">Série Pretendida</th>
                  <th className="px-6 py-4">Responsável</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {matriculas?.map((aluno) => (
                  <tr key={aluno.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{aluno.nomeAluno}</td>
                    <td className="px-6 py-4">
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md text-xs font-bold">
                        {aluno.seriePretendida}
                      </span>
                    </td>
                    <td className="px-6 py-4">{aluno.nomeResponsavel}</td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleAbrirDetalhes(aluno.id)}
                        className="p-2 text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-400 hover:bg-sky-900/50 rounded-lg transition cursor-pointer"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleBaixarHistorico(aluno.id, aluno.nomeAluno)}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition cursor-pointer"
                        title="Ver Histórico Escolar (PDF)"
                      >
                        <FileText size={18} />
                      </button>
                      <button 
                        onClick={() => setAlunoSelecionado(aluno)}
                        className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition cursor-pointer"
                        title="Aprovar Matrícula"
                      >
                        <CheckCircle size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* MODAL DE DETALHES DA MATRÍCULA */}
      {isModalDetalhesAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
            
            <button 
              onClick={() => {
                setIsModalDetalhesAberto(false);
                setDetalhesSelecionados(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-4 dark:border-slate-700">
              Ficha de Solicitação
            </h3>

            {isLoadingDetalhes ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-4 text-slate-500">
                <Loader2 className="animate-spin" size={32} />
                <p>Carregando informações...</p>
              </div>
            ) : detalhesSelecionados ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna Aluno */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Dados do Aluno
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Nome:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{detalhesSelecionados.alunoNome}</span></p>
                    <p><span className="text-slate-500">CPF:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{detalhesSelecionados.alunoCPF}</span></p>
                    <p><span className="text-slate-500">Nascimento:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(detalhesSelecionados.alunoDataNascimento).toLocaleDateString('pt-BR')}</span></p>
                    <p><span className="text-slate-500">Série Pretendida:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{detalhesSelecionados.seriePretendida}</span></p>
                  </div>
                </div>

                {/* Coluna Responsável */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Dados do Responsável
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-slate-500">Nome:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{detalhesSelecionados.responsavelNome}</span></p>
                    <p><span className="text-slate-500">E-mail:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{detalhesSelecionados.responsavelEmail}</span></p>
                    <p><span className="text-slate-500">CPF:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{detalhesSelecionados.responsavelCPF}</span></p>
                    <p><span className="text-slate-500">Telefone:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{detalhesSelecionados.responsavelTelefone}</span></p>
                  </div>
                </div>
              </div>
            ) : null}
            
            <div className="mt-8 pt-4 border-t dark:border-slate-700 flex justify-end">
              <Button onClick={() => setIsModalDetalhesAberto(false)} variant="outline">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE APROVAÇÃO */}
      {alunoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 relative">
            
            <button 
              onClick={() => setAlunoSelecionado(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aprovar Matrícula</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Você está aprovando <b>{alunoSelecionado.nomeAluno}</b> para o <b>{alunoSelecionado.seriePretendida}</b>.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Selecione a Turma Oficial</label>
                
                {/* SELECT DINÂMICO DE TURMAS */}
                {isLoadingTurmas ? (
                  <div className="text-sm text-slate-500 py-2 flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} /> Carregando turmas...
                  </div>
                ) : (
                  <select 
                    value={turmaIdSelecionada}
                    onChange={(e) => setTurmaIdSelecionada(e.target.value)}
                    className="border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="" disabled>Escolha uma turma disponível...</option>
                    {turmas?.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome} - {formatarTurno(turma.turno)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button 
                  onClick={() => aprovarMutation.mutate({ id: alunoSelecionado.id, turmaId: turmaIdSelecionada })}
                  isLoading={aprovarMutation.isPending}
                  disabled={!turmaIdSelecionada} // O botão fica inativo até ele escolher a turma
                >
                  Confirmar Aprovação
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}