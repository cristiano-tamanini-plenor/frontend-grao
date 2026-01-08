import { Card, CardContent } from '@/components/ui/card';
import { PIcon } from '@/components/ui/p-icon';
import { useMDCards } from '../useMDCards';
import { Info } from 'lucide-react';

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

interface CardComissaoProps {
  analystId: number | null;
}

export default function CardComissao({ analystId }: CardComissaoProps) {
  const { metrics } = useMDCards(analystId);
  const { atual, anual, variacao } = metrics.comissao;

  return (
    <Card className="p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative">
      <CardContent className="p-0">
        {/* Ícone de informação no canto superior direito */}
        <Info className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
        
        <div className="flex items-center justify-between gap-2">
          {/* Ícone à esquerda */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <PIcon 
              name="dollar-circle" 
              variant="Bulk" 
              size={16} 
              color="#10B981" 
            />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground mb-0.5 leading-tight">Comissão</p>
            <p className="text-lg font-bold mb-0.5 leading-tight">{formatCurrency(atual)}</p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">Anual</span>
              <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                {formatCurrency(anual)}
              </span>
            </div>
          </div>

          {/* Indicadores à direita */}
          <div className="flex items-center gap-0.5">
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              {variacao > 0 ? '+' : ''}{variacao.toFixed(2)}%
            </span>
            <PIcon 
              name={variacao >= 0 ? "arrow_up" : "arrow_down"} 
              variant="Bold" 
              size={10} 
              color="#10B981" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
