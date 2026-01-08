import { Users } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState } from 'react';
import { useCustomers } from './hooks/useCustomers';
import { CustomerModal } from './components/CustomerModal';
import type { Customer } from './services/customers.service';

export default function Customers() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Obtém filtros
  const filters = useMemo(() => {
    return {
      page: page + 1, // API usa 1-indexed, mas nosso estado é 0-indexed
      pageSize,
    };
  }, [page, pageSize]);

  const { data: customersResponse, isLoading } = useCustomers(filters);

  // Extrai os dados e informações de paginação
  const customers = useMemo(() => {
    if (!customersResponse) return [];
    
    // Se a resposta for um array direto (sem meta/data), retorna o array
    if (Array.isArray(customersResponse)) {
      return customersResponse;
    }
    
    // Caso contrário, retorna data do objeto de resposta
    return customersResponse.data || [];
  }, [customersResponse]);

  const meta = useMemo(() => {
    if (!customersResponse || Array.isArray(customersResponse)) {
      return null;
    }
    return customersResponse.meta;
  }, [customersResponse]);

  const totalCount = meta?.total || customers.length;
  const currentPage = meta?.current_page || 1;
  const lastPage = meta?.last_page || 1;
  const hasMore = meta ? currentPage < lastPage : false;

  // Formata data
  const formatDate = (dateString: string | null | undefined) => {
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

  // Formata CPF/CNPJ
  const formatCpfCnpj = (value: string | null | undefined) => {
    if (!value) return '—';
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');

    // CPF: 11 dígitos
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    // CNPJ: 14 dígitos
    if (numbers.length === 14) {
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }

    return value;
  };

  // Formata telefone
  const formatPhone = (value: string | null | undefined) => {
    if (!value) return '—';
    const numbers = value.replace(/\D/g, '');

    // Telefone fixo: 10 dígitos
    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Celular: 11 dígitos
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    return value;
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Nome',
        accessorKey: 'name',
        minWidth: 250,
        flex: true,
        cell: (value: string) => (
          <span className="text-xs font-medium">{value || '—'}</span>
        ),
      },
      {
        key: 'fantasy_name',
        header: 'Nome Fantasia',
        accessorKey: 'fantasy_name',
        minWidth: 200,
        flex: true,
        cell: (value: string | null) => (
          <span className="text-xs">{value || '—'}</span>
        ),
      },
      {
        key: 'cnpjcpf',
        header: 'CPF/CNPJ',
        accessorKey: 'cnpjcpf',
        width: 150,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: string | null) => (
          <span className="text-xs">{formatCpfCnpj(value)}</span>
        ),
      },
      {
        key: 'email',
        header: 'E-mail',
        accessorKey: 'email',
        minWidth: 200,
        flex: true,
        cell: (value: string | null) => (
          <span className="text-xs">{value || '—'}</span>
        ),
      },
      {
        key: 'phone',
        header: 'Telefone',
        accessorKey: 'phone',
        width: 140,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: string | null) => (
          <span className="text-xs">{formatPhone(value)}</span>
        ),
      },
      {
        key: 'city',
        header: 'Cidade',
        accessorKey: 'city',
        width: 150,
        cell: (value: string | null, row: any) => {
          if (!value && !row.district) return '—';
          const location = value || row.district || '';
          return <span className="text-xs">{location}</span>;
        },
      },
      {
        key: 'address',
        header: 'Endereço',
        accessorKey: 'address',
        minWidth: 250,
        flex: true,
        cell: (value: string | null, row: any) => {
          if (!value) return '—';
          const parts = [value];
          if (row.number) parts.push(`nº ${row.number}`);
          if (row.complement) parts.push(row.complement);
          if (row.district) parts.push(row.district);
          return <span className="text-xs">{parts.join(', ')}</span>;
        },
      },
      {
        key: 'code',
        header: 'Código',
        accessorKey: 'code',
        width: 100,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: number) => (
          <span className="text-xs font-mono">{value || '—'}</span>
        ),
      },
      {
        key: 'created_at',
        header: 'Data de criação',
        accessorKey: 'created_at',
        width: 120,
        cell: (value: string) => formatDate(value),
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader icon={Users} title="Clientes Marvee" canCreate={false} />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="marvee-customers-grid"
          data={customers}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhum cliente encontrado"
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
          onRowClick={(row) => setSelectedCustomer(row as Customer)}
        />
        {/* Paginação server-side */}
        <ServerPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          hasMore={hasMore}
          currentPageItems={customers.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          maxPageSize={100}
          loading={isLoading}
        />
      </div>

      {/* Modal de Detalhes do Cliente */}
      <CustomerModal
        open={!!selectedCustomer}
        onOpenChange={(open) => !open && setSelectedCustomer(null)}
        customer={selectedCustomer}
      />
    </div>
  );
}

