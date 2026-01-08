import { useLocation } from 'react-router-dom';
import { getIcon } from '@/components/layout/Template/Sidebar/iconMap';
import { LucideIcon } from 'lucide-react';
import { useCadastros } from '@/pages/private/cadastro/hooks/useCadastro';

interface CurrentCadastroInfo {
  name: string;
  icon?: LucideIcon;
  description?: string;
}

/**
 * Hook para buscar o cadastro correspondente à rota atual
 */
export function useCurrentCadastro(): CurrentCadastroInfo | null {
  const { pathname } = useLocation();
  const { data: cadastros = [] } = useCadastros();

  // Filtra apenas cadastros ativos
  const activeCadastros = cadastros.filter(c => c.active);

  // Normalizar pathname para comparação
  // Remove query params e hash
  const normalizedPath = pathname.split('?')[0].split('#')[0];
  
  // Tentar encontrar cadastro pela rota exata primeiro
  let cadastro = activeCadastros.find((c) => {
    if (!c.route) return false;
    const normalizedRoute = c.route.startsWith('/') ? c.route : `/${c.route}`;
    return normalizedPath === normalizedRoute || normalizedPath === `${normalizedRoute}/form` || normalizedPath.startsWith(`${normalizedRoute}/`);
  });

  // Se não encontrou pela rota exata, tenta encontrar pela rota base
  if (!cadastro) {
    // Remove /form ou /novo do final para buscar a rota base
    const baseRoute = normalizedPath.replace(/\/form$/, '').replace(/\/novo$/, '');
    cadastro = activeCadastros.find((c) => {
      if (!c.route) return false;
      const normalizedRoute = c.route.startsWith('/') ? c.route : `/${c.route}`;
      return baseRoute === normalizedRoute || baseRoute.startsWith(normalizedRoute);
    });
  }

  if (!cadastro) {
    return null;
  }

  return {
    name: cadastro.name,
    icon: cadastro.icon ? getIcon(cadastro.icon) : undefined,
    description: cadastro.description || undefined,
  };
}

