import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Users, Search, Loader2, Edit, Trash2, X, GraduationCap, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

// Tipagem baseada no seu AlunoResponseDto
interface Aluno {
  id: string;
  nome: string;
  ra: string | null;
  status: string;
  turmaNome: string;
  responsavelNome: string;
}

export function GerenciarAlunos() {
  const queryClient = useQueryClient();
  const [busca, setBusca] = useState('');
  
  // Estados para o Modal de Edição
  const [isModalEditarAberto, setIsModalEditarAberto] = useState(false);
  const [alunoEditando, setAlunoEditando] = useState({ id: '', nome: '', turmaId: '' });

  // 1. Buscar Alunos (GET)
  const { data: alunos, isLoading: isLoadingAlunos } = useQuery<Aluno[]>({
    queryKey: ['alunos', busca],
    queryFn: async () => {
      const response = await api.get('/api/Aluno', { params: { busca: busca || undefined } });
      return response.data;
    }
  });

  // 2. Buscar Turmas para o select de edição (GET)
  const { data: turmas } = useQuery({
    queryKey: ['turmas-lista'],
    queryFn: async () => {
      const response = await api.get('/api/Turma');
      return response.data;
    }
  });

  // 3. Atualizar Aluno (PUT)
  const editarMutation = useMutation({
    mutationFn: async (dados: typeof alunoEditando) => {
      await api.put(`/api/Aluno/${dados.id}`, {
        nome: dados.nome,
        turmaId: dados.turmaId || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      setIsModalEditarAberto(false);
      toast.success('Aluno atualizado com sucesso!');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao atualizar aluno.')
  });

  // 4. Inativar Aluno (DELETE)
  const inativarMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/Aluno/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast.success('Aluno inativado com sucesso!');
    }
  });

  const handleAbrirEdicao = (aluno: Aluno) => {
    // Como o DTO não traz o TurmaId, deixamos em branco para o Admin escolher novamente se for mudar
    setAlunoEditando({ id: aluno.id, nome: aluno.nome, turmaId: '' }); 
    setIsModalEditarAberto(true);
  };

  const handleDeletar = (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja inativar o aluno ${nome}?`)) {
      inativarMutation.mutate(id);
    }
  };

  const handleSalvarEdicao = (e: React.FormEvent) => {
    e.preventDefault();
    editarMutation.mutate(alunoEditando);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <GraduationCap className="text-indigo-500" /> Gerenciar Alunos
          </h2>
          <p className="text-slate-500">Consulte, edite ou inative os alunos da instituição.</p>
        </div>
        
        {/* Barra de Pesquisa */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Nome, RA ou CPF do Pai..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </header>

      {/* Tabela de Alunos */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Nome / RA</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Responsável</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Turma</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Matrícula</th>
                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingAlunos ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <Loader2 className="animate-spin mx-auto mb-2" /> Carregando alunos...
                  </td>
                </tr>
              ) : alunos?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              ) : (
                alunos?.map((aluno) => (
                  <tr key={aluno.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{aluno.nome}</p>
                      <p className="text-xs text-slate-500 font-mono">RA: {aluno.ra || 'N/A'}</p>
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{aluno.responsavelNome}</td>
                    <td className="p-4">
                      <span className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded text-xs font-bold">
                        {aluno.turmaNome}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        aluno.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {aluno.status}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button onClick={() => handleAbrirEdicao(aluno)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer" title="Editar Aluno">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeletar(aluno.id, aluno.nome)} disabled={inativarMutation.isPending} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50" title="Inativar Aluno">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      {isModalEditarAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 relative">
            <button onClick={() => setIsModalEditarAberto(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Editar Aluno</h3>
            
            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Aluno</label>
                <input required type="text" value={alunoEditando.nome} onChange={e => setAlunoEditando({...alunoEditando, nome: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vincular à Turma</label>
                <select value={alunoEditando.turmaId} onChange={e => setAlunoEditando({...alunoEditando, turmaId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                  <option value="" disabled>-- Selecione uma turma --</option>
                  {turmas?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.nome} ({t.turno})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Deixe em branco para não alterar ou remover a turma atual.</p>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalEditarAberto(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white py-2 rounded-xl font-medium transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={editarMutation.isPending || !alunoEditando.nome} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors cursor-pointer disabled:opacity-50">
                  {editarMutation.isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}