import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import DataGrid from '@/components/DataGrid';
import { useMemo } from 'react';
import { useModules } from './hooks/useModule';
import { PIcon } from '@/components/ui/p-icon';
import { Stack } from '@/components/Stack';
import type { Module } from './services/modules.service';

export default function Module() {
  const navigate = useNavigate();
  const { canCreate, canEdit } = usePermission('modules');
  const { data: modules = [], isLoading } = useModules();

  const handleRowDoubleClick = (row: Module) => {
    if (canEdit) {
      navigate(`/modulos/form?id=${row.id}`);
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

  // Constrói a URL completa da imagem a partir de uma URL relativa
  const buildImageUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  };

  // Detecta se o tema atual é dark
  const isDarkTheme = (): boolean => {
    if (typeof window === 'undefined') return false;
    const htmlElement = document.documentElement;
    if (htmlElement.classList.contains('dark')) {
      return true;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  };

  // Obtém a URL do ícone baseada no tema atual
  const getIconUrl = (iconEntity: { url?: string | null; url_dark?: string | null }): string | null => {
    const isDark = isDarkTheme();
    const url = isDark && iconEntity.url_dark ? iconEntity.url_dark : iconEntity.url;
    return buildImageUrl(url);
  };

  // Definição das colunas
  const columns = useMemo(() => [
    {
      key: 'icon',
      header: 'Ícone',
      accessorKey: 'icon',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any, row: Module) => {
        if (!row.icon_entity) return '—';
        
        // Se for tipo PNG e tiver URL, exibe a imagem
        if (row.icon_entity.type === 'png' && row.icon_entity.url) {
          const imageUrl = getIconUrl(row.icon_entity);
          if (imageUrl) {
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={imageUrl}
                  alt={row.icon_entity.name}
                  className="w-6 h-6 object-contain"
                />
              </div>
            );
          }
        }
        
        // Para tipo lib, usa o componente PIcon
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
      minWidth: 200,
      flex: true,
    },
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      minWidth: 300,
      flex: true,
    },
  ], [canEdit, navigate]);

  return (
    <Stack>
      <ListHeader 
        icon={Package} 
        title="Módulos do Sistema"
        canCreate={canCreate}
        addButtonRoute="/modulos/form"
      />

      <DataGrid
        id="modules-grid"
        data={modules}
        columns={columns}
        pagination={true}
        pageSize={20}
        enableRowSelection={false}
        loading={isLoading}
        emptyMessage="Nenhum módulo encontrado"
        height="100%"
        searchable={true}
        exportable={true}
        columnConfigurable={true}
        onRowDoubleClick={handleRowDoubleClick}
      />
    </Stack>
  );
}