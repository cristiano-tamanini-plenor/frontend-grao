import { useLocation } from 'react-router-dom';

/**
 * Hook para obter informações sobre a rota atual
 */
export function useCurrentRoute() {
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);
  const isFormRoute = pathname.includes('/novo') || pathname.includes('/form');
  const isListRoute = !isFormRoute && segments.length > 0;

  return {
    pathname,
    segments,
    isFormRoute,
    isListRoute,
    currentSegment: segments[segments.length - 1] || 'home',
  };
}

