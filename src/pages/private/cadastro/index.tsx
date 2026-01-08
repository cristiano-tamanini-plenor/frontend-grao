import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import DataGrid from '@/components/DataGrid';
import { useMemo } from 'react';
import { useCadastros } from './hooks/useCadastro';
import { PIcon } from '@/components/ui/p-icon';
import type { Cadastro } from './services/cadastros.service';

export default function Cadastro() {
  const navigate = useNavigate();
  const { canCreate, canEdit } = usePermission('cadastros');
  const { data: cadastros = [], isLoading } = useCadastros();

  const columns = useMemo(() => [
    {
      key: 'icon',
      header: 'Ícone',
      accessorKey: 'icon',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any, row: Cadastro) => {
        if (!row.icon_entity) return '—';
        return (
          <div className="flex items-center justify-center w-full h-full">
            <PIcon 
              name={row.icon_entity.name} 
              variant={row.icon_entity.variant} 
              size={24} 
              className="text-foreground" 
            />
          </div>
        );
      },
    },
    {
      key: 'code',
      header: 'Código',
      accessorKey: 'code',
      width: 300,
    },
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      minWidth: 400,
      flex: true,
    },
    {
      key: 'type',
      header: 'Tipo',
      accessorKey: 'type',
      width: 100,
    },
    {
      key: 'route',
      header: 'Rota',
      accessorKey: 'route',
      width: 200,
      flex: true,
    },
  ], []);

  const handleRowDoubleClick = (row: any, id: any) => {
    if (canEdit) {
      navigate(`/cadastros/form?id=${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader 
          icon={FileText} 
          title="Cadastros"
          canCreate={canCreate}
          addButtonRoute="/cadastros/form"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <DataGrid
          id="cadastros-grid"
          data={cadastros}
          columns={columns}
          pagination={true}
          pageSize={20}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhum cadastro encontrado"
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>
    </div>
  );
}
