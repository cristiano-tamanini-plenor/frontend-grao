import { Card, CardContent } from '@/components/ui/card';
import { PIcon } from '@/components/ui/p-icon';
import { useInvestmentCards } from '../useInvestmentCards';
import { Info } from 'lucide-react';
import CountUp from 'react-countup';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function CardRentabilidade() {
  const { metrics, isLoading } = useInvestmentCards();
  const valor = isLoading ? 0 : metrics.monthlyReturn;
  const isPositive = valor >= 0;

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
              <p>Rentabilidade percentual do mês atual</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <div className="flex items-center justify-between gap-2">
          {/* Ícone à esquerda */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'} flex items-center justify-center`}>
            <PIcon 
              name={isPositive ? "arrow_up" : "arrow_down"} 
              variant="Bulk" 
              size={16} 
              color={isPositive ? "#10B981" : "#EF4444"} 
            />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground mb-0.5 leading-tight">Rentabilidade do Mês</p>
            <p className={`text-lg font-bold mb-0.5 leading-tight ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <CountUp
                key={`rentabilidade-${valor}`}
                start={0}
                end={valor}
                duration={2}
                decimals={2}
                separator="."
                decimal=","
                prefix={isPositive ? '+' : ''}
                suffix="%"
              />
            </p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Este mês</span>
            </div>
          </div>

          {/* Indicadores à direita */}
          <div className="flex items-center gap-0.5">
            <PIcon 
              name={isPositive ? "arrow_up" : "arrow_down"} 
              variant="Bold" 
              size={10} 
              color={isPositive ? "#10B981" : "#EF4444"} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
