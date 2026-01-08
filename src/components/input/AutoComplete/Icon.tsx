import { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ComponentProps } from 'react';
import { getIcon } from '@/components/layout/Template/Sidebar/iconMap';

interface IconProps extends Omit<ComponentProps<'svg'>, 'name'> {
  name?: string;
}

/**
 * Componente Icon que retorna o ícone do lucide-react baseado no nome
 * Primeiro tenta usar o iconMap do Sidebar, depois tenta buscar diretamente no lucide-react
 */
export const Icon = ({ name, ...props }: IconProps) => {
  if (!name) {
    return null;
  }

  // Tenta primeiro usar o iconMap do Sidebar (compatibilidade)
  try {
    const IconFromMap = getIcon(name);
    const DefaultIcon = getIcon('default');
    // Verifica se encontrou um ícone válido (não o default)
    if (IconFromMap && IconFromMap !== DefaultIcon) {
      return <IconFromMap {...props} />;
    }
  } catch {
    // Continua para busca direta no lucide-react
  }

  // Busca direta no lucide-react (PascalCase)
  const iconName = name
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  const IconComponent = (LucideIcons as unknown as Record<string, LucideIcon>)[iconName];

  if (IconComponent && typeof IconComponent === 'function') {
    return <IconComponent {...props} />;
  }

  // Retorna ícone padrão se não encontrar
  const DefaultIcon = getIcon('default');
  return <DefaultIcon {...props} />;
};

