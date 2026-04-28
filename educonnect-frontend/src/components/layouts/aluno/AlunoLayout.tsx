import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { useThemeStore } from '../../../store/useThemeStore';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Calendar, Sun, Moon, 
  ClipboardList, BookOpen, GraduationCap, Megaphone, 
  MessageSquare,
  CircleDollarSign,
  MapPin,
  Users,
  Trophy,
  CalendarDays,
  DollarSign,
  Shirt,
  Bell,
  Presentation,
  FileBarChart
} from 'lucide-react';
import { useState } from 'react';

export function AlunoLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors">
      
      {/* SIDEBAR LATERAL */}
      {/* Menu Lateral (Sidebar) */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen transition-colors">
        
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
            <GraduationCap className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
            Edu<span className="text-indigo-600 dark:text-indigo-500">Connect</span>
          </h1>
        </div>

        {/* Área de Navegação com Scroll */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
          
          {/* GESTÃO */}
          <div>
            <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Gestão
            </p>
            <div className="space-y-1">
              <Link to="/aluno/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${location.pathname === '/aluno/dashboard' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'}`}>
                <LayoutDashboard size={18} /> Visão Geral
              </Link>
              <Link to="/aluno/boletim" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${location.pathname.includes('/boletim') ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'}`}>
                <FileBarChart size={18} /> Boletim
              </Link>
            </div>
          </div>

          {/* ACADÊMICO */}
          <div>
            <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Acadêmico
            </p>
            <div className="space-y-1">
              <Link to="/aluno/ranking" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${location.pathname.includes('/ranking') ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'}`}>
                <Trophy size={18} /> Ranking
              </Link>
              <Link to="/aluno/calendario" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${location.pathname.includes('/calendario') ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'}`}>
                <CalendarDays size={18} /> Calendário
              </Link>
            </div>
          </div>

          {/* COMUNICAÇÃO */}
          <div>
            <p className="px-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Comunicação
            </p>
            <div className="space-y-1">
              <Link to="/aluno/comunicados" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${location.pathname.includes('/comunicados') ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'}`}>
                <Megaphone size={18} /> Comunicados
              </Link>
              <Link to="/aluno/chat" className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${location.pathname.includes('/chat') ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50'}`}>
                <MessageSquare size={18} /> Chat
              </Link>
            </div>
          </div>
          
        </nav>

        {/* Footer do Menu / Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 rounded-xl font-bold text-sm transition-colors cursor-pointer"
          >
            <LogOut size={18} /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER SUPERIOR ATUALIZADO */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 flex-shrink-0 relative z-20">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Bem-vindo(a), <strong className="text-slate-800 dark:text-slate-200">{user?.nome}</strong> 
            <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">{user?.tipo}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* SININHO DE NOTIFICAÇÕES */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors relative cursor-pointer"
              >
                <Bell size={20} />
                {/* Bolinha vermelha indicando nova notificação */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
              </button>

              {/* DROPDOWN DE NOTIFICAÇÕES */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-800 dark:text-white">Notificações</h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:underline">Marcar como lidas</span>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto">
                    {/* Exemplo de Notificação 1 (Dinâmico depois) */}
                    <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer">
                      <p className="text-xs font-bold text-indigo-500 mb-1">Novo Pedido de Uniforme</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-tight">João Silva (Pai) solicitou uma Camisa P.</p>
                      <p className="text-[10px] text-slate-400 mt-2">Há 5 minutos</p>
                    </div>
                    
                    {/* Exemplo de Notificação 2 */}
                    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer opacity-70">
                      <p className="text-xs font-bold text-emerald-500 mb-1">Matrícula Aprovada</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-tight">O aluno Pedro Santos foi matriculado com sucesso.</p>
                      <p className="text-[10px] text-slate-400 mt-2">Há 2 horas</p>
                    </div>
                  </div>
                  
                  <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50/50 dark:bg-slate-900/50">
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Ver todas as notificações</button>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÃO DE TEMA */}
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </header>

        {/* CONTEÚDO DA PÁGINA (SCROLLÁVEL) */}
        <section className="p-6 md:p-8 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
}