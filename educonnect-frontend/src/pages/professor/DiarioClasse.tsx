import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, CheckSquare, GraduationCap, Loader2, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
}

export function DiarioClasse() {
  // 1. Pega o Professor REAL que está logado no sistema
  const { user } = useAuthStore();
  const professorId = user?.id;

  // 2. Novo Estado: Qual turma o professor selecionou no Dropdown?
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>('');

  const [modo, setModo] = useState<'frequencia' | 'notas'>('frequencia');
  const [bimestre, setBimestre] = useState('1');
  const [dataAula, setDataAula] = useState(new Date().toISOString().split('T')[0]);
  
  const [notasTemp, setNotasTemp] = useState<{ [alunoId: string]: string }>({});
  const [frequenciaTemp, setFrequenciaTemp] = useState<{ [alunoId: string]: boolean }>({});

  // 3. Pegar a lista de turmas que esse professor dá aula
  const { data: turmasDoProfessor } = useQuery({
    queryKey: ['turmas-professor', professorId],
    queryFn: async () => {
      const response = await api.get(`/api/Professor/${professorId}/minhas-turmas`);
      return response.data; 
    },
    enabled: !!professorId // Só busca se o professorId existir
  });

  // 4. A busca de alunos agora depende da TURMA SELECIONADA
  const { data: alunos, isLoading } = useQuery<Aluno[]>({
    queryKey: ['alunos-turma', turmaSelecionada],
    queryFn: async () => {
      const response = await api.get(`/api/Professor/${professorId}/turma/${turmaSelecionada}/alunos`);
      
      const presencasIniciais: any = {};
      response.data.forEach((aluno: Aluno) => presencasIniciais[aluno.id] = true);
      setFrequenciaTemp(presencasIniciais);

      return response.data;
    },
    enabled: !!turmaSelecionada // SÓ BUSCA OS ALUNOS SE ELE ESCOLHER UMA TURMA
  });

  // Mutations atualizadas para usar a turmaSelecionada
  const lancarNotaMutation = useMutation({
    mutationFn: async (dados: { alunoId: string, nota: number }) => {
      return api.post(`/api/Professor/${professorId}/lancar-nota`, {
        alunoId: dados.alunoId,
        turmaId: turmaSelecionada, // Usando a turma real
        nota: dados.nota,
        bimestre: parseInt(bimestre)
      });
    }
  });

  const lancarChamadaMutation = useMutation({
    mutationFn: async (dados: { alunoId: string, presente: boolean }) => {
      return api.post(`/api/Professor/${professorId}/fazer-chamada`, {
        alunoId: dados.alunoId,
        turmaId: turmaSelecionada, // Usando a turma real
        presente: dados.presente,
        dataAula: dataAula
      });
    }
  });

  // Função para salvar tudo da tela
  const handleSalvar = async () => {
    if (!alunos) return;

    if (modo === 'frequencia') {
      for (const aluno of alunos) {
        await lancarChamadaMutation.mutateAsync({
          alunoId: aluno.id,
          presente: frequenciaTemp[aluno.id] ?? false
        });
      }
      toast.success('Chamada salva!');
    } else {
      for (const aluno of alunos) {
        const notaStr = notasTemp[aluno.id];
        if (notaStr !== undefined && notaStr !== '') {
          await lancarNotaMutation.mutateAsync({
            alunoId: aluno.id,
            nota: parseFloat(notaStr.replace(',', '.'))
          });
        }
      }
      toast.success('Notas salvas com sucesso!');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Users className="text-indigo-500" /> Diário de Classe
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Lançamento de Notas e Frequência.</p>
        </div>

        {/* 5. O DROPDOWN ONDE O PROFESSOR ESCOLHE A TURMA */}
        <select 
          value={turmaSelecionada}
          onChange={(e) => setTurmaSelecionada(e.target.value)}
          className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2.5 outline-none font-medium text-slate-900 dark:text-white cursor-pointer"
        >
          <option value="">Selecione uma Turma...</option>
          {turmasDoProfessor?.map((t: any) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </header>

      {/* SÓ MOSTRA O RESTO SE ELE SELECIONOU UMA TURMA */}
      {turmaSelecionada ? (
        <>

      {/* CONTROLES DO DIÁRIO */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Toggle Modo */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button
            onClick={() => setModo('frequencia')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${modo === 'frequencia' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <CheckSquare size={18} /> Chamada
          </button>
          <button
            onClick={() => setModo('notas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${modo === 'notas' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <GraduationCap size={18} /> Notas
          </button>
        </div>

        {/* Filtros Contextuais */}
        <div className="flex gap-4">
          {modo === 'frequencia' ? (
            <Input type="date" value={dataAula} onChange={e => setDataAula(e.target.value)} />
          ) : (
            <select 
              value={bimestre} 
              onChange={e => setBimestre(e.target.value)}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2.5 outline-none text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="1">1º Bimestre</option>
              <option value="2">2º Bimestre</option>
              <option value="3">3º Bimestre</option>
              <option value="4">4º Bimestre</option>
            </select>
          )}
          
          <Button 
            onClick={handleSalvar} 
            disabled={lancarChamadaMutation.isPending || lancarNotaMutation.isPending}
            className="h-12 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 flex items-center gap-2 border-0"
          >
            {lancarChamadaMutation.isPending || lancarNotaMutation.isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            <span>
              {lancarChamadaMutation.isPending || lancarNotaMutation.isPending 
                ? "Salvando dados..." 
                : "Salvar"}
            </span>
          </Button>
        </div>
      </div>

      </>
      ) : (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-100 dark:border-slate-700 text-center text-slate-500">
          Selecione uma turma no menu acima para carregar o diário.
        </div>
      )}

      {/* LISTA DE ALUNOS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={32} /></div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Aluno</th>
                <th className="px-6 py-4 text-center">
                  {modo === 'frequencia' ? 'Status (Presente?)' : 'Nota (0 a 10)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {alunos?.map((aluno) => (
                <tr key={aluno.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    {aluno.nome}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    {modo === 'frequencia' ? (
                      // SWITCH DE PRESENÇA
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={frequenciaTemp[aluno.id] ?? true}
                          onChange={(e) => setFrequenciaTemp({...frequenciaTemp, [aluno.id]: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer dark:bg-red-900/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        <span className="ml-3 text-sm font-medium">
                          {frequenciaTemp[aluno.id] ? <span className="text-emerald-600 font-bold">P</span> : <span className="text-red-500 font-bold">F</span>}
                        </span>
                      </label>
                    ) : (
                      // INPUT DE NOTA
                      <input 
                        type="number" 
                        min="0" 
                        max="10" 
                        step="0.1"
                        placeholder="Ex: 8.5"
                        value={notasTemp[aluno.id] || ''}
                        onChange={(e) => setNotasTemp({...notasTemp, [aluno.id]: e.target.value})}
                        className="w-24 text-center border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      />
                    )}
                  </td>
                </tr>
              ))}
              {alunos?.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                    Nenhum aluno encontrado nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}