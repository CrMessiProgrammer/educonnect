import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { UserPlus, ArrowLeft, UploadCloud, CheckCircle2, FileText, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';

export function SolicitarMatricula() {
  const { theme, toggleTheme } = useThemeStore(); // Puxando o tema

  const navigate = useNavigate();
  
  // Dados do Aluno
  const [alunoNome, setAlunoNome] = useState('');
  const [alunoCPF, setAlunoCPF] = useState('');
  const [alunoDataNascimento, setAlunoDataNascimento] = useState('');
  const [seriePretendida, setSeriePretendida] = useState('1º Ano Fundamental');
  const [arquivoHistorico, setArquivoHistorico] = useState<File | null>(null);

  // Dados do Responsável
  const [responsavelNome, setResponsavelNome] = useState('');
  const [responsavelEmail, setResponsavelEmail] = useState('');
  const [responsavelCPF, setResponsavelCPF] = useState('');
  const [responsavelTelefone, setResponsavelTelefone] = useState('');

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // Manipulador de Arquivo garantindo apenas PDF
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('Por favor, envie apenas arquivos no formato PDF.');
        e.target.value = '';
        setArquivoHistorico(null);
        return;
      }
      setArquivoHistorico(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!arquivoHistorico) {
      setErro('O envio do histórico escolar em PDF é obrigatório.');
      return;
    }

    setLoading(true);

    try {
      // Como temos envio de arquivo, precisamos usar o FormData em vez de JSON
      const formData = new FormData();
      formData.append('AlunoNome', alunoNome);
      formData.append('AlunoCPF', alunoCPF.replace(/\D/g, '')); // Remove pontos e traços pro C#
      formData.append('AlunoDataNascimento', alunoDataNascimento);
      formData.append('SeriePretendida', seriePretendida);
      formData.append('ArquivoHistorico', arquivoHistorico);
      
      formData.append('ResponsavelNome', responsavelNome);
      formData.append('ResponsavelEmail', responsavelEmail);
      formData.append('ResponsavelCPF', responsavelCPF.replace(/\D/g, ''));
      formData.append('ResponsavelTelefone', responsavelTelefone.replace(/\D/g, ''));

      await api.post('/api/Matricula', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Avisa a API que tem arquivo junto
        }
      });

      setSucesso(true);
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao enviar solicitação de matrícula. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  // TELA DE SUCESSO
  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-100 dark:border-slate-700 animate-in zoom-in-95">
          <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Solicitação Recebida!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Os dados e o histórico escolar de <b>{alunoNome}</b> foram enviados com sucesso. Nossa equipe acadêmica fará a análise e você receberá um retorno no e-mail <b>{responsavelEmail}</b>.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-sm shadow-md transition-all cursor-pointer">
            Voltar para a Página Inicial
          </Button>
        </div>
      </div>
    );
  }

  // TELA DO FORMULÁRIO
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-10 px-4 flex justify-center items-start overflow-y-auto">

      {/* Botão de Tema no canto superior */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-xl w-full max-w-3xl border border-slate-100 dark:border-slate-700 relative animate-in fade-in slide-in-from-bottom-4">
        
        <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors" title="Voltar">
          <ArrowLeft size={24} />
        </Link>

        <div className="text-center mb-8 mt-2">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Solicitar Matrícula</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Preencha os dados para iniciar o processo de admissão.</p>
        </div>

        {erro && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm text-center font-bold">{erro}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SEÇÃO 1: DADOS DO ALUNO */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Dados do Aluno
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Nome Completo" type="text" placeholder="Ex: Pedro Silva" value={alunoNome} onChange={e => setAlunoNome(e.target.value)} required />
                <p className="text-xs text-slate-500 mt-1 ml-1">Deve conter nome e sobrenome, iniciando com letras maiúsculas.</p>
              </div>
              <div>
                <Input label="CPF (Apenas números)" type="text" maxLength={11} placeholder="00000000000" value={alunoCPF} onChange={e => setAlunoCPF(e.target.value)} required />
                <p className="text-xs text-slate-500 mt-1 ml-1">Digite exatamente 11 números, sem pontos ou traços.</p>
              </div>
              <div>
                <Input label="Data de Nascimento" type="date" value={alunoDataNascimento} onChange={e => setAlunoDataNascimento(e.target.value)} required />
                <p className="text-xs text-slate-500 mt-1 ml-1">O aluno deve ter a idade mínima para a série pretendida.</p>
              </div>
              
              <div className="md:col-span-2 flex flex-col gap-1 mt-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Série Pretendida</label>
                <select value={seriePretendida} onChange={e => setSeriePretendida(e.target.value)} className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white cursor-pointer">
                  <optgroup label="Ensino Fundamental I">
                    <option value="1º Ano Fundamental">1º Ano Fundamental</option>
                    <option value="2º Ano Fundamental">2º Ano Fundamental</option>
                    <option value="3º Ano Fundamental">3º Ano Fundamental</option>
                    <option value="4º Ano Fundamental">4º Ano Fundamental</option>
                    <option value="5º Ano Fundamental">5º Ano Fundamental</option>
                  </optgroup>
                  <optgroup label="Ensino Fundamental II">
                    <option value="6º Ano Fundamental">6º Ano Fundamental</option>
                    <option value="7º Ano Fundamental">7º Ano Fundamental</option>
                    <option value="8º Ano Fundamental">8º Ano Fundamental</option>
                    <option value="9º Ano Fundamental">9º Ano Fundamental</option>
                  </optgroup>
                  <optgroup label="Ensino Médio">
                    <option value="1º Ano Médio">1º Ano Médio</option>
                    <option value="2º Ano Médio">2º Ano Médio</option>
                    <option value="3º Ano Médio">3º Ano Médio</option>
                  </optgroup>
                </select>
                <p className="text-xs text-slate-500 mt-1 ml-1">Selecione o ano que o aluno irá cursar no próximo período letivo.</p>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: DADOS DO RESPONSÁVEL */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Dados do Responsável
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Nome Completo do Responsável" type="text" placeholder="Ex: Marcia Silva" value={responsavelNome} onChange={e => setResponsavelNome(e.target.value)} required />
                <p className="text-xs text-slate-500 mt-1 ml-1">Nome completo do responsável legal perante a instituição.</p>
              </div>
              <div>
                <Input label="E-mail (Será o seu Login)" type="email" placeholder="marcia@email.com" value={responsavelEmail} onChange={e => setResponsavelEmail(e.target.value)} required />
                <p className="text-xs text-slate-500 mt-1 ml-1">E-mail válido para recebimento de boletos e comunicados.</p>
              </div>
              <div>
                <Input label="Telefone (WhatsApp)" type="text" maxLength={11} placeholder="11999999999" value={responsavelTelefone} onChange={e => setResponsavelTelefone(e.target.value)} required />
                <p className="text-xs text-slate-500 mt-1 ml-1">Formato: DDD + Número (Apenas dígitos).</p>
              </div>
              <div className="md:col-span-2">
                <Input label="CPF (Apenas números)" type="text" maxLength={11} placeholder="00000000000" value={responsavelCPF} onChange={e => setResponsavelCPF(e.target.value)} required />
                <p className="text-xs text-slate-500 mt-1 ml-1">Documento utilizado para geração de contratos e carnês.</p>
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: DOCUMENTAÇÃO (UPLOAD) */}
          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
              <span className="bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
              Histórico Escolar
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Anexe o boletim mais recente ou histórico escolar do aluno para avaliação pedagógica. (Apenas PDF).
            </p>
            
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${arquivoHistorico ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700'}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {arquivoHistorico ? (
                  <>
                    <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{arquivoHistorico.name}</p>
                    <p className="text-xs text-emerald-500 mt-1">Arquivo selecionado (Clique para trocar)</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Clique para enviar o PDF</p>
                    <p className="text-xs text-slate-500 mt-1">Tamanho máximo: 5MB</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} required />
            </label>
          </div>

          <Button type="submit" isLoading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-sm shadow-md transition-all cursor-pointer">
            Enviar Solicitação de Matrícula
          </Button>
          
        </form>
      </div>
    </div>
  );
}