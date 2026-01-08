import { useNavigate, useSearchParams } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import DataGrid from '@/components/DataGrid';
import { useMemo } from 'react';
import { useIcons } from './hooks/useIcon';
import { PIcon } from '@/components/ui/p-icon';
import { IconFilters } from './components/IconFilters';

export default function Icons() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { canCreate, canEdit, canView } = usePermission('icons');
  
  // Obtém filtros da query string
  const filters = useMemo(() => {
    const name = searchParams.get('name') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    
    return {
      name,
      type,
      status,
    };
  }, [searchParams]);
  
  const { data: icons = [], isLoading } = useIcons(filters);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

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
  const getIconUrl = (row: any): string | null => {
    const isDark = isDarkTheme();
    const url = isDark && row.url_dark ? row.url_dark : row.url;
    return buildImageUrl(url);
  };

  const columns = useMemo(() => [
    {
      key: 'icon',
      header: 'Ícone',
      accessorKey: 'icon',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: any, row: any) => {
        const name = row.name;
        const variant = row.variant || 'Linear';
        const type = row.type || 'lib';
        const url = row.url;

        if (!name) return '—';

        // Se for tipo PNG e tiver URL, exibe a imagem
        if (type === 'png' && url) {
          const imageUrl = getIconUrl(row);
          if (imageUrl) {
            return (
              <div className="flex items-center justify-center w-full h-full">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-7 h-7 object-contain"
                />
              </div>
            );
          }
        }

        // Para tipo lib, usa o componente PIcon
        return (
          <div className="flex items-center justify-center w-full h-full">
            <PIcon name={name} variant={variant} size={28} className="text-foreground" />
          </div>
        );
      },
    },
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      minWidth: 200,
      flex: true,
    },
    {
      key: 'type',
      header: 'Tipo',
      accessorKey: 'type',
      width: 100,
      cell: (value: 'lib' | 'png') => {
        return value === 'png' ? 'PNG' : 'Lib';
      },
    },
    {
      key: 'variant',
      header: 'Variante',
      accessorKey: 'variant',
      width: 120,
      cell: (value: string | null, row: any) => {
        // Variante só aparece para tipo lib
        return row.type === 'png' ? '—' : (value || '—');
      },
    },
    {
      key: 'category',
      header: 'Categoria',
      accessorKey: 'category',
      width: 150,
      cell: (value: string | null) => value || '—',
    },
    {
      key: 'description',
      header: 'Descrição',
      accessorKey: 'description',
      minWidth: 300,
      flex: true,
      cell: (value: string | null) => value || '—',
    },
    {
      key: 'active',
      header: 'Ativo',
      accessorKey: 'active',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: boolean) => (
        <span className={value ? 'text-green-600' : 'text-gray-400'}>
          {value ? 'Sim' : 'Não'}
        </span>
      ),
    },
  ], []);

  const handleRowDoubleClick = (row: any, id: any) => {
    // Permite navegação sempre - a permissão de edição será verificada no formulário
    // Garante que o id seja uma string (pode vir do params.id ou row.id)
    const iconId = String(id ?? row.id ?? '');
    if (iconId && iconId !== 'undefined' && iconId !== 'null') {
      navigate(`/icones/form?id=${iconId}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader 
          icon={ImageIcon} 
          title="Ícones"
          canCreate={canCreate}
          addButtonRoute="/icones/form"
        >
          <IconFilters />
        </ListHeader>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <DataGrid
          id="icons-grid"
          data={icons}
          columns={columns}
          pagination={true}
          pageSize={20}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhum ícone encontrado"
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

