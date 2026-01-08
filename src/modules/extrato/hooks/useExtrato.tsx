import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { extratoService, ExtratoItem, ExtratoResponse } from '../services/extrato.service';

export function useExtrato() {
  const { toast } = useToast();
  const { currentCompany } = useCompany();
  
  const [extratoData, setExtratoData] = useState<ExtratoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [metrics, setMetrics] = useState<ExtratoResponse['meta']['metrics'] | null>(null);

  const fetchExtrato = async (startDate?: string, endDate?: string) => {
    if (!currentCompany?.client_id || !currentCompany?.client_secret) {
      toast({
        title: "Erro",
        description: "Chaves de API não configuradas para esta empresa",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Usar dados mockados por enquanto
      const data = await extratoService.getExtrato({
        client_id: currentCompany.client_id,
        client_secret: currentCompany.client_secret,
        start_date: startDate,
        end_date: endDate,
      });

      setExtratoData(data.data);
      setMetrics(data.meta.metrics);
      
      // Calcular saldo atual baseado nas métricas
      setSaldoAtual(data.meta.metrics.saldo_final);
      
      toast({
        title: "Sucesso",
        description: "Extrato carregado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao buscar extrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar extrato. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentCompany) {
      fetchExtrato();
    }
  }, [currentCompany]);

  return {
    extratoData,
    isLoading,
    saldoAtual,
    metrics,
    fetchExtrato,
  };
}
