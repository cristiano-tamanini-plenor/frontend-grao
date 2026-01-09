import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

export interface InvestmentEvolutionData {
  mes: string;
  mesNumero: number;
  value: number;
}

// Dados mockados para evolução dos investimentos
// TODO: Substituir por chamadas à API quando disponível
// Nota: Variações incluem meses com retiradas (valores menores) e meses com novos investimentos (valores maiores)
const mockEvolutionData: InvestmentEvolutionData[] = [
  { mes: 'Jan', mesNumero: 1, value: 1150000 },   // Início do ano
  { mes: 'Fev', mesNumero: 2, value: 1250000 },   // +100k (novo investimento)
  { mes: 'Mar', mesNumero: 3, value: 1180000 },   // -70k (retirada)
  { mes: 'Abr', mesNumero: 4, value: 1320000 },   // +140k (novo investimento + ganhos)
  { mes: 'Mai', mesNumero: 5, value: 1285000 },   // -35k (retirada parcial)
  { mes: 'Jun', mesNumero: 6, value: 1380000 },   // +95k (novo investimento)
  { mes: 'Jul', mesNumero: 7, value: 1350000 },   // -30k (retirada)
  { mes: 'Ago', mesNumero: 8, value: 1420000 },   // +70k (ganhos + pequeno aporte)
  { mes: 'Set', mesNumero: 9, value: 1395000 },   // -25k (retirada)
  { mes: 'Out', mesNumero: 10, value: 1480000 },  // +85k (novo investimento)
  { mes: 'Nov', mesNumero: 11, value: 1450000 },  // -30k (retirada)
  { mes: 'Dez', mesNumero: 12, value: 1435000 },  // +70k (ganhos + aporte final)
];

export function useInvestmentEvolution(year: number) {
  const { currentCompany } = useCompany();

  // TODO: Implementar chamada à API quando disponível
  const { data, isLoading } = useQuery<InvestmentEvolutionData[]>({
    queryKey: ['investment-evolution', currentCompany?.id, year],
    queryFn: async () => {
      if (!currentCompany?.id) {
        return [];
      }
      
      // Por enquanto, retorna dados mockados
      // Quando a API estiver disponível, substituir por:
      // return await investmentService.getEvolution({ companyId: currentCompany.id, year });
      
      // Simula um pequeno delay para parecer mais real
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return mockEvolutionData;
    },
    enabled: !!currentCompany?.id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const processedData = useMemo(() => {
    return data || [];
  }, [data]);

  return {
    data: processedData,
    isLoading,
  };
}
