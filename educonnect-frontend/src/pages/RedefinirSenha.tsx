import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { KeyRound, ArrowLeft, MailCheck, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';

export function RedefinirSenha() {
  const { theme, toggleTheme } = useThemeStore(); // Puxando o tema

  const navigate = useNavigate();
  
  // Controle de etapas: 1 = Pedir Código, 2 = Digitar Código e Senha
  const [etapa, setEtapa] = useState<1 | 2>(1);
  
  const [identificacao, setIdentificacao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSolicitarCodigo = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await api.post('/api/Auth/solicitar-codigo', { identificacao });
      // Independente do erro ou sucesso real, o backend retorna OK por segurança.
      setEtapa(2); 
    } catch (error) {
      setErro('Ocorreu um erro ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await api.post('/api/Auth/redefinir-senha', {
        identificacao,
        codigo,
        novaSenha
      });
      
      toast.success('Senha redefinida com sucesso! Você já pode fazer login.');
      navigate('/login');
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao redefinir. Código inválido ou formato da senha incorreto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">

        {/* Botão de Tema no canto superior */}
        <button
            onClick={toggleTheme}
            className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
        >
            {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
        </button>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-700 relative">
        
        {etapa === 1 && (
          <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={24} />
          </Link>
        )}

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
            {etapa === 1 ? <KeyRound size={28} /> : <MailCheck size={28} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            {etapa === 1 ? 'Recuperar Acesso' : 'Código Enviado'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 px-4">
            {etapa === 1 
              ? 'Digite seu RA ou E-mail. Enviaremos um código de 6 dígitos para o seu contato cadastrado.' 
              : `Enviamos um código para o e-mail vinculado a ${identificacao}.`}
          </p>
        </div>

        {erro && <p className="text-red-500 text-xs text-center font-bold bg-red-50 dark:bg-red-900/30 p-2 rounded-lg mb-4">{erro}</p>}

        {etapa === 1 ? (
          <form onSubmit={handleSolicitarCodigo} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <Input 
              label="E-mail ou RA" 
              type="text" 
              placeholder="Digite sua identificação..." 
              value={identificacao} 
              onChange={(e) => setIdentificacao(e.target.value)} 
              required 
            />
            <div className="pt-1">
            <Button type="submit" isLoading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-sm shadow-md transition-all cursor-pointer">
              Enviar Código
            </Button>
          </div>
          </form>
        ) : (
          <form onSubmit={handleRedefinirSenha} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <Input 
              label="Código de 6 dígitos" 
              type="text" 
              placeholder="000000"
              value={codigo} 
              onChange={(e) => setCodigo(e.target.value)} 
              maxLength={6}
              className="tracking-[0.5em] text-center font-bold border rounded-xl text-slate-800 dark:text-white"
              required 
            />
            <div className="space-y-1">
              <Input 
                label="Nova Senha" 
                type="password" 
                placeholder="••••••••" 
                value={novaSenha} 
                onChange={(e) => setNovaSenha(e.target.value)} 
                required 
              />
              <p className="text-[10px] text-slate-400">
                Mín. 8 caracteres, maiúscula, minúscula, número e caractere especial (@$!%*?&).
              </p>
            </div>
            
            <div className="pt-1">
            <Button type="submit" isLoading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-sm shadow-md transition-all cursor-pointer">
              Redefinir e Acessar
            </Button>
          </div>

            <button 
              type="button" 
              onClick={() => setEtapa(1)} 
              className="w-full text-xs text-slate-500 hover:text-indigo-600 font-bold mt-2 cursor-pointer"
            >
              Voltar e corrigir e-mail/RA
            </button>
          </form>
        )}
      </div>
    </div>
  );
}