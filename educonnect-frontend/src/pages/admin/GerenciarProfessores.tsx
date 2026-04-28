import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { UserPlus, Mail, BookOpen, Loader2, X, GraduationCap, FileText, Fingerprint, Trash2, Save, PenBox, Presentation } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

interface Professor {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  disciplina: string;
  rp: string;
  turmas: string[];
}

export function GerenciarProfessores() {
  const queryClient = useQueryClient();
  const [profSelecionado, setProfSelecionado] = useState<Professor | null>(null);
  const [isModalNovoOpen, setIsModalNovoOpen] = useState(false);

  // Estados para a edição
  const [isModalEditarOpen, setIsModalEditarOpen] = useState(false);
  const [profEditando, setProfEditando] = useState({ id: '', nome: '', email: '', disciplina: '' });
  
  // Estado do formulário
  const [novoProf, setNovoProf] = useState({ nome: '', email: '', cpf: '', disciplina: 'Matemática' });

  // GET: Listar
  const { data: professores, isLoading } = useQuery<Professor[]>({
    queryKey: ['professores'],
    queryFn: async () => {
      const response = await api.get('/api/Professor');
      return response.data;
    }
  });

  // POST: Criar
  const mutationCriar = useMutation({
    mutationFn: async (dados: typeof novoProf) => {
      await api.post('/api/Professor', dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      setIsModalNovoOpen(false);
      setNovoProf({ nome: '', email: '', cpf: '', disciplina: 'Matemática' }); // Limpa form
      toast.success('Professor cadastrado com sucesso! A senha foi enviada para o e-mail.');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao cadastrar')
  });

  // PUT: Atualizar
  const mutationEditar = useMutation({
    mutationFn: async (dados: typeof profEditando) => {
      await api.put(`/api/Professor/${dados.id}`, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      setIsModalEditarOpen(false);
      setProfSelecionado(null);
      toast.success('Professor atualizado com sucesso!');
    }
  });

  const handleEditar = (e: React.FormEvent) => {
    e.preventDefault();
    mutationEditar.mutate(profEditando);
  };

  const abrirModalEdicao = (prof: Professor) => {
    setProfEditando({ id: prof.id, nome: prof.nome, email: prof.email, disciplina: prof.disciplina });
    setIsModalEditarOpen(true);
  };

  // DELETE: Inativar
  const mutationExcluir = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/Professor/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professores'] });
      setProfSelecionado(null);
    }
  });

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault();
    mutationCriar.mutate(novoProf);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Presentation className="text-indigo-500" />Corpo Docente</h2>
          <p className="text-slate-500">Gerencie os professores cadastrados na instituição.</p>
        </div>
        <button 
          onClick={() => setIsModalNovoOpen(true)} 
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-500/30 hover:shadow-indigo-500/50 cursor-pointer"
        >
          <UserPlus size={18} /> Novo Professor
        </button>
      </header>

      {/* --- GRID DE PROFESSORES (Seu código mantido) --- */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-slate-500">
          <Loader2 className="animate-spin mr-2" /> Carregando professores...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {professores?.map(prof => (
            <div key={prof.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center flex flex-col items-center gap-3 transition-all hover:shadow-md hover:border-indigo-200">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold">
                {prof.nome.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1" title={prof.nome}>{prof.nome}</h3>
                <div className="flex items-center justify-center gap-1 text-slate-500 text-xs mt-1">
                  <Mail size={12} /> {prof.email}
                </div>
              </div>
              <div className="mt-2 w-full bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg flex items-center justify-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                <BookOpen size={14} className="text-amber-500" />
                {prof.disciplina || 'Sem disciplina'}
              </div>
              
              <button 
                onClick={() => setProfSelecionado(prof)}
                className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 w-full py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors cursor-pointer"
              >
                Ver Detalhes
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DE DETALHES --- */}
      {profSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 dark:border-slate-700 relative">
            <button onClick={() => setProfSelecionado(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={20} />
            </button>

            {/* Cabeçalho do Detalhe */}
            <div className="flex items-center justify-between mb-6 border-b pb-6 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-3xl font-bold">
                  {profSelecionado.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{profSelecionado.nome}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 mt-1">
                    <Mail size={14} /> {profSelecionado.email}
                  </p>
                </div>
              </div>
              
              {/* Botões de Ação (Editar e Excluir/Inativar) */}
              <div className="flex gap-2">
                <button 
                  onClick={() => abrirModalEdicao(profSelecionado)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors cursor-pointer"
                  title="Editar Professor"
                >
                  <PenBox size={20} /> {/* Pode trocar por um ícone de Edit/Pencil do Lucide */}
                </button>
                <button 
                  onClick={() => { if(window.confirm('Deseja inativar este professor?')) mutationExcluir.mutate(profSelecionado.id) }}
                  className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors cursor-pointer"
                  title="Desativar Professor"
                >
                  {mutationExcluir.isPending ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                </button>
              </div>
            </div>

            {/* Informações do Professor */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><Fingerprint size={14}/> CPF</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{profSelecionado.cpf}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-1"><FileText size={14}/> Registro (RP)</p>
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{profSelecionado.rp}</p>
              </div>
            </div>

            <div className="mb-2 flex items-center gap-2 text-slate-800 dark:text-white font-bold">
              <GraduationCap className="text-indigo-500" size={20} /> Turmas Vinculadas
            </div>
            
            {profSelecionado.turmas && profSelecionado.turmas.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profSelecionado.turmas.map((turma, idx) => (
                  <span key={idx} className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {turma}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-center border border-dashed border-slate-300 dark:border-slate-700">
                Este professor ainda não foi vinculado a nenhuma turma.
              </p>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL DE EDITAR PROFESSOR --- */}
      {isModalEditarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 relative">
            <button onClick={() => setIsModalEditarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Editar Professor</h3>
            
            <form onSubmit={handleEditar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input required type="text" value={profEditando.nome} onChange={e => setProfEditando({...profEditando, nome: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input required type="email" value={profEditando.email} onChange={e => setProfEditando({...profEditando, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Disciplina Principal</label>
                <select value={profEditando.disciplina} onChange={e => setProfEditando({...profEditando, disciplina: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Arte">Arte</option>
                  <option value="Biologia">Biologia</option>
                  <option value="Educação Física">Educação Física</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Filosofia">Filosofia</option>
                  <option value="Física">Física</option>
                  <option value="Geografia">Geografia</option>
                  <option value="História">História</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Português">Português</option>
                  <option value="Química">Química</option>
                  <option value="Sociologia">Sociologia</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalEditarOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white py-2 rounded-xl font-medium transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={mutationEditar.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors cursor-pointer">
                  {mutationEditar.isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE NOVO PROFESSOR --- */}
      {isModalNovoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 relative">
            <button onClick={() => setIsModalNovoOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Cadastrar Professor</h3>
            
            <form onSubmit={handleCriar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                <input required type="text" value={novoProf.nome} onChange={e => setNovoProf({...novoProf, nome: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: João da Silva"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input required type="email" value={novoProf.email} onChange={e => setNovoProf({...novoProf, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="joao@escola.com"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CPF (Só números)</label>
                <input required type="text" maxLength={11} value={novoProf.cpf} onChange={e => setNovoProf({...novoProf, cpf: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="11122233344"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Disciplina Principal</label>
                <select value={novoProf.disciplina} onChange={e => setNovoProf({...novoProf, disciplina: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="Arte">Arte</option>
                  <option value="Biologia">Biologia</option>
                  <option value="Educação Física">Educação Física</option>
                  <option value="Espanhol">Espanhol</option>
                  <option value="Filosofia">Filosofia</option>
                  <option value="Física">Física</option>
                  <option value="Geografia">Geografia</option>
                  <option value="História">História</option>
                  <option value="Inglês">Inglês</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Português">Português</option>
                  <option value="Química">Química</option>
                  <option value="Sociologia">Sociologia</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" onClick={() => setIsModalNovoOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white py-2 rounded-xl font-medium transition-colors cursor-pointer">Cancelar</Button>
                <Button type="submit" disabled={mutationCriar.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl font-medium flex justify-center items-center gap-2 transition-colors cursor-pointer">
                  {mutationCriar.isPending ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} Salvar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}