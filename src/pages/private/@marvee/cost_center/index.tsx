import { FolderKanban } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState } from 'react';
import { useCostCenters } from './hooks/useCostCenters';

export default function CostCenters() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Obtém filtros
  const filters = useMemo(() => {
    return {
      page: page + 1, // API usa 1-indexed, mas nosso estado é 0-indexed
      pageSize,
    };
  }, [page, pageSize]);

  const { data: costCentersResponse, isLoading } = useCostCenters(filters);

  // Extrai os dados e informações de paginação
  const costCenters = useMemo(() => {
    if (!costCentersResponse) return [];
    
    // Se a resposta for um array direto (sem meta/data), retorna o array
    if (Array.isArray(costCentersResponse)) {
      return costCentersResponse;
    }
    
    // Caso contrário, retorna data do objeto de resposta
    return costCentersResponse.data || [];
  }, [costCentersResponse]);

  const meta = useMemo(() => {
    if (!costCentersResponse || Array.isArray(costCentersResponse)) {
      return null;
    }
    return costCentersResponse.meta;
  }, [costCentersResponse]);

  const totalCount = meta?.total || costCenters.length;
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const hasMore = meta ? currentPage < lastPage : false;

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Nome',
        accessorKey: 'name',
        minWidth: 300,
        flex: true,
        cell: (value: string) => (
          <span className="text-xs font-medium">{value || '—'}</span>
        ),
      },
      {
        key: 'description',
        header: 'Descrição',
        accessorKey: 'description',
        minWidth: 250,
        flex: true,
        cell: (value: string | null) => (
          <span className="text-xs">{value || '—'}</span>
        ),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader icon={FolderKanban} title="Centros de Custo Marvee" canCreate={false} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="marvee-cost-centers-grid"
          data={costCenters}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhum centro de custo encontrado"
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
          currentPageItems={costCenters.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          maxPageSize={100}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

