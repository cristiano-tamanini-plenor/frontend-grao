import { Charge } from '../services/charges.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChargeStatus, CHARGE_STATUS_LABELS, BillingType, BILLING_TYPE_LABELS } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useUpdateMarveeSale } from '../hooks/useCharges';

interface ChargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge: Charge | null;
  onUpdateSuccess?: () => void;
}

export function ChargeModal({ open, onOpenChange, charge, onUpdateSuccess }: ChargeModalProps) {
  const updateMarveeSaleMutation = useUpdateMarveeSale();

  if (!charge) return null;

  // Formata valor monetário
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  // Verifica se há divergência entre os valores da charge e marveeSale
  const hasValueDivergence = (): boolean => {
    if (!charge.marveeSale?.value) return false;
    
    // Usa originalValue se existir, senão usa value
    const chargeValue = charge.originalValue != null
      ? (typeof charge.originalValue === 'string' ? parseFloat(charge.originalValue) : charge.originalValue)
      : (typeof charge.value === 'string' ? parseFloat(charge.value) : charge.value);
    
    const marveeSaleValue = typeof charge.marveeSale.value === 'string' 
      ? parseFloat(charge.marveeSale.value) 
      : charge.marveeSale.value;
    
    // Compara com tolerância de 0.01 para evitar problemas de ponto flutuante
    return Math.abs(chargeValue - marveeSaleValue) > 0.01;
  };

  const hasDivergence = hasValueDivergence();

  // Formata data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Traduz status
  const translateStatus = (status: string) => {
    return CHARGE_STATUS_LABELS[status as ChargeStatus] || status;
  };

  // Traduz tipo de cobrança
  const translateBillingType = (billingType: string) => {
    return BILLING_TYPE_LABELS[billingType as BillingType] || billingType;
  };

  // Status colors
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      PENDING: 'text-yellow-600 bg-yellow-50',
      RECEIVED: 'text-green-600 bg-green-50',
      OVERDUE: 'text-red-600 bg-red-50',
      REFUNDED: 'text-gray-600 bg-gray-50',
    };
    return statusColors[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes da Cobrança</DialogTitle>
        </DialogHeader>

        {/* Alerta de Inconformidade */}
        {hasDivergence && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Inconformidade Detectada</AlertTitle>
              <AlertDescription>
                Os valores da cobrança e da venda Marvee não correspondem. 
                Valor da cobrança (Asaas): {formatCurrency(charge.originalValue != null ? charge.originalValue : charge.value)} | 
                Valor da venda Marvee: {charge.marveeSale ? formatCurrency(charge.marveeSale.value) : 'N/A'}
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => {
                if (charge.marveeSale?.id) {
                  updateMarveeSaleMutation.mutate(
                    {
                      marvee_sale_id: charge.marveeSale.id,
                      charge_id: charge.id,
                    },
                    {
                      onSuccess: () => {
                        onUpdateSuccess?.();
                      },
                    }
                  );
                }
              }}
              disabled={updateMarveeSaleMutation.isPending || !charge.marveeSale?.id}
              className="w-full"
              variant="destructive"
            >
              {updateMarveeSaleMutation.isPending ? 'Corrigindo...' : 'Corrigir Venda'}
            </Button>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-muted-foreground">ID</label>
              <p className="text-sm font-mono">{charge.id}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Status</label>
              <p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(charge.status)}`}>
                  {translateStatus(charge.status)}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Número da Fatura</label>
              <p className="text-sm">{charge.invoiceNumber || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Tipo de Pagamento</label>
              <p className="text-sm">{translateBillingType(charge.billingType)}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Valor</label>
              <p className="text-lg font-semibold">{formatCurrency(charge.value)}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-muted-foreground">Valor Líquido</label>
              <p className="text-sm">{formatCurrency(charge.netValue)}</p>
            </div>
          </div>

          {/* Cliente */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {charge.customerData ? (
                <>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Nome</label>
                    <p className="text-sm">{charge.customerData.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">CPF/CNPJ</label>
                    <p className="text-sm">{charge.customerData.cpfCnpj}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">E-mail</label>
                    <p className="text-sm">{charge.customerData.email}</p>
                  </div>
                  {charge.customerData.mobilePhone && (
                    <div>
                      <label className="text-sm font-semibold text-muted-foreground">Telefone</label>
                      <p className="text-sm">{charge.customerData.mobilePhone}</p>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">ID do Cliente</label>
                  <p className="text-sm font-mono">{charge.customer}</p>
                </div>
              )}
            </div>
          </div>

          {/* Datas */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Datas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Data de Criação</label>
                <p className="text-sm">{formatDate(charge.dateCreated)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Data de Vencimento</label>
                <p className="text-sm">{formatDate(charge.dueDate)}</p>
              </div>
              {charge.paymentDate && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Data de Pagamento</label>
                  <p className="text-sm">{formatDate(charge.paymentDate)}</p>
                </div>
              )}
              {charge.clientPaymentDate && charge.clientPaymentDate !== charge.paymentDate && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Data de Pagamento do Cliente</label>
                  <p className="text-sm">{formatDate(charge.clientPaymentDate)}</p>
                </div>
              )}
              {charge.creditDate && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Data de Crédito</label>
                  <p className="text-sm">{formatDate(charge.creditDate)}</p>
                </div>
              )}
              {charge.estimatedCreditDate && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Data Estimada de Crédito</label>
                  <p className="text-sm">{formatDate(charge.estimatedCreditDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Valores Financeiros */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Valor Original</label>
                <p className="text-sm">{formatCurrency(charge.originalValue)}</p>
              </div>
              {charge.interestValue > 0 && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Juros</label>
                  <p className="text-sm">{formatCurrency(charge.interestValue)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold mb-3">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {charge.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-muted-foreground">Descrição</label>
                  <p className="text-sm">{charge.description}</p>
                </div>
              )}
              {charge.externalReference && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Referência Externa</label>
                  <p className="text-sm">{charge.externalReference}</p>
                </div>
              )}
              {charge.subscription && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Assinatura</label>
                  <p className="text-sm font-mono">{charge.subscription}</p>
                </div>
              )}
              {charge.installment && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Parcela</label>
                  <p className="text-sm">
                    {charge.installmentNumber ? `#${charge.installmentNumber}` : charge.installment}
                  </p>
                </div>
              )}
              {charge.nossoNumero && (
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">Nosso Número</label>
                  <p className="text-sm font-mono">{charge.nossoNumero}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Antecipável</label>
                <p className="text-sm">{charge.anticipable ? 'Sim' : 'Não'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Antecipado</label>
                <p className="text-sm">{charge.anticipated ? 'Sim' : 'Não'}</p>
              </div>
            </div>
          </div>

          {/* Links e Documentos */}
          {(charge.invoiceUrl || charge.bankSlipUrl || charge.transactionReceiptUrl || charge.paymentLink) && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Links e Documentos</h3>
              <div className="flex flex-wrap gap-2">
                {charge.invoiceUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(charge.invoiceUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Fatura
                  </Button>
                )}
                {charge.bankSlipUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(charge.bankSlipUrl, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Boleto
                  </Button>
                )}
                {charge.transactionReceiptUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(charge.transactionReceiptUrl!, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Comprovante
                  </Button>
                )}
                {charge.paymentLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(charge.paymentLink!, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Link de Pagamento
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Venda Marvee */}
          {charge.marveeSale && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Venda Marvee</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-muted-foreground">ID da Venda</label>
                  <p className="text-sm">#{charge.marveeSale.id}</p>
                </div>
                {charge.marveeSale.code_reference && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Código de Referência</label>
                    <p className="text-sm">{charge.marveeSale.code_reference}</p>
                  </div>
                )}
                {charge.marveeSale.fantasy_name && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Nome Fantasia</label>
                    <p className="text-sm">{charge.marveeSale.fantasy_name}</p>
                  </div>
                )}
                {charge.marveeSale.generation_date && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">Data de Geração</label>
                    <p className="text-sm">{formatDate(charge.marveeSale.generation_date)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

