import { Card, CardContent } from '@/components/ui/card';
import { PIcon } from '@/components/ui/p-icon';
import { useMDCards } from '../useMDCards';
import { Info } from 'lucide-react';

interface CardNPSProps {
  analystId: number | null;
}

export default function CardNPS({ analystId }: CardNPSProps) {
  const { metrics } = useMDCards(analystId);
  const { atual, anual, variacao } = metrics.nps;

  return (
    <Card className="p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative">
      <CardContent className="p-0">
        {/* Ícone de informação no canto superior direito */}
        <Info className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
        
        <div className="flex items-center justify-between gap-2">
          {/* Ícone à esquerda */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
            <PIcon 
              name="Star1" 
              variant="Bulk" 
              size={16} 
              color="#EAB308" 
            />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground mb-0.5 leading-tight">NPS</p>
            <p className="text-lg font-bold mb-0.5 leading-tight">{atual.toFixed(1)}</p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Anual</span>
              <span className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-400">
                {anual.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Indicadores à direita */}
          <div className="flex items-center gap-0.5">
            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
              {variacao > 0 ? '+' : ''}{variacao.toFixed(2)}%
            </span>
            <PIcon 
              name={variacao >= 0 ? "arrow_up" : "arrow_down"} 
              variant="Bold" 
              size={10} 
              color="#EAB308" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
