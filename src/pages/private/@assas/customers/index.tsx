import { Users } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { ServerPagination } from '@/components/ServerPagination';
import { useMemo, useState } from 'react';
import { useCustomers } from './hooks/useCustomers';

export default function Customers() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  
  // Obtém filtros
  const filters = useMemo(() => {
    const offset = page * pageSize;
    
    return {
      offset,
      limit: pageSize,
    };
  }, [page, pageSize]);
  
  const { data: customersResponse, isLoading } = useCustomers(filters);
  
  // Extrai os dados e informações de paginação
  const customers = useMemo(() => {
    return customersResponse?.data || [];
  }, [customersResponse]);
  
  const totalCount = customersResponse?.totalCount || 0;
  const hasMore = customersResponse?.hasMore || false;

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
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // CPF: 11 dígitos
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    // CNPJ: 14 dígitos
    if (numbers.length === 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      minWidth: 250,
      flex: true,
      cell: (value: string) => (
        <span className="text-xs font-medium">{value}</span>
      ),
    },
    {
      key: 'cpfCnpj',
      header: 'CPF/CNPJ',
      accessorKey: 'cpfCnpj',
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
      cell: (value: string | null, row: any) => {
        const phone = value || row.mobilePhone;
        return <span className="text-xs">{formatPhone(phone)}</span>;
      },
    },
    {
      key: 'city',
      header: 'Cidade',
      accessorKey: 'city',
      width: 150,
      cell: (value: string | null, row: any) => {
        if (!value) return '—';
        const state = row.state ? ` - ${row.state}` : '';
        return <span className="text-xs">{value}{state}</span>;
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
        if (row.addressNumber) parts.push(row.addressNumber);
        if (row.complement) parts.push(row.complement);
        if (row.province) parts.push(row.province);
        return (
          <span className="text-xs">
            {parts.join(', ')}
          </span>
        );
      },
    },
    {
      key: 'externalReference',
      header: 'Referência Externa',
      accessorKey: 'externalReference',
      width: 150,
      cell: (value: string | null) => (
        <span className="text-xs">{value || '—'}</span>
      ),
    },
    {
      key: 'dateCreated',
      header: 'Data de criação',
      accessorKey: 'dateCreated',
      width: 120,
      cell: (value: string) => formatDate(value),
    },
  ], []);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader 
          icon={Users} 
          title="Clientes Asaas"
          canCreate={false}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <DataGrid
          id="customers-grid"
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
    </div>
  );
}

