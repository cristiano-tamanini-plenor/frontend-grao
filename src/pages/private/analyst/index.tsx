import { useState, useMemo } from 'react';
import { ListHeader } from '@/components/ListHeader';
import { Button } from '@/components/ui/button';
import { UserCircle, Pencil, Trash2 } from 'lucide-react';
import { AnalystFormModal } from './form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DataGrid from '@/components/DataGrid';
import { Analyst } from './types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analystsService } from './services/analysts.service';
import { usePermission } from '@/hooks/usePermission';
import { useDeleteAnalyst } from './hooks/useAnalyst';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export default function Analysts() {
  const { canCreate, canEdit, canDelete } = usePermission('analysts');
  const queryClient = useQueryClient();
  const { data: analysts = [], isLoading } = useQuery({
    queryKey: ['analysts'],
    queryFn: () => analystsService.listAnalysts(),
  });
  const deleteAnalystMutation = useDeleteAnalyst();

  const [selectedAnalyst, setSelectedAnalyst] = useState<Analyst | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canManage = canEdit || canDelete;

  const handleCreate = () => {
    setSelectedAnalyst(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAnalyst(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['analysts'] });
    handleModalClose();
  };

  const handleDeleteClick = async (analyst: Analyst) => {
    if (window.confirm(`Tem certeza que deseja excluir este analista?`)) {
      try {
        await deleteAnalystMutation.mutateAsync(analyst.id);
        queryClient.invalidateQueries({ queryKey: ['analysts'] });
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleRowDoubleClick = (row: Analyst) => {
    if (canManage) {
      setSelectedAnalyst(row);
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

  // Definição das colunas
  const columns = useMemo(() => [
    {
      key: 'avatar',
      header: 'Avatar',
      accessorKey: 'avatar',
      width: 80,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any, row: Analyst) => {
        const avatarUrl = row.user?.avatar || row.avatar || undefined;
        const userName = row.user?.name || 'Analista';
        const initials = userName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        
        return (
          <div className="flex items-center justify-center w-full h-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials || 'A'}
              </AvatarFallback>
            </Avatar>
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'user.name',
      minWidth: 200,
      flex: true,
      cell: (value: any, row: Analyst) => {
        return row.user?.name || '—';
      },
    },
    {
      key: 'role',
      header: 'Cargo',
      accessorKey: 'role',
      width: 200,
    },
    {
      key: 'sector',
      header: 'Setor',
      accessorKey: 'sector',
      width: 150,
    },
    {
      key: 'start_date',
      header: 'Data de Início',
      accessorKey: 'start_date',
      width: 150,
      cell: (value: any) => formatDate(value),
    },
    {
      key: 'end_date',
      header: 'Data de Término',
      accessorKey: 'end_date',
      width: 150,
      cell: (value: any) => formatDate(value),
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
      key: 'actions',
      header: 'Ações',
      accessorKey: 'actions',
      width: 120,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any, row: Analyst) => {
        return (
          <div className="flex items-center justify-center gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAnalyst(row);
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
          icon={UserCircle} 
          title="Analistas"
          canCreate={canCreate}
          onAdd={handleCreate}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <DataGrid
          id="analysts-grid"
          data={analysts}
          columns={columns}
          pagination={true}
          pageSize={20}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhum analista encontrado"
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>
      <AnalystFormModal
        open={isModalOpen}
        onOpenChange={handleModalClose}
        analyst={selectedAnalyst}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

