import { useState, useMemo } from 'react';
import { ListHeader } from '@/components/ListHeader';
import { Button } from '@/components/ui/button';
import { Users, Pencil, Trash2 } from 'lucide-react';
import { CustomerFormModal } from './form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import DataGrid from '@/components/DataGrid';
import { Customer } from './types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customersService } from './services/customers.service';
import { usePermission } from '@/hooks/usePermission';
import { useDeleteCustomer } from './hooks/useCustomer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export default function Customers() {
  const { canCreate, canEdit, canDelete } = usePermission('customers');
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<boolean>(true); // Por padrão mostra apenas ativos
  
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', statusFilter],
    queryFn: () => customersService.listCustomers(statusFilter),
  });
  const deleteCustomerMutation = useDeleteCustomer();

  const refreshCustomers = () => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  // Handler para toggle do checkbox de status
  const handleStatusToggle = (checked: boolean) => {
    setStatusFilter(checked);
  };

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = canEdit || canDelete;

  const handleCreate = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleSuccess = () => {
    refreshCustomers();
    handleModalClose();
  };

  const handleDeleteClick = async (customer: Customer) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${customer.name}"?`)) {
      try {
        await deleteCustomerMutation.mutateAsync(customer.id);
        refreshCustomers();
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleRowDoubleClick = (row: Customer) => {
    if (canManage) {
      setSelectedCustomer(row);
      setIsModalOpen(true);
    }
  };

  // Formata data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  // Formata valor monetário
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Definição das colunas
  const columns = useMemo(() => [
    {
      key: 'avatar',
      header: 'Avatar',
      accessorKey: 'avatar',
      width: 80,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any, row: Customer) => {
        return (
          <div className="flex items-center justify-center w-full h-full">
            <Avatar className="h-6 w-6">
              <AvatarImage src={`${import.meta.env.VITE_API_URL}${row.avatar}`} alt={row.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {row.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      minWidth: 250,
      flex: true,
    },
    {
      key: 'fantasy_name',
      header: 'Nome Fantasia',
      accessorKey: 'fantasy_name',
      minWidth: 200,
      flex: true,
    },
    {
      key: 'guid_marvee',
      header: 'GUID Marvee',
      accessorKey: 'guid_marvee',
      width: 300,
    },
    {
      key: 'marvee_id',
      header: 'ID Marvee',
      accessorKey: 'marvee_id',
      width: 120,
      cell: (value: any) => value ?? '—',
    },
    {
      key: 'date_initial',
      header: 'Data Inicial',
      accessorKey: 'date_initial',
      width: 150,
      cell: (value: any) => formatDate(value),
    },
    {
      key: 'date_final',
      header: 'Data Final',
      accessorKey: 'date_final',
      width: 150,
      cell: (value: any) => formatDate(value),
    },
    {
      key: 'fee',
      header: 'FEE',
      accessorKey: 'fee',
      width: 150,
      cell: (value: any) => formatCurrency(value),
    },
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any) => {
        return (
          <div className="flex items-center justify-center">
            <Badge variant={value ? 'default' : 'secondary'}>
              {value ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'analyst',
      header: 'Analista',
      accessorKey: 'analyst',
      width: 200,
      cell: (value: any, row: Customer) => {
        if (!row.analyst) return '—';
        const displayText = row.analyst.role || 'Analista';
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={row.analyst.avatar || undefined} alt={displayText} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {displayText.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{displayText}</span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      accessorKey: 'actions',
      width: 120,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any, row: Customer) => {
        return (
          <div className="flex items-center justify-center gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCustomer(row);
                  setIsModalOpen(true);
                }}
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row);
                }}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [canEdit, canDelete]);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader 
          icon={Users} 
          title="Clientes"
          canCreate={canCreate}
          onAdd={handleCreate}
        >
          <div className="flex items-center space-x-2">
            <Checkbox
              id="status-filter"
              checked={statusFilter}
              onCheckedChange={handleStatusToggle}
            />
            <Label
              htmlFor="status-filter"
              className="text-sm font-normal cursor-pointer whitespace-nowrap"
            >
              Status ({statusFilter ? 'Ativo' : 'Inativo'})
            </Label>
          </div>
        </ListHeader>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <DataGrid
          id="customers-grid"
          data={customers}
          columns={columns}
          pagination={true}
          pageSize={20}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhum cliente encontrado"
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>
      <CustomerFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        customer={selectedCustomer}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

