export type SidebarItemType = "module" | "group" | "page" | "crud";

/**
 * Tipo para ícone da sidebar
 * Suporta estrutura legada (string) e nova estrutura (objeto com name e variant, ou com url para PNG)
 */
export type SidebarIcon = 
  | string  // Legado: nome do ícone lucide-react
  | {      // Novo: objeto com name e variant para PIcon (iconsax-reactjs) ou com url para PNG
      name: string;
      variant: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold';
      url?: string; // URL relativa do arquivo PNG light (presente apenas quando o ícone é PNG)
      url_dark?: string; // URL relativa do arquivo PNG dark (presente apenas quando o ícone é PNG)
    };

export interface SidebarFeature {
  type: "group" | "page" | "crud";
  icon?: SidebarIcon;
  name: string;
  description: string;
  route: string | null;
  features?: SidebarFeature[];
}

export interface SidebarModule {
  id: number | string; // Aceita número (legado) ou string UUID
  type: "module";
  name: string;
  description: string;
  icon: SidebarIcon;
  allowed_roles?: ('OWNER' | 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST' | 'DEVELOPER')[];
  features: SidebarFeature[];
}

export type SidebarConfig = SidebarModule[];

// Tipos para os dados recebidos da API
export interface ApiCadastro {
  id: string;
  code: string;
  icon: string;
  name: string;
  type: string;
  order: number;
  route: string;
  description: string | null;
}

export interface ApiPlanoItemResponse {
  id: string;
  order_index: number;
  cadastro_id: string;
  plano_modulo_id: string;
  cadastros: ApiCadastro;
}

// Tipo para dados do módulo (necessário para construir a estrutura completa)
export interface ApiModule {
  id: string;
  name: string;
  code: string;
  icon: string;
  description?: string | null;
  allowed_roles?: ('OWNER' | 'MEMBER' | 'MEMBER_LIMITED' | 'GUEST' | 'DEVELOPER')[];
}

