import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore'; // Ajuste o caminho se necessário

// Defini que o componente PODE receber um array de roles permitidas
interface PrivateRouteProps {
  allowedRoles?: string[];
}

export function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
  const { user } = useAuthStore();
  const token = localStorage.getItem('@EduConnect:token');

  // 1. Se não tem token ou não tem usuário salvo, expulsa pro login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se a rota exige papéis (roles) específicos e o usuário atual não está na lista, barra o acesso
  if (allowedRoles && !allowedRoles.includes(user.tipo)) {
    // Redireciona o usuário para o dashboard principal dele
    // (Você pode criar uma rota /acesso-negado no futuro se preferir)
    return <Navigate to="/" replace />; 
  }

  // 3. Passou por tudo? Renderiza a página normalmente
  return <Outlet />;
}