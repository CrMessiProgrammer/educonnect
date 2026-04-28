import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Sun, Moon, GraduationCap, UserPlus, CalendarPlus, KeyRound } from 'lucide-react';
import { AxiosError } from 'axios';

export function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // FUNÇÕES GLOBAIS
  const { login } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  // Tipa o evento como FormEvent
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const response = await api.post('/api/Auth/login', {
        identificador: email, // O campo 'email' do estado vai para a chave 'identificador'
        senha 
      });

      // No Backend, o LoginResponseDto retorna (token, nome, tipoUsuario)
      // O axios coloca isso dentro de response.data
      const { token, nome, tipo, id } = response.data;

      // Salva na Store do Zustand
      login({ id, nome, tipo }, token);

      // 3. Redirecione para a rota CERTA de cada usuário
      if (tipo === 'Administrador') {
        navigate('/dashboard');
      } else if (tipo === 'Professor') {
        navigate('/professor/dashboard');
      } else if (tipo === 'Aluno'){
        navigate('/aluno/dashboard');
      } else {
        navigate('/responsavel/dashboard');
      }
    } catch (error) {
      // Tipando o erro do Axios
      const axiosError = error as AxiosError<{ message: string }>;

      // Se for 401 (Unauthorized) ou 400, pega a mensagem do seu JSON de erro
      setErro(axiosError.response?.data?.message || 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fundo muda de cinza claro para azul-escuro profundo no Dark Mode
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-200 p-4 overflow-hidden">
      
      {/* BOTÃO DE TEMA CLARO/ESCURO */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
      >
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>
      
      {/* O Card do formulário */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl w-full max-w-[400px] border border-slate-100 dark:border-slate-700">
        
        {/* Cabeçalho mais compacto */}
        <div className="text-center mb-5 flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-600 dark:bg-indigo-500 rounded-xl flex items-center justify-center mb-2 rotate-3 shadow-lg shadow-indigo-500/30">
            <span className="text-2xl font-bold text-white -rotate-3"><GraduationCap size={28} /></span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Edu<span className="text-indigo-600 dark:text-indigo-500">Connect</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs font-medium">Portal Acadêmico e Financeiro</p>
        </div>

        {/* Formulário com espaçamento menor (space-y-3) */}
        <form onSubmit={handleLogin} className="space-y-3">
          <Input 
            label="E-mail ou RA" 
            type="text" 
            placeholder="Digite seu acesso"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <Input 
            label="Senha" 
            type="password" 
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {erro && (
            <div className="p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg animate-in fade-in">
              <p className="text-red-600 dark:text-red-400 text-xs text-center font-bold">{erro}</p>
            </div>
          )}

          <div className="pt-1">
            <Button type="submit" isLoading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-sm shadow-md transition-all cursor-pointer">
              Acessar Plataforma
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/redefinir-senha" className="text-xs flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">
            <KeyRound size={14} /> Primeiro Acesso / Redefinir Senha
          </Link>
        </div>

        {/* Divisor com margens reduzidas (my-4) */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Para Novos Alunos
            </span>
          </div>
        </div>

        {/* Botões externos mais finos (py-2) */}
        <div className="flex flex-col gap-2">
          <Link 
            to="/solicitar-matricula" 
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-bold text-xs"
          >
            <UserPlus size={16} /> Matricule-se
          </Link>
          
          <Link 
            to="/agendar-visita" 
            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold text-xs"
          >
            <CalendarPlus size={16} /> Agendar Visita Presencial
          </Link>
        </div>
        
      </div>
    </div>
  );
}