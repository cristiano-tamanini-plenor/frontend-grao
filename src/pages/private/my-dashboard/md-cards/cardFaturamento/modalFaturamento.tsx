import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FaturamentoItem, getCostCenterValue } from '../useMDCards';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface ModalFaturamentoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faturamentos: FaturamentoItem[];
  monthTitle?: string;
  isLoading?: boolean;
  costCenterId?: number;
}

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Função para formatar data
const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return dateString;
  }
};

// Função para obter badge de status
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    autorizado: {
      label: 'Autorizado',
      className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    },
    aguardando_emissao: {
      label: 'Aguardando Emissão',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    },
    erro_autorizacao: {
      label: 'Erro na Autorização',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    },
  };

  const statusInfo = statusMap[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}
    >
      {statusInfo.label}
    </span>
  );
};

export default function ModalFaturamento({
  open,
  onOpenChange,
  faturamentos,
  monthTitle,
  isLoading = false,
  costCenterId,
}: ModalFaturamentoProps) {
  // Ordena por data de emissão (mais recente primeiro)
  const sortedFaturamentos = [...faturamentos].sort((a, b) => {
    if (!a.data_emissao && !b.data_emissao) return 0;
    if (!a.data_emissao) return 1;
    if (!b.data_emissao) return -1;
    return new Date(b.data_emissao).getTime() - new Date(a.data_emissao).getTime();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {monthTitle ? `Faturamentos - ${monthTitle}` : 'Faturamentos'}
          </DialogTitle>
          <DialogDescription>
            {monthTitle 
              ? `Lista de faturamentos do mês de ${monthTitle}`
              : 'Lista de todos os faturamentos do período'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Carregando faturamentos...</p>
              </div>
            ) : sortedFaturamentos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum faturamento encontrado
              </div>
            ) : (
              sortedFaturamentos.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Cliente */}
                      {item.people && (
                        <div>
                          <p className="font-semibold text-sm">
                            {item.people.fantasy_name || item.people.name || '—'}
                          </p>
                          {item.people.cnpjcpf && (
                            <p className="text-xs text-muted-foreground">
                              {item.people.cnpjcpf}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Informações da NFSe */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {item.nfse_number && (
                          <span>
                            <strong>NFSe:</strong> {item.nfse_number}
                          </span>
                        )}
                        {item.document.code && (
                          <span>
                            <strong>Documento:</strong> {item.document.code}
                          </span>
                        )}
                        {item.data_emissao && (
                          <span>
                            <strong>Emissão:</strong> {formatDate(item.data_emissao)}
                          </span>
                        )}
                        {item.document.generation_date && (
                          <span>
                            <strong>Data de Geração:</strong> {formatDate(item.document.generation_date)}
                          </span>
                        )}
                      </div>

                      {/* Categoria */}
                      {item.document.category && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">
                            {item.document.category.category} - {item.document.category.description}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* Valor - mostra o valor do cost_center específico (fonte maior) */}
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatCurrency(getCostCenterValue(item, costCenterId || 1037))}
                        </p>
                        {/* Valor do documento (fonte menor, como informação adicional) */}
                        {item.value && item.value !== getCostCenterValue(item, costCenterId || 1037) && (
                          <p className="text-xs text-muted-foreground">
                            Doc: {formatCurrency(item.value)}
                          </p>
                        )}
                        {((item.cost_centers && Array.isArray(item.cost_centers) && item.cost_centers.length > 1) ||
                          (item.document?.cost_centers && Array.isArray(item.document.cost_centers) && item.document.cost_centers.length > 1)) && (
                          <p className="text-xs text-muted-foreground">
                            Rateio do centro de custo
                          </p>
                        )}
                      </div>

                      {/* Status */}
                      {getStatusBadge(item.status)}

                      {/* Links */}
                      <div className="flex gap-2 text-xs">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Ver NFSe
                          </a>
                        )}
                        {item.url_danfse && (
                          <a
                            href={item.url_danfse}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

