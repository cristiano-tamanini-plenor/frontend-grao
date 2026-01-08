import { useNavigate } from 'react-router-dom';
import { FolderKanban as ProjectsIcon } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import DataGrid from '@/components/DataGrid';
import { useMemo } from 'react';
import { useProjects, useDeleteProject } from './hooks/useProject';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { Stack } from '@/components/Stack';
import type { Project } from './types';

export default function Projects() {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermission('projects');
  const { data: projects = [], isLoading } = useProjects();
  const deleteProjectMutation = useDeleteProject();

  // Definição das colunas
  const columns = useMemo(() => [
    {
      key: 'nome',
      header: 'Nome',
      accessorKey: 'nome',
      minWidth: 250,
      flex: true,
    },
    {
      key: 'data_inicial',
      header: 'Data Inicial',
      accessorKey: 'data_inicial',
      width: 150,
      cell: (value: string) => {
        return new Date(value).toLocaleDateString('pt-BR');
      },
    },
    {
      key: 'data_final',
      header: 'Data Final',
      accessorKey: 'data_final',
      width: 150,
      cell: (value: string | null) => {
        return value ? new Date(value).toLocaleDateString('pt-BR') : '-';
      },
    },
    {
      key: 'status',
      header: 'Status',
      accessorKey: 'status',
      width: 120,
      cell: (value: boolean) => {
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      accessorKey: 'id',
      width: 150,
      cellAlign: 'right' as const,
      headerAlign: 'right' as const,
      cell: (value: number, row: Project) => {
        return (
          <div className="flex justify-end gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/projetos/form?id=${row.id}`)}
                title="Editar projeto"
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  if (confirm('Tem certeza que deseja remover este projeto?')) {
                    await deleteProjectMutation.mutateAsync(String(row.id));
                  }
                }}
                title="Remover projeto"
                disabled={deleteProjectMutation.isPending}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [canEdit, canDelete, navigate, deleteProjectMutation]);

  const handleRowDoubleClick = (row: any, id: any) => {
    if (canEdit) {
      navigate(`/projetos/form?id=${id}`);
    }
  };

  return (
    <Stack>
      <ListHeader
        icon={ProjectsIcon}
        title="Projetos"
        canCreate={canCreate}
        addButtonLabel="Novo Projeto"
        onAdd={() => navigate('/projetos/form')}
      />

      <DataGrid
        id="projects-grid"
        data={projects}
        columns={columns}
        pagination={true}
        pageSize={20}
        enableRowSelection={false}
        loading={isLoading}
        emptyMessage="Nenhum projeto encontrado"
        height="100%"
        searchable={true}
        columnConfigurable={true}
        onRowDoubleClick={handleRowDoubleClick}
      />
    </Stack>
  );
}

