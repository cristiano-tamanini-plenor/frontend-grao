import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { Sale } from '@/pages/private/@marvee/sales/services/sales.service';
import { cn } from '@/lib/utils';

interface CardSaleProps {
  sale: Sale;
  selected?: boolean;
  onSelect?: (saleId: number, selected: boolean) => void;
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: string | number) {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

/**
 * Formata data
 */
function formatDate(dateString: string | null | undefined) {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

/**
 * Traduz situação
 */
function translateSituation(situation: string) {
  const situationMap: Record<string, string> = {
    '1': 'Pendente',
    '2': 'Pago',
    '3': 'Cancelado',
    '4': 'Quitado',
    '5': 'Vencido',
  };
  return situationMap[situation] || situation;
}

/**
 * Retorna classe de cor para situação
 */
function getSituationColor(situation: string) {
  const situationColors: Record<string, string> = {
    '1': 'text-yellow-600 bg-yellow-50',
    '2': 'text-green-600 bg-green-50',
    '3': 'text-red-600 bg-red-50',
    '4': 'text-blue-600 bg-blue-50',
    '5': 'text-orange-600 bg-orange-50',
  };
  return situationColors[situation] || 'text-gray-600 bg-gray-50';
}

/**
 * Traduz tipo de pagamento
 */
function translatePaymentMethod(method: string) {
  const methodMap: Record<string, string> = {
    boleto: 'Boleto',
    credit_card: 'Cartão de Crédito',
    pix: 'PIX',
    debit_card: 'Cartão de Débito',
  };
  return methodMap[method] || method;
}

export function CardSale({ sale, selected = false, onSelect }: CardSaleProps) {
  const handleSelect = (checked: boolean) => {
    onSelect?.(sale.id, checked);
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        selected && 'ring-2 ring-primary'
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          {/* Checkbox à esquerda */}
          <div className="flex-shrink-0 mt-0.5">
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelect}
            />
          </div>

          {/* Conteúdo do card */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Data de geração */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatDate(sale.generation_date)}</span>
            </div>

            {/* Valor */}
            <div className="text-base font-semibold text-blue-600">
              {formatCurrency(sale.value)}
            </div>

            {/* Cliente */}
            <div className="text-xs font-medium text-foreground">
              {sale.fantasy_name || 'Sem nome'}
            </div>

            {/* CNPJ/CPF */}
            {sale.cnpjcpf && (
              <div className="text-xs text-muted-foreground">
                {sale.cnpjcpf}
              </div>
            )}

            {/* Código de referência */}
            {sale.code_reference && (
              <div className="text-xs font-mono text-muted-foreground">
                Ref: {sale.code_reference}
              </div>
            )}

            {/* Situação e tipo de pagamento */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                getSituationColor(sale.situation)
              )}>
                {translateSituation(sale.situation)}
              </span>
              <span className="text-xs text-muted-foreground">
                {translatePaymentMethod(sale.payment_method_type)}
              </span>
              {sale.installment_settled && (
                <span className="px-2 py-1 rounded text-xs font-medium text-green-700 bg-green-50">
                  ✓ Quitado
                </span>
              )}
            </div>

            {/* Informações adicionais */}
            {(sale.contract_number || sale.code || sale.category_name) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1.5 border-t">
                {sale.contract_number && (
                  <span>Contrato: {sale.contract_number}</span>
                )}
                {sale.code && (
                  <span>Código: {sale.code}</span>
                )}
                {sale.category_name && (
                  <span>Categoria: {sale.category_name}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

