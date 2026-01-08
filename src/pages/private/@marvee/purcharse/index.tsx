import { useSearchParams } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState, useEffect } from 'react';
import { usePurchases } from './hooks/usePurchases';
import { PurchasesFilters } from './components/PurchasesFilters';

export default function Purchases() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Obtém filtros da query string
  const filters = useMemo(() => {
    const dateStart = searchParams.get('dateStart') || undefined;
    const dateEnd = searchParams.get('dateEnd') || undefined;
    const codeReference = searchParams.get('code_reference') || undefined;

    return {
      code_reference: codeReference,
      dateStart,
      dateEnd,
      page: page + 1, // API usa 1-indexed, mas nosso estado é 0-indexed
      pageSize,
    };
  }, [searchParams, page, pageSize]);

  const { data: purchasesResponse, isLoading } = usePurchases(filters);

  // Extrai os dados e informações de paginação
  const purchases = useMemo(() => {
    return purchasesResponse?.data || [];
  }, [purchasesResponse]);

  const meta = purchasesResponse?.meta;
  const totalCount = meta?.total || 0;
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const hasMore = currentPage < lastPage;

  // Reset página quando filtros mudam
  useEffect(() => {
    setPage(0);
  }, [searchParams.get('dateStart'), searchParams.get('dateEnd'), searchParams.get('code_reference')]);

  // Formata valor monetário
  const formatCurrency = (value: string | number) => {
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
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Retorna a situação (já vem traduzida da API)
  const getSituation = (situation: string) => {
    return situation || '—';
  };

  // Traduz tipo de pagamento
  const translatePaymentMethod = (method: string) => {
    const methodMap: Record<string, string> = {
      boleto: 'Boleto',
      credit_card: 'Cartão de Crédito',
      pix: 'PIX',
      debit_card: 'Cartão de Débito',
    };
    return methodMap[method] || method;
  };

  const columns = useMemo(
    () => [
      {
        key: 'provider',
        header: 'Fornecedor',
        accessorKey: 'provider',
        minWidth: 250,
        flex: true,
        cell: (value: any, row: any) => {
          const provider = value || row.provider;
          const fantasyName = provider?.fantasy_name || '—';
          const cnpjcpf = provider?.cnpjcpf;
          
          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium">{fantasyName}</span>
              {cnpjcpf && (
                <span className="text-xs text-muted-foreground">
                  {cnpjcpf}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'code',
        header: 'Documento',
        accessorKey: 'code',
        width: 100,
        cell: (value: string) => (
          <span className="text-xs font-mono">{value || '—'}</span>
        ),
      },
      {
        key: 'generation_date',
        header: 'Data de Geração',
        accessorKey: 'generation_date',
        width: 160,
        cell: (value: string) => formatDate(value),
      },
      {
        key: 'value',
        header: 'Valor',
        accessorKey: 'value',
        width: 140,
        cellAlign: 'right' as const,
        headerAlign: 'right' as const,
        cell: (value: string) => (
          <span className="font-semibold">{formatCurrency(value)}</span>
        ),
      },
      {
        key: 'situation',
        header: 'Situação',
        accessorKey: 'situation',
        width: 120,
        cell: (value: string) => {
          const situationColors: Record<string, string> = {
            'Cadastrada': 'text-yellow-600 bg-yellow-50',
            'Efetivada': 'text-blue-600 bg-blue-50',
            'Liquidada': 'text-green-600 bg-green-50',
            'Cancelada': 'text-red-600 bg-red-50',
          };
          const colorClass =
            situationColors[value] || 'text-gray-600 bg-gray-50';
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}
            >
              {getSituation(value)}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader
          icon={ShoppingBag}
          title="Compras Marvee"
          canCreate={false}
        >
          <PurchasesFilters />
        </ListHeader>
      </div>

      {/* Métricas */}
      {meta?.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Valor Total Compra
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(meta.metrics.valorTotalCompra)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Valor Total Contrato
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(meta.metrics.valorTotalContrato)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Valor Faturado
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(meta.metrics.valorFaturado)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Ticket Médio</p>
            <p className="text-lg font-semibold">
              {formatCurrency(meta.metrics.ticketMedio)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Valor Cancelado
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(meta.metrics.valorCancelado)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">
              Valor Total Período
            </p>
            <p className="text-lg font-semibold">
              {formatCurrency(meta.metrics.valorTotalPeriodo)}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="purchases-grid"
          data={purchases}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhuma compra encontrada"
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
          currentPageItems={purchases.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          maxPageSize={1000}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

