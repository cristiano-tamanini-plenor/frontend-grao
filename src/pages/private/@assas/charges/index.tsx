import { useSearchParams } from 'react-router-dom';
import { CreditCard, ExternalLink } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCharges, usePostSaleMarvee } from './hooks/useCharges';
import { ChargesFilters } from './components/ChargesFilters';
import { ChargeStatus, CHARGE_STATUS_LABELS, BillingType, BILLING_TYPE_LABELS, DEFAULT_STATUS_FILTERS } from './types';
import { ChargeModal } from './components/ChargeModal';
import type { Charge } from './services/charges.service';

export default function Charges() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  
  // Form para controlar o AutoComplete
  const form = useForm<{ customerId?: string }>({
    defaultValues: {
      customerId: searchParams.get('customerId') || undefined,
    },
  });
  
  // Obtém filtros da query string
  const filters = useMemo(() => {
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    
    // Status: se não houver na URL, usa os padrões (PENDING e RECEIVED)
    const statusParam = searchParams.get('status');
    const status = statusParam 
      ? (statusParam.includes(',') ? statusParam.split(',') : statusParam)
      : DEFAULT_STATUS_FILTERS; // Padrão: PENDING e RECEIVED
    
    // BillingType
    const billingTypeParam = searchParams.get('billingType');
    const billingType = billingTypeParam 
      ? (billingTypeParam.includes(',') ? billingTypeParam.split(',') : billingTypeParam)
      : undefined;
    
    const offset = page * pageSize;
    
    return {
      startDate,
      endDate,
      customerId,
      status,
      billingType,
      offset,
      limit: pageSize,
    };
  }, [searchParams, page, pageSize]);
  
  // Sincroniza o form com a URL quando a URL mudar
  useEffect(() => {
    const customerId = searchParams.get('customerId');
    form.setValue('customerId', customerId || undefined);
  }, [searchParams, form]);
  
  // Atualiza URL quando o cliente for selecionado no form
  const customerId = form.watch('customerId');
  useEffect(() => {
    const currentCustomerId = searchParams.get('customerId');
    if (customerId !== (currentCustomerId || undefined)) {
      const params = new URLSearchParams(searchParams);
      
      if (customerId) {
        params.set('customerId', customerId);
      } else {
        params.delete('customerId');
      }
      
      setSearchParams(params, { replace: true });
      setPage(0); // Reset página quando filtro mudar
    }
  }, [customerId, searchParams, setSearchParams]);
  
  const { data: chargesResponse, isLoading } = useCharges(filters);
  const postSaleMarveeMutation = usePostSaleMarvee();
  const [processingChargeId, setProcessingChargeId] = useState<string | null>(null);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  
  // Verifica se deve mostrar apenas problemas
  const showProblemsOnly = searchParams.get('showProblemsOnly') === 'true';
  
  // Função para verificar se uma charge tem problema
  const hasProblem = (charge: Charge): boolean => {
    const marveeSale = charge.marveeSale;
    
    // Se não tem venda Marvee, é um problema
    if (!marveeSale?.id) {
      return true;
    }
    
    // Se tem venda Marvee mas não tem valor, não é problema de divergência
    if (!marveeSale.value) {
      return false;
    }
    
    // Verifica divergência de valores
    const chargeValue = charge.originalValue != null 
      ? (typeof charge.originalValue === 'string' ? parseFloat(charge.originalValue) : charge.originalValue)
      : (typeof charge.value === 'string' ? parseFloat(charge.value) : charge.value);
    
    const marveeSaleValue = typeof marveeSale.value === 'string' 
      ? parseFloat(marveeSale.value) 
      : marveeSale.value;
    
    // Compara com tolerância de 0.01 para evitar problemas de ponto flutuante
    const hasDivergence = Math.abs(chargeValue - marveeSaleValue) > 0.01;
    
    return hasDivergence;
  };
  
  // Extrai os dados e informações de paginação
  const charges = useMemo(() => {
    const allCharges = chargesResponse?.data || [];
    
    // Se o filtro de problemas estiver ativo, filtra apenas as charges com problemas
    if (showProblemsOnly) {
      return allCharges.filter(hasProblem);
    }
    
    return allCharges;
  }, [chargesResponse, showProblemsOnly]);
  
  // Ajusta totalCount e hasMore quando o filtro de problemas estiver ativo
  const totalCount = useMemo(() => {
    if (showProblemsOnly) {
      // Quando filtrando problemas, o total é o número de itens filtrados
      return charges.length;
    }
    return chargesResponse?.totalCount || 0;
  }, [showProblemsOnly, charges.length, chargesResponse?.totalCount]);
  
  const hasMore = useMemo(() => {
    if (showProblemsOnly) {
      // Quando filtrando problemas localmente, não há mais páginas
      return false;
    }
    return chargesResponse?.hasMore || false;
  }, [showProblemsOnly, chargesResponse?.hasMore]);
  
  // Reset página quando filtros mudam
  useEffect(() => {
    setPage(0);
  }, [searchParams.get('startDate'), searchParams.get('endDate'), searchParams.get('customerId'), searchParams.get('status'), searchParams.get('billingType'), searchParams.get('showProblemsOnly')]);

  // Formata valor monetário
  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  // Formata data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Traduz status usando o enum
  const translateStatus = (status: string) => {
    return CHARGE_STATUS_LABELS[status as ChargeStatus] || status;
  };

  // Traduz tipo de cobrança usando o enum
  const translateBillingType = (billingType: string) => {
    return BILLING_TYPE_LABELS[billingType as BillingType] || billingType;
  };

  const columns = useMemo(() => [
    {
      key: 'invoiceUrl',
      header: 'Fatura',
      accessorKey: 'invoiceUrl',
      width: 70,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string) => {
        if (!value) return '—';
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(value, '_blank', 'noopener,noreferrer');
            }}
            className="inline-flex items-center justify-center p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Abrir fatura em nova aba"
          >
            <ExternalLink className="h-4 w-4 text-blue-600" />
          </button>
        );
      },
    },
    {
      key: 'customer',
      header: 'Cliente',
      accessorKey: 'customer',
      minWidth: 250,
      flex: true,
      cell: (value: string, row: any) => {
        const customerData = row.customerData;
        
        if (customerData?.name) {
          return (
            <div className="flex flex-col">
              <span className="text-xs">{customerData.name}</span>
              {customerData.cpfCnpj && (
                <span className="text-xs text-muted-foreground">{customerData.cpfCnpj}</span>
              )}
            </div>
          );
        }
        
        return (
          <span className="text-xs">{value}</span>
        );
      },
    },
    {
      key: 'marveeSale',
      header: 'Venda Marvee',
      accessorKey: 'marveeSale',
      width: 140,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any, row: any) => {
        const marveeSale = row.marveeSale;
        const chargeId = row.id;

        if (marveeSale?.id) {
          // Verifica se há divergência de valores
          // Compara marveeSale.value (Marvee) com originalValue (Asaas), ou value se originalValue for null
          if (!marveeSale.value) {
            // Se não houver valor do Marvee, não há divergência
            return (
              <span className="px-2 py-1 rounded text-xs font-medium text-green-700 bg-green-50">
                #{marveeSale.id}
              </span>
            );
          }
          
          // Usa originalValue se existir, senão usa value
          const chargeValue = row.originalValue != null 
            ? (typeof row.originalValue === 'string' ? parseFloat(row.originalValue) : row.originalValue)
            : (typeof row.value === 'string' ? parseFloat(row.value) : row.value);
          
          const marveeSaleValue = typeof marveeSale.value === 'string' 
            ? parseFloat(marveeSale.value) 
            : marveeSale.value;
          
          // Compara com tolerância de 0.01 para evitar problemas de ponto flutuante
          const hasDivergence = Math.abs(chargeValue - marveeSaleValue) > 0.01;

          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              hasDivergence 
                ? 'text-red-700 bg-red-50' 
                : 'text-green-700 bg-green-50'
            }`}>
              #{marveeSale.id}
            </span>
          );
        }

        const isProcessing = processingChargeId === chargeId;
        
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (chargeId && !isProcessing) {
                setProcessingChargeId(chargeId);
                postSaleMarveeMutation.mutate(chargeId, {
                  onSettled: () => {
                    setProcessingChargeId(null);
                  },
                });
              }
            }}
            disabled={isProcessing}
            className="px-2 py-1 rounded text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Criar venda Marvee"
          >
            {isProcessing ? 'Criando...' : 'Não encontrada'}
          </button>
        );
      },
    },
    {
      key: 'invoiceNumber',
      header: 'Número da Fatura',
      accessorKey: 'invoiceNumber',
      width: 140,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string) => value || '—',
    },
    {
      key: 'subscription',
      header: 'Assinatura?',
      accessorKey: 'subscription',
      width: 150,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string | null) => {
        if (value) {
          return (
            <span className="px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-50">
              Assinatura
            </span>
          );
        }
        return '—';
      },
    },
    {
      key: 'value',
      header: 'Valor',
      accessorKey: 'value',
      width: 120,
      cellAlign: 'right' as const,
      headerAlign: 'right' as const,
      cell: (value: number) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'netValue',
      header: 'Valor Líquido',
      accessorKey: 'netValue',
      width: 120,
      cellAlign: 'right' as const,
      headerAlign: 'right' as const,
      cell: (value: number) => formatCurrency(value),
    },
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
      width: 140,
      cell: (value: string) => {
        const statusColors: Record<string, string> = {
          PENDING: 'text-yellow-600 bg-yellow-50',
          RECEIVED: 'text-green-600 bg-green-50',
          OVERDUE: 'text-red-600 bg-red-50',
          REFUNDED: 'text-gray-600 bg-gray-50',
        };
        const colorClass = statusColors[value] || 'text-gray-600 bg-gray-50';
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
            {translateStatus(value)}
          </span>
        );
      },
    },
    {
      key: 'billingType',
      header: 'Tipo',
      accessorKey: 'billingType',
      width: 130,
      cell: (value: string) => translateBillingType(value),
    },
    {
      key: 'dateCreated',
      header: 'Data de criação',
      accessorKey: 'dateCreated',
      width: 120,
      cell: (value: string) => formatDate(value),
    },
    {
      key: 'dueDate',
      header: 'Vencimento',
      accessorKey: 'dueDate',
      width: 120,
      cell: (value: string) => formatDate(value),
    },
    {
      key: 'paymentDate',
      header: 'Pagamento',
      accessorKey: 'paymentDate',
      width: 120,
      cell: (value: string | null) => formatDate(value),
    },
    {
      key: 'externalReference',
      header: 'Referência Externa',
      accessorKey: 'externalReference',
      width: 150,
      cell: (value: string | null) => value || '—',
    },
   
  ], [postSaleMarveeMutation, processingChargeId]);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader 
          icon={CreditCard} 
          title="Cobranças Asaas"
          canCreate={false}
        >
          <ChargesFilters form={form} />
        </ListHeader>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="charges-grid"
          data={charges}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhuma cobrança encontrada"
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
          onRowClick={(row) => setSelectedCharge(row as Charge)}
        />
        {/* Paginação server-side */}
        <ServerPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          hasMore={hasMore}
          currentPageItems={charges.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          maxPageSize={100}
          loading={isLoading}
        />
      </div>
      
      {/* Modal de Detalhes da Cobrança */}
      <ChargeModal
        open={!!selectedCharge}
        onOpenChange={(open) => !open && setSelectedCharge(null)}
        charge={selectedCharge}
        onUpdateSuccess={() => {
          // Fecha o modal após correção bem-sucedida
          setSelectedCharge(null);
        }}
      />
    </div>
  );
}

