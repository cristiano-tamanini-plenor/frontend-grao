import { useSearchParams } from 'react-router-dom';
import { FileText, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState, useEffect } from 'react';
import { useExtract } from './hooks/useExtract';
import { ExtractFilters } from './components/ExtractFilters';
import type { ExtractItem } from './services/extract.service';

export default function Extract() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Obtém filtros da query string
  const filters = useMemo(() => {
    const dateStart = searchParams.get('dateStart') || undefined;
    const dateEnd = searchParams.get('dateEnd') || undefined;
    const accounts = searchParams.get('accounts') || undefined;
    const categories = searchParams.get('categories') || undefined;
    const cost_centers = searchParams.get('cost_centers') || undefined;
    const status = searchParams.get('status') || undefined;

    return {
      dateStart,
      dateEnd,
      accounts,
      categories,
      cost_centers,
      status,
      page: page + 1, // API usa 1-indexed, mas nosso estado é 0-indexed
      pageSize,
    };
  }, [searchParams, page, pageSize]);

  const { data: extractResponse, isLoading } = useExtract(filters);

  // Extrai os dados e informações de paginação
  const extractData = useMemo(() => {
    return extractResponse?.data || [];
  }, [extractResponse]);

  const meta = extractResponse?.meta;
  const totalCount = meta?.total || 0;
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const hasMore = currentPage < lastPage;

  // Reset página quando filtros mudam
  useEffect(() => {
    setPage(0);
  }, [
    searchParams.get('dateStart'),
    searchParams.get('dateEnd'),
    searchParams.get('accounts'),
    searchParams.get('categories'),
    searchParams.get('cost_centers'),
    searchParams.get('status'),
  ]);

  // Formata valor monetário
  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  // Formata data (apenas DD/MM/YYYY)
  const formatDateOnly = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Formata CNPJ/CPF
  const formatCNPJCPF = (cnpjcpf: string) => {
    if (!cnpjcpf) return '—';
    if (cnpjcpf.length === 11) {
      // CPF
      return cnpjcpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (cnpjcpf.length === 14) {
      // CNPJ
      return cnpjcpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpjcpf;
  };

  // Traduz status
  const translateStatus = (status: string) => {
    return status; // API já retorna em português
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
        key: 'type',
        header: 'Tipo',
        accessorKey: 'type',
        width: 60,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: number) => {
          const isReceita = value === 1;
          return (
            <div className="flex items-center justify-center w-full">
              {isReceita ? (
                <ArrowDownCircle className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowUpCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          );
        },
      },
      {
        key: 'movement_date',
        header: 'Data',
        accessorKey: 'treasury.movement_date',
        width: 120,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (_: any, row: ExtractItem) => formatDateOnly(row.treasury?.movement_date),
      },
      {
        key: 'people',
        header: 'Cliente/Fornecedor',
        accessorKey: 'installment.document.people.fantasy_name',
        minWidth: 200,
        flex: true,
        cell: (_: any, row: ExtractItem) => {
          const people = row.installment?.document?.people;
          if (!people) return '—';
          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium">{people.fantasy_name || people.name || '—'}</span>
              {people.cnpjcpf && (
                <span className="text-xs text-muted-foreground">
                  {formatCNPJCPF(people.cnpjcpf)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'description',
        header: 'Descrição',
        accessorKey: 'installment.document.description',
        minWidth: 250,
        flex: true,
        cell: (_: any, row: ExtractItem) => {
          const description =
            row.installment?.document?.description ||
            row.transfers?.description ||
            row.origin ||
            '—';
          return (
            <span className="text-xs" title={description}>
              {description}
            </span>
          );
        },
      },
      {
        key: 'value',
        header: 'Valor',
        accessorKey: 'value',
        width: 140,
        cellAlign: 'right' as const,
        headerAlign: 'right' as const,
        cell: (value: number, row: ExtractItem) => {
          const isReceita = row.type === 1;
          return (
            <span
              className={`font-semibold ${isReceita ? 'text-green-600' : 'text-red-600'}`}
            >
              {isReceita ? '+' : '-'}
              {formatCurrency(Math.abs(value))}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        accessorKey: 'status',
        width: 120,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: string) => {
          const statusColors: Record<string, string> = {
            Conciliado: 'bg-green-50 text-green-600',
            Pendente: 'bg-yellow-50 text-yellow-600',
            Quitado: 'bg-blue-50 text-blue-600',
            Atrasado: 'bg-red-50 text-red-600',
            'Vence Hoje': 'bg-orange-50 text-orange-600',
          };
          const colorClass =
            statusColors[value] || 'bg-gray-50 text-gray-600';
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
              {translateStatus(value)}
            </span>
          );
        },
      },
      {
        key: 'account',
        header: 'Conta',
        accessorKey: 'account.name',
        width: 150,
        cell: (_: any, row: ExtractItem) => {
          if (!row.account) return '—';
          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium">{row.account.name || '—'}</span>
              {row.account.bank_code && (
                <span className="text-xs text-muted-foreground">
                  Banco: {row.account.bank_code}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'category',
        header: 'Categoria',
        accessorKey: 'installment.document.category_level_3.description',
        width: 200,
        cell: (_: any, row: ExtractItem) => {
          const category = row.installment?.document?.category_level_3;
          if (!category) return '—';
          return (
            <span className="text-xs" title={`${category.structure} - ${category.description}`}>
              {category.structure} - {category.description}
            </span>
          );
        },
      },
      {
        key: 'document_code',
        header: 'Documento',
        accessorKey: 'installment.document.code',
        width: 120,
        cell: (_: any, row: ExtractItem) => (
          <span className="text-xs font-mono">
            {row.installment?.document?.code || '—'}
          </span>
        ),
      },
      {
        key: 'payment_method',
        header: 'Forma de Pagamento',
        accessorKey: 'installment.document.payment_method_type',
        width: 150,
        cell: (_: any, row: ExtractItem) => {
          const method = row.installment?.document?.payment_method_type;
          return method ? translatePaymentMethod(method) : '—';
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader
          icon={FileText}
          title="Extrato Bancário Marvee"
          canCreate={false}
        >
          <ExtractFilters />
        </ListHeader>
      </div>

      {/* Métricas */}
      {meta?.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Receitas em Aberto</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(meta.metrics.total_receitas_previsto)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Receitas Realizadas</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(meta.metrics.total_receitas_realizado)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Despesas em Aberto</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(meta.metrics.total_despesas_previsto)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Despesas Realizadas</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(meta.metrics.total_despesas_realizado)}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">Total do Período</p>
            <p className="text-lg font-semibold">
              {formatCurrency(meta.metrics.saldo_final)}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="extract-grid"
          data={extractData}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhuma movimentação encontrada"
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
          currentPageItems={extractData.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          maxPageSize={1000}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

