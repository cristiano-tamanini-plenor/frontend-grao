import { useMemo } from 'react';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

export interface InvestmentMetrics {
  totalInvested: number;
  profitDistribution: number;
  monthlyReturn: number;
  totalAssets: number;
}

// Dados mockados para o dashboard de investimentos
// TODO: Substituir por chamadas à API quando disponível
const mockInvestmentData = {
  totalInvested: 1250000.00, // R$ 1.250.000
  profitDistribution: 185000.00, // R$ 185.000
  monthlyReturn: 12.5, // 12.5%
  totalAssets: 1435000.00, // R$ 1.435.000 (investido + lucros)
};

export function useInvestmentCards() {
  const { currentCompany } = useCompany();

  // TODO: Implementar chamada à API quando disponível
  const metrics: InvestmentMetrics = useMemo(() => {
    if (!currentCompany?.id) {
      return {
        totalInvested: 0,
        profitDistribution: 0,
        monthlyReturn: 0,
        totalAssets: 0,
      };
    }

    // Por enquanto, retorna dados mockados
    return mockInvestmentData;
  }, [currentCompany?.id]);

  // Simula loading por enquanto (será substituído por query real)
  const isLoading = false;

  return {
    metrics,
    isLoading,
  };
}
