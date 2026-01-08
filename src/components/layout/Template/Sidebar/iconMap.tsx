import {
  LucideIcon,
  Edit,
  DollarSign,
  Users,
  User,
  LayoutDashboard,
  Building2,
  ShoppingCart,
  FileText,
  Target,
  Settings,
  BookOpen,
  Inbox,
  Send,
  ArrowUp,
  ArrowDown,
  Home,
  Package,
  Layers,
  Boxes,
  // Add more icons as needed
} from "lucide-react";
import { PIcon } from "@/components/ui/p-icon";
import type { SidebarIcon } from "./types";
import { ComponentType } from "react";
import { useTheme } from "@/theme/useTheme";

export const iconMap: Record<string, LucideIcon> = {
  edit: Edit,
  dollar: DollarSign,
  peoples: Users,
  people: Users,
  customer: User,
  providers: User,
  dashboard: LayoutDashboard,
  dashbarod: LayoutDashboard, // typo support
  building: Building2,
  shopping: ShoppingCart,
  file: FileText,
  target: Target,
  movi_up: ArrowUp,
  movi_down: ArrowDown,
  settings: Settings,
  contact: BookOpen,
  inbox: Inbox,
  outbox: Send,
  home: Home,
  package: Package,
  layers: Layers,
  modulos: Boxes,
  cadastros: FileText,
  // Add default icon
  default: FileText,
};

/**
 * Retorna o componente de ícone Lucide (legado)
 * @deprecated Use renderIcon ou getIconComponent para suportar ambos os formatos
 */
export function getIcon(iconName?: string): LucideIcon {
  if (!iconName) return iconMap.default;
  return iconMap[iconName.toLowerCase()] || iconMap.default;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

/**
 * Constrói a URL completa da imagem a partir de uma URL relativa
 */
function buildImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

/**
 * Obtém a URL do ícone baseada no tema atual
 * @param icon - Objeto com url e url_dark opcionais
 * @param isDark - Se o tema atual é dark
 */
function getIconUrl(icon: { url?: string; url_dark?: string }, isDark: boolean): string | null {
  // Se for dark e tiver url_dark, usa url_dark, senão usa url
  if (isDark && icon.url_dark) {
    return buildImageUrl(icon.url_dark);
  }
  
  return buildImageUrl(icon.url);
}

/**
 * Componente React para ícones PNG que reage a mudanças de tema
 */
function PngIconComponent({ 
  icon, 
  ...props 
}: { 
  icon: { name: string; url?: string; url_dark?: string };
  className?: string;
  size?: string | number;
}) {
  const { isDark } = useTheme();
  const size = typeof props.size === 'number' ? props.size : typeof props.size === 'string' ? parseInt(props.size) : 32;
  const imageUrl = getIconUrl(icon, isDark);
  
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={icon.name}
        className={props.className}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
        }}
      />
    );
  }
  
  // Fallback se não conseguir construir URL
  return null;
}

/**
 * Renderiza um ícone da sidebar suportando tanto formato legado (string) quanto novo (objeto)
 * @param icon - Ícone no formato string (legado) ou objeto { name, variant, url? } (novo)
 * @param props - Props adicionais para o componente de ícone (className, size, etc.)
 * @returns Componente React do ícone
 */
export function renderIcon(
  icon: SidebarIcon | undefined,
  props?: { className?: string; size?: string | number; color?: string }
): JSX.Element | null {
  if (!icon) {
    const DefaultIcon = iconMap.default;
    return <DefaultIcon {...props} />;
  }

  // Novo formato: objeto com name e variant
  if (typeof icon === 'object' && 'name' in icon && 'variant' in icon) {
    // Se tiver URL, é um ícone PNG - usa componente que reage a mudanças de tema
    if (icon.url) {
      return <PngIconComponent icon={icon} {...props} />;
    }
    
    // Caso contrário, é um ícone de biblioteca (lib)
    return (
      <PIcon
        name={icon.name}
        variant={icon.variant}
        size={props?.size || 16}
        color={props?.color}
        className={props?.className}
      />
    );
  }

  // Formato legado: string
  if (typeof icon === 'string') {
    const LucideIcon = getIcon(icon);
    return <LucideIcon {...props} />;
  }

  // Fallback
  const DefaultIcon = iconMap.default;
  return <DefaultIcon {...props} />;
}

/**
 * Retorna o componente de ícone apropriado (Lucide, PIcon wrapper, ou componente React para PNG)
 * Útil quando você precisa do componente em si, não apenas renderizá-lo
 * Para ícones PNG, retorna um componente que reage a mudanças de tema
 */
export function getIconComponent(icon: SidebarIcon | undefined): ComponentType<any> {
  if (!icon) {
    return iconMap.default;
  }

  // Novo formato: objeto com name e variant
  if (typeof icon === 'object' && 'name' in icon && 'variant' in icon) {
    // Se tiver URL, é um ícone PNG - retorna componente React que reage a mudanças de tema
    if (icon.url) {
      return (props: any) => <PngIconComponent icon={icon} {...props} />;
    }
    
    // Caso contrário, é um ícone de biblioteca - retorna wrapper que renderiza PIcon
    return (props: any) => (
      <PIcon
        name={icon.name}
        variant={icon.variant}
        size={props?.size || 32}
        color={props?.color}
        className={props?.className}
        {...props}
      />
    );
  }

  // Formato legado: string
  if (typeof icon === 'string') {
    return getIcon(icon);
  }

  // Fallback
  return iconMap.default;
}

