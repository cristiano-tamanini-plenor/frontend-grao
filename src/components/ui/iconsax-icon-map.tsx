import * as IconsaxIcons from 'iconsax-reactjs';

/**
 * Mapeamento de nomes customizados para ícones do iconsax-reactjs
 * Permite usar nomes mais amigáveis ou padronizados no sistema
 */
export const iconsaxIconMap: Record<string, string> = {
  // Ícones de navegação
  home: 'Home',
  dashboard: 'Chart',
  settings: 'Setting2',
  
  // Ícones de usuário
  user: 'User',
  users: 'Profile2User',
  customer: 'User',
  peoples: 'Profile2User',
  people: 'Profile2User',
  
  // Ícones de ações
  edit: 'Edit',
  delete: 'Trash',
  save: 'Save2',
  search: 'SearchNormal',
  filter: 'Filter',
  add: 'Add',
  plus: 'Add',
  remove: 'Minus',
  minus: 'Minus',
  close: 'CloseCircle',
  cancel: 'CloseCircle',
  
  // Ícones de status
  check: 'TickCircle',
  success: 'TickCircle',
  warning: 'Warning2',
  error: 'Danger',
  info: 'InfoCircle',
  
  // Ícones de arquivo
  file: 'Document',
  folder: 'Folder',
  upload: 'Export',
  download: 'Import',
  
  // Ícones de movimento
  arrow_up: 'ArrowUp',
  arrow_down: 'ArrowDown',
  arrow_left: 'ArrowLeft',
  arrow_right: 'ArrowRight',
  movi_up: 'ArrowUp',
  movi_down: 'ArrowDown',
  
  // Ícones de negócio
  dollar: 'DollarCircle',
  shopping: 'ShoppingCart',
  building: 'Building',
  target: 'Target',
  package: 'Package',
  box: 'Box',
  boxes: 'Box1',
  
  // Ícones de comunicação
  inbox: 'Message',
  outbox: 'Send2',
  contact: 'Book',
  mail: 'Sms',
  
  // Ícones de interface
  menu: 'Menu',
  layers: 'Layer',
  modulos: 'Box1',
  cadastros: 'Document',
  
  // Ícone padrão
  default: 'Document',
};

/**
 * Função auxiliar para obter o nome do ícone do iconsax-reactjs
 * Primeiro verifica o mapeamento customizado, depois retorna o nome original
 */
export function getIconsaxIconName(iconName?: string): string | null {
  if (!iconName) return null;
  
  // Verifica se existe no mapeamento customizado
  const mappedName = iconsaxIconMap[iconName.toLowerCase()];
  if (mappedName) {
    return mappedName;
  }
  
  // Retorna o nome original convertido para PascalCase se necessário
  return iconName
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Verifica se um ícone existe no iconsax-reactjs
 */
export function iconExists(iconName: string): boolean {
  const resolvedName = getIconsaxIconName(iconName) || iconName;
  return !!(IconsaxIcons as unknown as Record<string, unknown>)[resolvedName];
}

