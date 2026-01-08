/**
 * Tipos TypeScript para o módulo de emails
 * Baseado na documentação da API
 */

/**
 * Direção do email
 */
export type EmailDirection = 'INCOMING' | 'OUTGOING';

/**
 * Endereço de email (remetente ou destinatário)
 */
export interface EmailAddress {
  name: string;
  address: string;
}

/**
 * Configuração de conta de email
 */
export interface AccountConfig {
  id: number;
  smtp_host: string;
  smtp_port?: number;
  smtp_user?: string;
  // ... outros campos opcionais
}

/**
 * Email completo
 */
export interface Email {
  id: number;
  company_id: number;
  account_config_id: number;
  remote_uid: number | null;
  message_id: string | null;
  direction: EmailDirection;
  folder: string;
  subject: string | null;
  snippet: string | null;
  body_text: string | null;
  body_html: string | null;
  from_address: EmailAddress;
  to_address: EmailAddress[];
  received_at: string; // ISO 8601
  has_attachments: boolean;
  ai_processed: boolean;
  task_id: number | null;
  createdAt: string;
  updatedAt: string;
  accountConfig?: AccountConfig;
  company?: {
    id: number;
    name: string;
  };
}

/**
 * Filtros para listagem de emails
 */
export interface EmailsFilters {
  direction?: EmailDirection;
  folder?: string;
  page?: number;
  pageSize?: number;
}

