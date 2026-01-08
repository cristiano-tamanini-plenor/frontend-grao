import { useSearchParams } from 'react-router-dom';
import { Repeat } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState, useEffect } from 'react';
import { useSubscriptions } from './hooks/useSubscriptions';
import { SubscriptionsFilters } from './components/SubscriptionsFilters';
import { useForm } from 'react-hook-form';

export default function Subscriptions() {
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
    const offset = page * pageSize;
    
    return {
      startDate,
      endDate,
      customerId,
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
  
  const { data: subscriptionsResponse, isLoading } = useSubscriptions(filters);
  
  // Extrai os dados e informações de paginação
  const subscriptions = useMemo(() => {
    return subscriptionsResponse?.data || [];
  }, [subscriptionsResponse]);
  
  const totalCount = subscriptionsResponse?.totalCount || 0;
  const hasMore = subscriptionsResponse?.hasMore || false;
  
  // Reset página quando filtros mudam
  useEffect(() => {
    setPage(0);
  }, [searchParams.get('startDate'), searchParams.get('endDate'), searchParams.get('customerId')]);

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

  // Formata CPF/CNPJ
  const formatCpfCnpj = (value: string | null | undefined) => {
    if (!value) return '—';
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return value;
  };

  // Traduz status
  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      ACTIVE: 'Ativa',
      INACTIVE: 'Inativa',
      EXPIRED: 'Expirada',
      CANCELED: 'Cancelada',
    };
    return statusMap[status] || status;
  };

  // Traduz tipo de cobrança
  const translateBillingType = (billingType: string) => {
    const typeMap: Record<string, string> = {
      BOLETO: 'Boleto',
      CREDIT_CARD: 'Cartão de Crédito',
      PIX: 'PIX',
      DEBIT_CARD: 'Cartão de Débito',
    };
    return typeMap[billingType] || billingType;
  };

  // Traduz ciclo
  const translateCycle = (cycle: string) => {
    const cycleMap: Record<string, string> = {
      WEEKLY: 'Semanal',
      BIWEEKLY: 'Quinzenal',
      MONTHLY: 'Mensal',
      QUARTERLY: 'Trimestral',
      SEMIANNUALLY: 'Semestral',
      YEARLY: 'Anual',
    };
    return cycleMap[cycle] || cycle;
  };

  const columns = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      accessorKey: 'id',
      width: 200,
      cell: (value: string) => (
        <span className="text-xs font-mono">{value}</span>
      ),
    },
    {
      key: 'dateCreated',
      header: 'Data de Criação',
      accessorKey: 'dateCreated',
      width: 120,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string) => formatDate(value),
    },
    {
      key: 'customerData.name',
      header: 'Nome do Cliente',
      accessorKey: 'customerData.name',
      minWidth: 250,
      flex: true,
      cell: (value: any, row: any) => {
        const customerData = row.customerData;
        return (
          <span className="text-xs">{customerData?.name || '—'}</span>
        );
      },
    },
    {
      key: 'customerData.cpfCnpj',
      header: 'CPF/CNPJ',
      accessorKey: 'customerData.cpfCnpj',
      width: 150,
      cell: (value: any, row: any) => {
        const customerData = row.customerData;
        return (
          <span className="text-xs font-mono">{formatCpfCnpj(customerData?.cpfCnpj)}</span>
        );
      },
    },
    {
      key: 'cycle',
      header: 'Ciclo',
      accessorKey: 'cycle',
      width: 120,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string) => translateCycle(value),
    },
    {
      key: 'nextDueDate',
      header: 'Próximo Vencimento',
      accessorKey: 'nextDueDate',
      width: 140,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string) => formatDate(value),
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
      key: 'billingType',
      header: 'Tipo',
      accessorKey: 'billingType',
      width: 130,
      cell: (value: string) => translateBillingType(value),
    },
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
      width: 140,
      cell: (value: string) => {
        const statusColors: Record<string, string> = {
          ACTIVE: 'text-green-600 bg-green-50',
          INACTIVE: 'text-gray-600 bg-gray-50',
          EXPIRED: 'text-red-600 bg-red-50',
          CANCELED: 'text-orange-600 bg-orange-50',
        };
        const colorClass = statusColors[value] || 'text-gray-600 bg-gray-50';
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
            {translateStatus(value)}
          </span>
        );
      },
    },
  ], []);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader 
          icon={Repeat} 
          title="Assinaturas Asaas"
          canCreate={false}
        >
          <SubscriptionsFilters form={form} />
        </ListHeader>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="subscriptions-grid"
          data={subscriptions}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhuma assinatura encontrada"
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
        />
        {/* Paginação server-side */}
        <ServerPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          hasMore={hasMore}
          currentPageItems={subscriptions.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          maxPageSize={100}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

