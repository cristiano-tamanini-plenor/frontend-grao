import { PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddButton } from '@/components/crud/ActionButtons';
import { useBreadcrumbs, BreadcrumbItem as BreadcrumbItemType } from '@/hooks/useBreadcrumbs';
import { When } from '@/utils/When';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListHeaderProps extends PropsWithChildren {
  /**
   * Título da página (opcional, usa breadcrumb se não fornecido)
   */
  title?: string;
  
  /**
   * Ícone da página
   */
  icon?: LucideIcon;
  
  /**
   * Se false, esconde o botão de adicionar
   */
  canCreate?: boolean;
  
  /**
   * Label customizado para o botão de adicionar
   */
  addButtonLabel?: string;
  
  /**
   * Rota customizada ao clicar no botão adicionar (padrão: 'novo')
   */
  addButtonRoute?: string;
  
  /**
   * Breadcrumbs customizados
   */
  customBreadcrumbs?: BreadcrumbItemType[];
  
  /**
   * Labels customizados para breadcrumbs
   */
  breadcrumbLabels?: Record<string, string>;
  
  /**
   * Classes adicionais para o container
   */
  className?: string;
  
  /**
   * Callback ao clicar no botão adicionar
   */
  onAdd?: () => void;
}

/**
 * Componente de cabeçalho para páginas de listagem
 * Inclui breadcrumbs, título, botão de adicionar e área para filtros/ações
 * 
 * @example
 * <ListHeader canCreate={canCreate} icon={Package}>
 *   <SearchInput />
 *   <FilterButton onClick={handleFilter} />
 * </ListHeader>
 */
export function ListHeader({
  title,
  icon: Icon,
  canCreate = true,
  addButtonLabel,
  addButtonRoute = 'novo',
  customBreadcrumbs,
  breadcrumbLabels,
  className,
  onAdd,
  children,
}: ListHeaderProps) {
  const navigate = useNavigate();
  const autoBreadcrumbs = useBreadcrumbs(breadcrumbLabels);
  const breadcrumbs = customBreadcrumbs || autoBreadcrumbs;

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      navigate(addButtonRoute);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Título e Ações */}
      <div className="flex items-center justify-between gap-4">
        {/* Título com ícone */}
        <div className="flex items-center gap-2">
          <When is={Icon}>
            <Icon className="h-6 w-6 text-primary" />
          </When>
          <h1 className="text-2xl font-bold tracking-tight">
            {title || breadcrumbs[breadcrumbs.length - 1]?.label || 'Lista'}
          </h1>
        </div>

        {/* Área de ações (filtros, botões personalizados, etc) */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {children}
          
          <When is={canCreate}>
            <AddButton 
              onClick={handleAdd}
              label={addButtonLabel}
            />
          </When>
        </div>
      </div>
    </div>
  );
}

