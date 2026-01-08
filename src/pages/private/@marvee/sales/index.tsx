import { useSearchParams } from 'react-router-dom';
import { ShoppingCart, Filter } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useSales } from './hooks/useSales';
import { InfoDialog } from '@/components/Dialog';
import type { Sale } from './services/sales.service';
import { FilterDrawer } from '@/components/FilterDrawer';
import { SalesFiltersDrawer, type SalesFiltersDrawerRef } from './components/SalesFiltersDrawer';
import { EditValuePopover } from './components/EditValuePopover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StepableDateRange } from '@/components/input/StepableDateRange';
import type { DateRange } from 'react-day-picker';
import { format, parse, isValid, startOfMonth, endOfMonth } from 'date-fns';

export default function Sales() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const filtersDrawerRef = useRef<SalesFiltersDrawerRef>(null);
  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get('search') || ''
  );
  const [debouncedSearch, setDebouncedSearch] = useState<string>(
    searchParams.get('search') || ''
  );
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calcula o mês atual como padrão
  const getCurrentMonthRange = (): DateRange => {
    const now = new Date();
    return {
      from: startOfMonth(now),
      to: endOfMonth(now),
    };
  };

  // Converte as datas da URL para DateRange
  const dateRangeFromUrl = useMemo(() => {
    const startDate = searchParams.get('dateStart');
    const endDate = searchParams.get('dateEnd');

    if (startDate && endDate) {
      try {
        const from = parse(startDate, 'yyyy-MM-dd', new Date());
        const to = parse(endDate, 'yyyy-MM-dd', new Date());

        if (isValid(from) && isValid(to)) {
          return {
            from,
            to,
          } as DateRange;
        }
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [searchParams]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    dateRangeFromUrl || getCurrentMonthRange()
  );
  const hasInitialized = useRef(false);

  // Inicializa com o mês atual e situações padrão se não houver filtros na URL
  useEffect(() => {
    if (!hasInitialized.current) {
      const params = new URLSearchParams(searchParams);
      let needsUpdate = false;

      // Inicializa datas se não existirem
      if (!dateRangeFromUrl) {
        const currentMonthRange = getCurrentMonthRange();
        setDateRange(currentMonthRange);
        params.set('dateStart', format(currentMonthRange.from, 'yyyy-MM-dd'));
        params.set('dateEnd', format(currentMonthRange.to, 'yyyy-MM-dd'));
        needsUpdate = true;
      } else {
        setDateRange(dateRangeFromUrl);
      }

      // Inicializa situações padrão se não existirem
      const situationParams = params.getAll('situation');
      if (situationParams.length === 0) {
        const defaultSituation = ['1', '2', '4'];
        defaultSituation.forEach((sit) => {
          params.append('situation', sit);
        });
        needsUpdate = true;
      }

      if (needsUpdate) {
        setSearchParams(params, { replace: true });
      }

      hasInitialized.current = true;
    }
  }, [dateRangeFromUrl, searchParams, setSearchParams]);

  // Sincroniza dateRange quando a URL mudar externamente
  useEffect(() => {
    if (hasInitialized.current && dateRangeFromUrl) {
      setDateRange(dateRangeFromUrl);
    }
  }, [dateRangeFromUrl]);

  // Sincroniza searchValue quando a URL mudar externamente (navegação do browser)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    // Só sincroniza se o valor da URL for diferente do debouncedSearch (mudança externa)
    if (urlSearch !== debouncedSearch) {
      setSearchValue(urlSearch);
      setDebouncedSearch(urlSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('search')]);

  // Debounce do campo de busca (2 segundos, mínimo 3 caracteres)
  useEffect(() => {
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current);
    }

    if (searchValue.trim().length >= 3) {
      searchDebounceTimerRef.current = setTimeout(() => {
        setDebouncedSearch(searchValue.trim());
      }, 2000);
    } else {
      setDebouncedSearch('');
    }

    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current);
      }
    };
  }, [searchValue]);

  // Atualiza a URL quando o debouncedSearch mudar
  useEffect(() => {
    const currentSearch = searchParams.get('search') || '';
    
    // Só atualiza se o valor realmente mudou
    if (debouncedSearch !== currentSearch) {
      const params = new URLSearchParams(searchParams);

      if (debouncedSearch.length >= 3) {
        params.set('search', debouncedSearch);
      } else {
        params.delete('search');
      }

      setSearchParams(params, { replace: true });
      setPage(0); // Reset página ao buscar
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Handler para quando o usuário seleciona um novo intervalo de datas
  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    setDateRange(newRange);

    const params = new URLSearchParams(searchParams);

    if (newRange?.from && newRange?.to) {
      params.set('dateStart', format(newRange.from, 'yyyy-MM-dd'));
      params.set('dateEnd', format(newRange.to, 'yyyy-MM-dd'));
    } else {
      params.delete('dateStart');
      params.delete('dateEnd');
    }

    setSearchParams(params, { replace: true });
    setPage(0); // Reset página ao mudar data
  };

  // Obtém filtros da query string
  const filters = useMemo(() => {
    const dateStart = searchParams.get('dateStart') || undefined;
    const dateEnd = searchParams.get('dateEnd') || undefined;
    const codeReference = searchParams.get('code_reference') || undefined;
    const peopleId = searchParams.get('peopleId') || undefined;
    const search = searchParams.get('search') || undefined;
    
    // Lê situação da URL (pode vir como múltiplos parâmetros situation)
    const situationParams = searchParams.getAll('situation');
    // Valores padrão: 1 (Pendente), 2 (Efetivada), 4 (Liquidado)
    const defaultSituation = ['1', '2', '4'];
    const situation = situationParams.length > 0 ? situationParams : defaultSituation;

    return {
      code_reference: codeReference,
      dateStart,
      dateEnd,
      peopleId,
      situation,
      search,
      page: page + 1, // API usa 1-indexed, mas nosso estado é 0-indexed
      pageSize,
    };
  }, [searchParams, page, pageSize]);

  const { data: salesResponse, isLoading } = useSales(filters);

  // Extrai os dados e informações de paginação
  const sales = useMemo(() => {
    return salesResponse?.data || [];
  }, [salesResponse]);

  const meta = salesResponse?.meta;
  const totalCount = meta?.total || 0;
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const hasMore = currentPage < lastPage;

  // Reset página quando filtros mudam
  useEffect(() => {
    setPage(0);
  }, [searchParams.get('dateStart'), searchParams.get('dateEnd'), searchParams.get('code_reference'), searchParams.get('peopleId'), searchParams.get('search'), searchParams.getAll('situation')]);

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

  // Traduz situação
  const translateSituation = (situation: string) => {
    const situationMap: Record<string, string> = {
      '1': 'Cadastrado',
      '2': 'Pendente',
      '3': 'Cancelado',
      '4': 'Liquidado',
      '5': 'Vencido',
    };
    return situationMap[situation] || situation;
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

  // Handler para clique na linha
  const handleRowClick = (row: Sale) => {
    setSelectedSale(row);
    setIsModalOpen(true);
  };

  // Handler para aplicar filtros do drawer
  const handleApplyFilters = () => {
    if (filtersDrawerRef.current) {
      const filters = filtersDrawerRef.current.getFilters();
      const params = new URLSearchParams(searchParams);

      // Mantém as datas que estão fora do drawer
      const startDate = searchParams.get('dateStart');
      const endDate = searchParams.get('dateEnd');
      if (startDate) params.set('dateStart', startDate);
      if (endDate) params.set('dateEnd', endDate);

      // Aplica filtros do drawer
      if (filters.codeReference) {
        params.set('code_reference', filters.codeReference);
      } else {
        params.delete('code_reference');
      }

      if (filters.peopleId) {
        params.set('peopleId', filters.peopleId);
      } else {
        params.delete('peopleId');
      }

      // Remove todas as situações anteriores
      params.delete('situation');
      // Adiciona as novas situações (sempre envia, mesmo que seja o padrão)
      const situationToApply = filters.situation && filters.situation.length > 0 
        ? filters.situation 
        : ['1', '2', '4']; // Valores padrão
      situationToApply.forEach((sit) => {
        params.append('situation', sit);
      });

      setSearchParams(params, { replace: true });
      setPage(0); // Reset página ao aplicar filtros
    }
  };

  // Handler para limpar filtros do drawer
  const handleClearFilters = () => {
    if (filtersDrawerRef.current) {
      // Reseta os valores no drawer
      filtersDrawerRef.current.resetFilters();
      
      // Aplica os valores padrão na URL
      const params = new URLSearchParams(searchParams);

      // Mantém as datas que estão fora do drawer
      const startDate = searchParams.get('dateStart');
      const endDate = searchParams.get('dateEnd');
      if (startDate) params.set('dateStart', startDate);
      if (endDate) params.set('dateEnd', endDate);

      // Remove filtros do drawer
      params.delete('code_reference');
      params.delete('peopleId');

      // Aplica situações padrão
      params.delete('situation');
      const defaultSituation = ['1', '2', '4'];
      defaultSituation.forEach((sit) => {
        params.append('situation', sit);
      });

      setSearchParams(params, { replace: true });
      setPage(0); // Reset página ao limpar filtros
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'fantasy_name',
        header: 'Cliente',
        accessorKey: 'fantasy_name',
        minWidth: 250,
        flex: true,
        freezeable: true,
        cell: (value: string, row: any) => {
          return (
            <div className="flex flex-col">
              <span className="text-xs font-medium">{value || '—'}</span>
              {row.cnpjcpf && (
                <span className="text-xs text-muted-foreground">
                  {row.cnpjcpf}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'code',
        header: 'Código',
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
        freezeableRight: true,
        cell: (value: string, row: any) => (
          <div className="flex justify-end">
            <EditValuePopover saleId={row.id} currentValue={value} />
          </div>
        ),
      },
      {
        key: 'situation',
        header: 'Situação',
        accessorKey: 'situation',
        width: 120,
        cell: (value: string) => {
          const situationColors: Record<string, string> = {
            '1': 'text-gray-600 bg-gray-50',
            '2': 'text-blue-600 bg-blue-50',
            '3': 'text-red-600 bg-red-50',
            '4': 'text-green-600 bg-green-50',
            '5': 'text-orange-600 bg-orange-50',
          };
          const colorClass =
            situationColors[value] || 'text-gray-600 bg-gray-50';
          return (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${colorClass}`}
            >
              {translateSituation(value)}
            </span>
          );
        },
      },
      {
        key: 'code_reference',
        header: 'Código de Referência',
        accessorKey: 'code_reference',
        width: 180,
        cell: (value: string) => (
          <span className="text-xs font-mono">{value || '—'}</span>
        ),
      },
      {
        key: 'payment_method_type',
        header: 'Forma de Pagamento',
        accessorKey: 'payment_method_type',
        width: 150,
        cell: (value: string) => translatePaymentMethod(value),
      },
      {
        key: 'category_name',
        header: 'Categoria',
        accessorKey: 'category_name',
        width: 200,
        cell: (value: string) => value || '—',
      },
     
      {
        key: 'contract_number',
        header: 'Nº Contrato',
        accessorKey: 'contract_number',
        width: 150,
        cell: (value: string) => (
          <span className="text-xs">{value?.trim() || '—'}</span>
        ),
      },
      {
        key: 'installment_settled',
        header: 'Parcela Liquidada',
        accessorKey: 'installment_settled',
        width: 140,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: boolean) => {
          if (value) {
            return (
              <span className="px-2 py-1 rounded text-xs font-medium text-green-600 bg-green-50">
                Sim
              </span>
            );
          }
          return (
            <span className="px-2 py-1 rounded text-xs font-medium text-gray-600 bg-gray-50">
              Não
            </span>
          );
        },
      },
      {
        key: 'has_active_charge',
        header: 'Cobrança Ativa',
        accessorKey: 'has_active_charge',
        width: 130,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: boolean) => {
          if (value) {
            return (
              <span className="px-2 py-1 rounded text-xs font-medium text-blue-600 bg-blue-50">
                Sim
              </span>
            );
          }
          return '—';
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader
          icon={ShoppingCart}
          title="Vendas Marvee"
          canCreate={false}
        >
          <div className="flex items-center gap-2">
            <div className="w-[200px]">
              <Input
                placeholder="Buscar..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <div className="w-[320px]">
              <StepableDateRange
                placeholder="Selecione o período"
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="h-9 w-9"
            >
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filtros</span>
            </Button>
          </div>
        </ListHeader>
      </div>

      {/* Métricas */}
      {meta?.metrics && (() => {
        const totalPeriodo = parseFloat(String(meta.metrics.valorTotalPeriodo || 0)) || 0;
        const totalVenda = parseFloat(String(meta.metrics.valorTotalVenda || 0)) || 0;
        const totalContrato = parseFloat(String(meta.metrics.valorTotalContrato || 0)) || 0;
        const faturado = parseFloat(String(meta.metrics.valorFaturado || 0)) || 0;
        const ticketMedio = parseFloat(String(meta.metrics.ticketMedio || 0)) || 0;

        const calculatePercentage = (value: number) => {
          if (totalPeriodo === 0) return 0;
          return (value / totalPeriodo) * 100;
        };

        const formatPercentage = (value: number) => {
          return value.toFixed(2).replace('.', ',') + '%';
        };

        const metrics = [
          {
            title: 'Total do período',
            value: totalPeriodo,
            percentage: 100,
            borderColor: 'border-l-teal-500',
          },
          {
            title: 'Total Venda',
            value: totalVenda,
            percentage: calculatePercentage(totalVenda),
            borderColor: 'border-l-gray-400',
          },
          {
            title: 'Total Contrato',
            value: totalContrato,
            percentage: calculatePercentage(totalContrato),
            borderColor: 'border-l-blue-500',
          },
          {
            title: 'Faturado',
            value: faturado,
            percentage: calculatePercentage(faturado),
            borderColor: 'border-l-green-500',
          },
          {
            title: 'Ticket Médio',
            value: ticketMedio,
            percentage: calculatePercentage(ticketMedio),
            borderColor: 'border-l-gray-400',
          },
        ];

        return (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className={`bg-card border rounded-lg p-2 relative border-l-4 ${metric.borderColor}`}>
                <p className="text-xs text-muted-foreground mb-0.5 pr-12">
                  {metric.title}
                </p>
                <p className="text-[10px] text-muted-foreground absolute top-2 right-2">
                  {formatPercentage(metric.percentage)}
                </p>
                <p className="text-base font-semibold">
                  {formatCurrency(metric.value)}
                </p>
              </div>
            ))}
          </div>
        );
      })()}

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="sales-grid"
          data={sales}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhuma venda encontrada"
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
          onRowClick={handleRowClick}
        />
        {/* Paginação server-side */}
        <ServerPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          hasMore={hasMore}
          currentPageItems={sales.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          maxPageSize={1000}
          loading={isLoading}
        />
      </div>

      {/* Modal de Detalhes da Venda */}
      <InfoDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Detalhes da Venda"
        width="max-w-4xl"
        className="max-h-[90vh] overflow-y-auto"
      >
        {selectedSale && (
          <div className="space-y-6">
              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Código de Referência
                  </p>
                  <p className="text-sm font-mono">{selectedSale.code_reference || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Código</p>
                  <p className="text-sm font-mono">{selectedSale.code || '—'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Valor</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedSale.value)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Situação</p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                      {
                        '1': 'text-yellow-600 bg-yellow-50',
                        '2': 'text-green-600 bg-green-50',
                        '3': 'text-red-600 bg-red-50',
                        '4': 'text-blue-600 bg-blue-50',
                        '5': 'text-orange-600 bg-orange-50',
                      }[selectedSale.situation] || 'text-gray-600 bg-gray-50'
                    }`}
                  >
                    {translateSituation(selectedSale.situation)}
                  </span>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Nome Fantasia
                    </p>
                    <p className="text-sm">{selectedSale.fantasy_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      CNPJ/CPF
                    </p>
                    <p className="text-sm">{selectedSale.cnpjcpf || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Informações de Pagamento */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Pagamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Forma de Pagamento
                    </p>
                    <p className="text-sm">
                      {translatePaymentMethod(selectedSale.payment_method_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Data de Geração
                    </p>
                    <p className="text-sm">{formatDate(selectedSale.generation_date)}</p>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold mb-3">Informações Adicionais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Categoria</p>
                    <p className="text-sm">{selectedSale.category_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Nº Contrato
                    </p>
                    <p className="text-sm">{selectedSale.contract_number?.trim() || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Parcela Liquidada
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                        selectedSale.installment_settled
                          ? 'text-green-600 bg-green-50'
                          : 'text-gray-600 bg-gray-50'
                      }`}
                    >
                      {selectedSale.installment_settled ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Cobrança Ativa
                    </p>
                    {selectedSale.has_active_charge ? (
                      <span className="px-2 py-1 rounded text-xs font-medium inline-block text-blue-600 bg-blue-50">
                        Sim
                      </span>
                    ) : (
                      <p className="text-sm">—</p>
                    )}
                  </div>
                  {selectedSale.purchase_order && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Ordem de Compra
                      </p>
                      <p className="text-sm">{selectedSale.purchase_order}</p>
                    </div>
                  )}
                  {selectedSale.service_order && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Ordem de Serviço
                      </p>
                      <p className="text-sm">{selectedSale.service_order}</p>
                    </div>
                  )}
                  {selectedSale.cost_center_name && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Centro de Custo
                      </p>
                      <p className="text-sm">{selectedSale.cost_center_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}
      </InfoDialog>

      {/* Drawer de Filtros */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onOpenChange={setIsFilterDrawerOpen}
        title="Filtros"
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        showClearButton={true}
      >
        <SalesFiltersDrawer
          ref={filtersDrawerRef}
          codeReference={searchParams.get('code_reference') || undefined}
          peopleId={searchParams.get('peopleId') || undefined}
          situation={searchParams.getAll('situation').length > 0 ? searchParams.getAll('situation') : ['1', '2', '4']}
        />
      </FilterDrawer>
    </div>
  );
}

