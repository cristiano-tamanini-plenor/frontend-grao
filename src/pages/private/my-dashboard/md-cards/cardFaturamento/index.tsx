import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PIcon } from '@/components/ui/p-icon';
import { useMDCards, FaturamentoItem } from '../useMDCards';
import { Info } from 'lucide-react';
import ModalFaturamento from './modalFaturamento';
import CountUp from 'react-countup';
import { useQuery } from '@tanstack/react-query';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { analystsService } from '@/pages/private/analyst/services/analysts.service';
import { myDashboardService } from '../../services/my-dashboard.service';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CardFaturamentoProps {
  analystId: number | null;
}

export default function CardFaturamento({ analystId }: CardFaturamentoProps) {
  const { currentCompany } = useCompany();
  const { metrics, isLoading } = useMDCards(analystId);
  const { atual, anual, variacao } = metrics.faturamento;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12 (janeiro = 1)

  // Busca o analista para obter o cost_center_id
  const { data: analyst } = useQuery({
    queryKey: ['analyst', analystId],
    queryFn: async () => {
      if (!analystId) return null;
      return await analystsService.getAnalystById(String(analystId));
    },
    enabled: !!analystId,
  });

  // Obtém o cost_center_id do analista ou usa 1037 como padrão
  const costCenterId = analyst?.marvee_cost_center_id 
    ? analyst.marvee_cost_center_id 
    : 1037;

  // Busca detalhes do faturamento do mês atual quando o modal está aberto
  const { data: detalhesData, isLoading: isLoadingDetalhes } = useQuery({
    queryKey: ['my-dashboard', 'detalhes-faturamento-mensal', currentCompany?.id, costCenterId, currentMonth, currentYear],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return await myDashboardService.getDetalhesFaturamentoMensal({
        companyId: currentCompany.id,
        cost_center_id: costCenterId,
        mes: currentMonth,
        year: currentYear,
      });
    },
    enabled: !!currentCompany?.id && isModalOpen,
  });

  // Processa os dados de detalhes para o modal
  const [faturamentos, setFaturamentos] = useState<FaturamentoItem[]>([]);

  // Atualiza os faturamentos quando os dados chegarem
  useEffect(() => {
    if (!isLoadingDetalhes && detalhesData) {
      const apiData = detalhesData.data;
      let faturamentosData: FaturamentoItem[] = [];
      
      if (Array.isArray(apiData)) {
        faturamentosData = apiData;
      } else if (apiData?.data && Array.isArray(apiData.data)) {
        faturamentosData = apiData.data;
      }
      
      setFaturamentos(faturamentosData);
    } else if (!isModalOpen) {
      // Limpa os dados quando o modal fecha
      setFaturamentos([]);
    }
  }, [detalhesData, isLoadingDetalhes, isModalOpen]);
  
  // Usa 0 enquanto está carregando para evitar animação com valores mockados
  const valorAtual = isLoading ? 0 : atual;
  const valorAnual = isLoading ? 0 : anual;
  const valorVariacao = isLoading ? 0 : variacao;

  // Nome do mês atual
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const mesAtualNome = meses[currentMonth - 1];

  return (
    <>
      <Card 
        className="p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative"
        onClick={() => setIsModalOpen(true)}
      >
        <CardContent className="p-0">
          {/* Ícone de informação no canto superior direito */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="absolute top-2 right-2 h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p>Este card retorna o faturamento do mês vigente e o acumulado do ano vigente</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center justify-between gap-2">
            {/* Ícone à esquerda */}
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <PIcon 
                name="align_bottom" 
                variant="Bulk" 
                size={16} 
                color="#9333EA" 
              />
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground mb-0.5 leading-tight">Faturamento</p>
              <p className="text-lg font-bold mb-0.5 leading-tight">
                <CountUp
                  key={`atual-${valorAtual}`}
                  start={0}
                  end={valorAtual}
                  duration={2}
                  decimals={2}
                  separator="."
                  decimal=","
                  prefix="R$ "
                />
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Anual</span>
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                  <CountUp
                    key={`anual-${valorAnual}`}
                    start={0}
                    end={valorAnual}
                    duration={2}
                    decimals={2}
                    separator="."
                    decimal=","
                    prefix="R$ "
                  />
                </span>
              </div>
            </div>

            {/* Indicadores à direita */}
            <div className="flex items-center gap-0.5">
              <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                <CountUp
                  key={`variacao-${valorVariacao}`}
                  start={0}
                  end={valorVariacao}
                  duration={2}
                  decimals={2}
                  separator="."
                  decimal=","
                  prefix={valorVariacao > 0 ? '+' : ''}
                  suffix="%"
                />
              </span>
              <PIcon 
                name={valorVariacao >= 0 ? "arrow_up" : "arrow_down"} 
                variant="Bold" 
                size={10} 
                color="#9333EA" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <ModalFaturamento
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        faturamentos={faturamentos}
        monthTitle={mesAtualNome}
        isLoading={isLoadingDetalhes}
        costCenterId={costCenterId}
      />
    </>
  );
}
