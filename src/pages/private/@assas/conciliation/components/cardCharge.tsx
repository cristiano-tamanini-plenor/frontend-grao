import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { Charge } from '@/pages/private/@assas/charges/services/charges.service';
import { cn } from '@/lib/utils';

interface CardChargeProps {
  charge: Charge;
  selected?: boolean;
  onSelect?: (chargeId: string, selected: boolean) => void;
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: number | string) {
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
 * Traduz status
 */
function translateStatus(status: string) {
  const statusMap: Record<string, string> = {
    PENDING: 'Pendente',
    RECEIVED: 'Recebida',
    OVERDUE: 'Vencida',
    REFUNDED: 'Estornada',
    RECEIVED_IN_CASH_UNDONE: 'Recebida em dinheiro desfeita',
    CHARGEBACK_REQUESTED: 'Chargeback solicitado',
    CHARGEBACK_DISPUTE: 'Chargeback em disputa',
    AWAITING_CHARGEBACK_REVERSAL: 'Aguardando reversão do chargeback',
    DUNNING_REQUESTED: 'Em negativação',
    DUNNING_RECEIVED: 'Negativação recebida',
    AWAITING_RISK_ANALYSIS: 'Aguardando análise de risco',
  };
  return statusMap[status] || status;
}

/**
 * Retorna classe de cor para status
 */
function getStatusColor(status: string) {
  const statusColors: Record<string, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50',
    RECEIVED: 'text-green-600 bg-green-50',
    OVERDUE: 'text-red-600 bg-red-50',
    REFUNDED: 'text-gray-600 bg-gray-50',
  };
  return statusColors[status] || 'text-gray-600 bg-gray-50';
}

/**
 * Traduz tipo de cobrança
 */
function translateBillingType(billingType: string) {
  const typeMap: Record<string, string> = {
    BOLETO: 'Boleto',
    CREDIT_CARD: 'Cartão de Crédito',
    PIX: 'PIX',
    DEBIT_CARD: 'Cartão de Débito',
  };
  return typeMap[billingType] || billingType;
}

export function CardCharge({ charge, selected = false, onSelect }: CardChargeProps) {
  const handleSelect = (checked: boolean) => {
    onSelect?.(charge.id, checked);
  };

  const handleOpenCharge = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (charge.invoiceUrl) {
      window.open(charge.invoiceUrl, '_blank', 'noopener,noreferrer');
    }
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
          {/* Checkbox à direita */}
          <div className="flex-shrink-0 mt-0.5">
            <Checkbox
              checked={selected}
              onCheckedChange={handleSelect}
            />
          </div>

          {/* Conteúdo do card */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Datas */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Emissão:</span> {formatDate(charge.dateCreated)}
              </div>
              {charge.dueDate && (
                <div>
                  <span className="font-medium">Vencimento:</span> {formatDate(charge.dueDate)}
                </div>
              )}
            </div>

            {/* Valor */}
            <div className="flex items-center gap-2">
              <div className="text-base font-semibold text-blue-600">
                {formatCurrency(charge.value)}
              </div>
              {charge.invoiceUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleOpenCharge}
                  title="Abrir cobrança em nova aba"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
            </div>

            {/* Cliente */}
            {charge.customerData && (
              <>
                <div className="text-xs font-medium text-foreground">
                  {charge.customerData.name}
                </div>
                {charge.customerData.cpfCnpj && (
                  <div className="text-xs text-muted-foreground">
                    {charge.customerData.cpfCnpj}
                  </div>
                )}
              </>
            )}

            {/* Status e tipo */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                getStatusColor(charge.status)
              )}>
                {translateStatus(charge.status)}
              </span>
              <span className="text-xs text-muted-foreground">
                {translateBillingType(charge.billingType)}
              </span>
              {charge.marveeSale && (
                <span className="px-2 py-1 rounded text-xs font-medium text-green-700 bg-green-50">
                  ✓ Vinculada
                </span>
              )}
            </div>

            {/* Informações adicionais */}
            {(charge.invoiceNumber || charge.externalReference) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1.5 border-t">
                {charge.invoiceNumber && (
                  <span>Fatura: {charge.invoiceNumber}</span>
                )}
                {charge.externalReference && (
                  <span>Ref: {charge.externalReference}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

