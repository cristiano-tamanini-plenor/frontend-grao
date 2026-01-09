import { Card, CardContent } from '@/components/ui/card';
import { PIcon } from '@/components/ui/p-icon';
import { useInvestmentCards } from '../useInvestmentCards';
import { Info } from 'lucide-react';
import CountUp from 'react-countup';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CardDistribuicaoLucros() {
  const { metrics, isLoading } = useInvestmentCards();
  const valor = isLoading ? 0 : metrics.profitDistribution;

  return (
    <Card className="p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative">
      <CardContent className="p-0">
        {/* Ícone de informação no canto superior direito */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="absolute top-2 right-2 h-3 w-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p>Valor total de lucros distribuídos nos investimentos</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center justify-between gap-2">
          {/* Ícone à esquerda */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <PIcon 
              name="dollar-circle" 
              variant="Bulk" 
              size={16} 
              color="#3B82F6" 
            />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground mb-0.5 leading-tight">Distribuição de Lucros</p>
            <p className="text-lg font-bold mb-0.5 leading-tight">
              <CountUp
                key={`lucros-${valor}`}
                start={0}
                end={valor}
                duration={2}
                decimals={2}
                separator="."
                decimal=","
                prefix="R$ "
              />
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Lucros acumulados</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
