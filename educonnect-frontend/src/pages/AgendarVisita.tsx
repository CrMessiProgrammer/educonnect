import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { CalendarPlus, ArrowLeft, Clock, CheckCircle2, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

export function AgendarVisita() {
  const { theme, toggleTheme } = useThemeStore(); // Puxando o tema

  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataVisita, setDataVisita] = useState('');
  const [horarioSelecionado, setHorarioSelecionado] = useState('');
  
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [buscandoHorarios, setBuscandoHorarios] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  // Busca os horários na API sempre que a data mudar
  useEffect(() => {
    if (!dataVisita) return;

    const fetchHorarios = async () => {
      setBuscandoHorarios(true);
      setHorarioSelecionado('');
      try {
        const response = await api.get(`/api/Visita/horarios-disponiveis/${dataVisita}`);
        setHorariosDisponiveis(response.data);
      } catch (error) {
        console.error("Erro ao buscar horários", error);
        setHorariosDisponiveis([]);
      } finally {
        setBuscandoHorarios(false);
      }
    };

    fetchHorarios();
  }, [dataVisita]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    
    if (!horarioSelecionado) {
      setErro('Por favor, selecione um horário disponível.');
      return;
    }

    setLoading(true);
    try {
      // Junta a data e o horário no formato que o C# espera (DateTime)
      const dataHoraVisita = `${dataVisita}T${horarioSelecionado}:00`;

      await api.post('/api/Visita/agendar', {
        nomeVisitante: nome,
        email,
        telefone: telefone.replace(/\D/g, ''), // Remove tudo que não é número
        dataHoraVisita
      });

      setSucesso(true);
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao agendar visita. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-100 dark:border-slate-700">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Visita Agendada!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
            Sua solicitação foi registrada com sucesso. Em breve você receberá um e-mail de confirmação com mais detalhes.
          </p>
          <div className="pt-1">
            <Button onClick={() => navigate('/login')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-sm shadow-md transition-all cursor-pointer">
              Voltar para Tela de Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-10 px-4">
        
      {/* Botão de Tema no canto superior */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-md hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-700 relative">
        
        <Link to="/login" className="absolute top-6 left-6 text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
            <CalendarPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Agendar Visita</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Venha conhecer a nossa estrutura presencialmente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome Completo (Responsável)" type="text" placeholder="Ex: João da Silva" value={nome} onChange={(e) => setNome(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="E-mail" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Telefone (WhatsApp)" type="text" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} required />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <Input 
              label="Data da Visita" 
              type="date" 
              value={dataVisita} 
              onChange={(e) => setDataVisita(e.target.value)} 
              // Impede datas no passado no HTML
              min={new Date().toISOString().split('T')[0]} 
              required 
            />
          </div>

          {/* Renderização condicional dos horários */}
          {dataVisita && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Clock size={16} /> Horários Disponíveis
              </label>
              
              {buscandoHorarios ? (
                <p className="text-sm text-slate-400">Buscando horários...</p>
              ) : horariosDisponiveis.length === 0 ? (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-800/50">
                  Nenhum horário disponível para esta data. Finais de semana não possuem expediente.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {horariosDisponiveis.map(hora => (
                    <button
                      key={hora}
                      type="button"
                      onClick={() => setHorarioSelecionado(hora)}
                      className={`py-2 text-sm font-bold rounded-xl border transition-all ${
                        horarioSelecionado === hora 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer'
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {erro && <p className="text-red-500 text-xs text-center font-bold bg-red-50 dark:bg-red-900/30 p-2 rounded-lg">{erro}</p>}

          <div className="pt-1">
            <Button type="submit" isLoading={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-bold text-sm shadow-md transition-all cursor-pointer">
              Confirmar Agendamento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}