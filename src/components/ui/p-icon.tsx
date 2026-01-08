import * as IconsaxIcons from 'iconsax-reactjs';
import { ComponentProps } from 'react';
import { getIconsaxIconName } from './iconsax-icon-map';

type IconsaxVariant = 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';

interface PIconProps extends Omit<ComponentProps<'svg'>, 'name' | 'variant'> {
  /**
   * Nome do ícone (pode ser o nome direto do iconsax ou um nome customizado do mapeamento)
   * Exemplos: "Home", "user", "settings", "edit", etc.
   */
  name: string;
  /**
   * Variante do ícone
   * @default "Linear"
   */
  variant?: IconsaxVariant;
  /**
   * Tamanho do ícone
   * @default 24
   */
  size?: string | number;
  /**
   * Cor do ícone
   * @default "currentColor"
   */
  color?: string;
}

/**
 * Componente PIcon que renderiza ícones do iconsax-reactjs dinamicamente
 * Suporta nomes customizados através do mapeamento de ícones
 * 
 * @example
 * ```tsx
 * <PIcon name="home" variant="Outline" size={24} color="#000" />
 * <PIcon name="User" variant="Bulk" size={32} />
 * <PIcon name="settings" />
 * ```
 */
export const PIcon = ({ 
  name, 
  variant = 'Linear', 
  size = 24, 
  color = 'currentColor',
  ...props 
}: PIconProps) => {
  // Obtém o nome correto do ícone (pode vir do mapeamento ou ser o nome direto)
  const iconName = getIconsaxIconName(name) || name;
  
  // Busca o componente do ícone no objeto de ícones
  const IconComponent = (IconsaxIcons as unknown as Record<string, React.ComponentType<any>>)[iconName];

  if (!IconComponent) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[PIcon] Ícone "${name}" (mapeado para "${iconName}") não encontrado no iconsax-reactjs. ` +
        `Verifique se o nome está correto ou adicione ao mapeamento em iconsax-icon-map.tsx`
      );
    }
    return null;
  }

  // Renderiza o ícone com as props fornecidas
  return (
    <IconComponent 
      variant={variant} 
      size={size} 
      color={color}
      {...props}
    />
  );
};

