import { Tag } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState } from 'react';
import { useCategories } from './hooks/useCategories';

export default function Categories() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Obtém filtros
  const filters = useMemo(() => {
    return {
      page: page + 1, // API usa 1-indexed, mas nosso estado é 0-indexed
      pageSize,
    };
  }, [page, pageSize]);

  const { data: categoriesResponse, isLoading } = useCategories(filters);

  // Extrai os dados e informações de paginação
  const categories = useMemo(() => {
    if (!categoriesResponse) return [];
    
    // Se a resposta for um array direto (sem meta/data), retorna o array
    if (Array.isArray(categoriesResponse)) {
      return categoriesResponse;
    }
    
    // Caso contrário, retorna data do objeto de resposta
    return categoriesResponse.data || [];
  }, [categoriesResponse]);

  const meta = useMemo(() => {
    if (!categoriesResponse || Array.isArray(categoriesResponse)) {
      return null;
    }
    return categoriesResponse.meta;
  }, [categoriesResponse]);

  const totalCount = meta?.total || categories.length;
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const hasMore = meta ? currentPage < lastPage : false;

  const columns = useMemo(
    () => [
      {
        key: 'category',
        header: 'Categoria',
        accessorKey: 'category',
        width: 200,
        cell: (_: any, row: any) => {
          const isBold = row.level === 1 || row.level === 2;
          return (
            <span className={`text-xs ${isBold ? 'font-bold' : 'font-medium'}`}>
              {row.category || '—'}
            </span>
          );
        },
      },
      {
        key: 'description',
        header: 'Descrição',
        accessorKey: 'description',
        minWidth: 300,
        flex: true,
        cell: (_: any, row: any) => {
          const isBold = row.level === 1 || row.level === 2;
          return (
            <span className={`text-xs ${isBold ? 'font-bold' : ''}`}>
              {row.description || '—'}
            </span>
          );
        },
      },
      {
        key: 'account_category',
        header: 'Categoria de Conta',
        accessorKey: 'account_category',
        minWidth: 300,
        flex: true,
        cell: (_: any, row: any) => {
          const isBold = row.level === 1 || row.level === 2;
          
          if (!row.account_category) {
            return (
              <span className={`text-xs text-muted-foreground ${isBold ? 'font-bold' : ''}`}>
                —
              </span>
            );
          }
          
          const structure = row.account_category.structure || '';
          const description = row.account_category.description || '';
          
          let label = '';
          if (structure && description) {
            label = `${structure} - ${description}`;
          } else if (structure) {
            label = structure;
          } else if (description) {
            label = description;
          } else {
            return (
              <span className={`text-xs text-muted-foreground ${isBold ? 'font-bold' : ''}`}>
                —
              </span>
            );
          }
          
          return (
            <span className={`text-xs ${isBold ? 'font-bold' : ''}`}>
              {label}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        accessorKey: 'status',
        minWidth: 100,
        cell: (_: any, row: any) => {
          const isBold = row.level === 1 || row.level === 2;
          const value = row.status;
          return (
            <span className={`text-xs px-2 py-1 rounded ${isBold ? 'font-bold' : ''} ${
              value 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
            }`}>
              {value ? 'Ativo' : 'Inativo'}
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
        <ListHeader icon={Tag} title="Categorias Marvee" canCreate={false} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="marvee-categories-grid"
          data={categories}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhuma categoria encontrada"
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
          currentPageItems={categories.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          maxPageSize={100}
          loading={isLoading}
        />
      </div>
    </div>
  );
}

