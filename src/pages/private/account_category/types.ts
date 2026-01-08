/**
 * Types for Account Category module
 */

export enum AccountCategoryLevel {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
}

/**
 * Account Category interface (Frontend)
 */
export interface AccountCategory {
  id: string;
  company_id: string;
  account_category_father_id: string | null;
  structure: string | null;
  description: string | null;
  status: boolean;
  level: AccountCategoryLevel;
  category_marvee?: Array<{
    id: number;
    name: string | null;
    description: string | null;
    category: string | null;
    link_id?: number;
  }> | null;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
    cnpj?: string | null;
  };
  father?: AccountCategory | null;
  children?: AccountCategory[];
}

/**
 * DTO for creating account category
 * Note: company_id is in the URL path, not in the payload
 */
export interface CreateAccountCategoryDto {
  account_category_father_id?: number | null;
  structure?: string | null;
  description?: string | null;
  status?: boolean;
  level: AccountCategoryLevel;
}

/**
 * DTO for updating account category
 * Note: company_id is in the URL path, not in the payload
 */
export interface UpdateAccountCategoryDto {
  account_category_father_id?: number | null;
  structure?: string | null;
  description?: string | null;
  status?: boolean;
  level?: AccountCategoryLevel;
}

