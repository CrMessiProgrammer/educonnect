import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Login } from './pages/Login';
import { DashboardPrincipal } from './pages/admin/DashboardPrincipal';
import { SolicitarMatricula } from './pages/SolicitarMatricula';
import { GerenciarMatriculas } from './pages/admin/GerenciarMatriculas';
import { PrivateRoute } from './components/layouts/PrivateRoute';
import { AdminLayout } from './components/layouts/admin/AdminLayout';
import { ProfessorLayout } from './components/layouts/professor/ProfessorLayout';
import { AlunoLayout } from './components/layouts/aluno/AlunoLayout';
import { useThemeStore } from './store/useThemeStore';

// IMPORTANDO AS FERRAMENTAS DO REACT QUERY
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { GerenciarTurmas } from './pages/admin/GerenciarTurmas';
import { GerenciarProfessores } from './pages/admin/GerenciarProfessores';
import { Comunicados } from './pages/admin/Comunicados';
import { PagamentosPendentes } from './pages/admin/PagamentosPendentes';
import { RankingAcademico } from './pages/admin/RankingAcademico';
import { GerenciarVisitas } from './pages/admin/GerenciarVisitas';
import { GerenciarUniformes } from './pages/admin/GerenciarUniformes';
import { Calendario } from './pages/admin/Calendario';
import { Chat } from './pages/admin/Chat';
import { GerenciarAlunos } from './pages/admin/GerenciarAlunos';
import { AgendarVisita } from './pages/AgendarVisita';
import { RedefinirSenha } from './pages/RedefinirSenha';
import { RelatorioGeral } from './pages/admin/RelatorioGeral';
import { DiarioClasse } from './pages/professor/DiarioClasse';
import { DashboardProfessor } from './pages/professor/DashboardProfessor';
import { DashboardAluno } from './pages/aluno/DashboardAluno';
import { RankingProfessor } from './pages/professor/RankingProfessor';
import { MinhasTurmas } from './pages/professor/MinhasTurmas';
import { BoletimAluno } from './pages/aluno/BoletimAluno';
import { RankingAluno } from './pages/aluno/RankingAluno';
import { ResponsavelLayout } from './components/layouts/responsavel/ResponsavelLayout';
import { MeusFilhos } from './pages/responsavel/MeusFilhos';
import { DashboardResponsavel } from './pages/responsavel/DashboardResponsavel';
import { FinanceiroResponsavel } from './pages/responsavel/FinanceiroResponsavel';
import { UniformeResponsavel } from './pages/responsavel/UniformeResponsavel';
import { BoletimResponsavel } from './pages/responsavel/BoletimResponsavel';

// CRIANDO O CLIENTE DE CACHE
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Não refaz a requisição só de mudar de aba
      staleTime: 1000 * 60 * 5,    // O cache fica "fresco" por 5 minutos
    },
  },
});

export default function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme(); // Executa apenas 1 vez ao abrir o site
  }, []);

  return (
    // ENVELOPANDO O APP COM O PROVIDER
    <QueryClientProvider client={queryClient}>

      {/* position="top-right" deixa ele no canto superior direito */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#334155',
            color: '#fff',
            borderRadius: '12px',
          },
        }} 
      />
      <BrowserRouter>
        <Routes>
          {/* 🟢 ROTAS PÚBLICAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/solicitar-matricula" element={<SolicitarMatricula />} />
          <Route path="/agendar-visita" element={<AgendarVisita />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />

          {/* 🔴 ROTAS DO ADMINISTRADOR */}
          <Route element={<PrivateRoute allowedRoles={['Administrador']} />}>
            {/* Todas as rotas aqui dentro usarão o Layout com Sidebar */}
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<DashboardPrincipal />} />
              <Route path="/admin/matriculas" element={<GerenciarMatriculas />} />
              <Route path="/admin/turmas" element={<GerenciarTurmas />} />
              <Route path="/admin/professores" element={<GerenciarProfessores />} />
              <Route path="/admin/comunicados" element={<Comunicados />} />
              <Route path="/admin/financeiro" element={<PagamentosPendentes />} />
              <Route path="/admin/ranking" element={<RankingAcademico />} />
              <Route path="/admin/visitas" element={<GerenciarVisitas />} />
              <Route path="/admin/uniformes" element={<GerenciarUniformes />} />
              <Route path="/admin/calendario" element={<Calendario />} />
              <Route path="/admin/chat" element={<Chat />} />
              <Route path="/admin/alunos" element={<GerenciarAlunos />} />
              <Route path="/admin/relatorio" element={<RelatorioGeral />} />
            </Route>
          </Route>

          {/* 🔵 ROTAS DO PROFESSOR */}
          <Route element={<PrivateRoute allowedRoles={['Professor']} />}>
            <Route element={<ProfessorLayout />}>
              <Route path="/professor/dashboard" element={<DashboardProfessor />} />
              <Route path="/professor/diario" element={<DiarioClasse />} />
              <Route path="/professor/turmas" element={<MinhasTurmas />} />
              <Route path="/professor/ranking" element={<RankingProfessor />} />
              <Route path="/professor/calendario" element={<Calendario />} />
              <Route path="/professor/comunicados" element={<Comunicados />} />
              <Route path="/professor/chat" element={<Chat />} />
            </Route>
          </Route>

          {/* 🟡 ROTAS DO ALUNO / RESPONSÁVEL */}
          <Route element={<PrivateRoute allowedRoles={['Aluno']} />}>
            <Route element={<AlunoLayout />}>
              <Route path="/aluno/dashboard" element={<DashboardAluno />} />
              <Route path="/aluno/boletim" element={<BoletimAluno />} />
              <Route path="/aluno/ranking" element={<RankingAluno />} />
              <Route path="/aluno/calendario" element={<Calendario />} />
              <Route path="/aluno/comunicados" element={<Comunicados />} />
              <Route path="/aluno/chat" element={<Chat />} />
            </Route>
          </Route>

          {/* 🟡 ROTAS DO RESPONSÁVEL */}
          <Route element={<PrivateRoute allowedRoles={['Responsavel']} />}>
            <Route element={<ResponsavelLayout />}>
              <Route path="/responsavel/dashboard" element={<DashboardResponsavel />} />
              <Route path="/responsavel/filho" element={<MeusFilhos />} />
              <Route path="/responsavel/boletim" element={<BoletimResponsavel />} />
              <Route path="/responsavel/calendario" element={<Calendario />} />
              <Route path="/responsavel/financeiro" element={<FinanceiroResponsavel />} />
              <Route path="/responsavel/uniformes" element={<UniformeResponsavel />} />
              <Route path="/responsavel/comunicados" element={<Comunicados />} />
              <Route path="/responsavel/chat" element={<Chat />} />
            </Route>
          </Route>

          {/* Fallback */}
          {/* Se o usuário digitar qualquer rota que não existe, manda pro login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}