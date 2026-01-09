import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PageContent } from '@/components/layout/PageContent';
import { ListHeader } from '@/components/ListHeader';
import { TrendingUp } from 'lucide-react';
import InvestmentCards from './investment-cards';
import InvestmentEvolution from './investment-evolution';

export default function Home() {
  const { isAuthenticated, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Obtém o nome do usuário (prioriza profile, depois user)
  const userName = profile?.name || user?.name || 'Usuário';

  return (
    <PageContent>
      <div className="p-3 space-y-3 w-full h-full overflow-y-auto">
        {/* Header */}
        <ListHeader 
          title={`Olá, ${userName}`}
          canCreate={false}
        />

        {/* Cards de Métricas */}
        <InvestmentCards />

        {/* Gráfico de Evolução dos Investimentos */}
        <InvestmentEvolution />
      </div>
    </PageContent>
  );
}
