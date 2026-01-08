import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

/**
 * Mapeamento de rotas para labels em português
 */
const routeLabels: Record<string, string> = {
  home: 'Início',
  usuarios: 'Usuários',
  empresas: 'Empresas',
  extrato: 'Extrato',
  'dashboard-fechamento': 'Dashboard Fechamento',
  perfil: 'Perfil',
  desenvolvimento: 'Desenvolvimento',
  modulos: 'Módulos',
  novo: 'Novo',
  form: 'Formulário',
};

/**
 * Hook para gerar breadcrumbs automaticamente baseado na rota atual
 * @example
 * const breadcrumbs = useBreadcrumbs();
 * // Em /modulos/novo
 * // Retorna: [
 * //   { label: 'Início', href: '/home' },
 * //   { label: 'Desenvolvimento', href: '' },
 * //   { label: 'Módulos', href: '/modulos' },
 * //   { label: 'Novo', active: true }
 * // ]
 */
export function useBreadcrumbs(customLabels?: Record<string, string>): BreadcrumbItem[] {
  const { pathname } = useLocation();
  const params = useParams();

  return useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const labels = { ...routeLabels, ...customLabels };
    
    const breadcrumbs: BreadcrumbItem[] = [];
    let currentPath = '';

    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Skip if it's an ID or GUID parameter
      if (params.id === segment || params.guid === segment) {
        return;
      }

      breadcrumbs.push({
        label: labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
        active: isLast,
      });
    });

    // Se não houver breadcrumbs, adiciona "Início"
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({
        label: 'Início',
        active: true,
      });
    }

    return breadcrumbs;
  }, [pathname, params, customLabels]);
}

