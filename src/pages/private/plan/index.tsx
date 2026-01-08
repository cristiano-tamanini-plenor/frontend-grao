import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import DataGrid from '@/components/DataGrid';
import { useMemo } from 'react';
import { usePlanos } from './hooks/usePlans';

export default function Plano() {
  const navigate = useNavigate();
  const { canCreate, canEdit } = usePermission('planos');
  const { data: planos = [], isLoading, error } = usePlanos();

  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      minWidth: 400,
      flex: true,
    },
    {
      key: 'description',
      header: 'Descrição',
      accessorKey: 'description',
      minWidth: 400,
      flex: true,
    },
  ], []);

  const handleRowDoubleClick = (row: any, id: any) => {
    if (canEdit) {
      navigate(`/planos/form?id=${id}`);
    }
  };

  // Debug: log para verificar o que está sendo retornado
  if (error) {
    console.error('Erro ao carregar planos:', error);
  }

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader 
          icon={Layers} 
          title="Planos"
          canCreate={canCreate}
          addButtonRoute="/planos/form"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-destructive mb-2">Erro ao carregar planos</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
            </div>
          </div>
        ) : (
          <DataGrid
            id="planos-grid"
            data={Array.isArray(planos) ? planos : []}
            columns={columns}
            pagination={true}
            pageSize={20}
            enableRowSelection={false}
            loading={isLoading}
            emptyMessage="Nenhum plano encontrado"
            height="100%"
            searchable={true}
            exportable={true}
            columnConfigurable={true}
            onRowDoubleClick={handleRowDoubleClick}
          />
        )}
      </div>
    </div>
  );
}
