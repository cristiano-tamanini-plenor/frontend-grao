export interface Company {
  id: string;
  name: string;
  system_nickname: string | null;
  legal_representative: string | null;
  legal_email: string | null;
  legal_phone: string | null;
  client_id: string | null;
  client_secret: string | null;
  avatar_url: string | null;
  is_active: boolean;
  user_id: string;
  cnpj: string | null;
  plan_id: string | null;
  customer_id?: string | null; // ID do cliente associado
  certificate_imported?: boolean;
  certificate_validity?: string | null;
  certificate_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCompanyData {
  name: string;
  system_nickname?: string;
  legal_representative?: string;
  legal_email?: string;
  legal_phone?: string;
  client_id?: string | null;
  client_secret?: string | null;
  avatar?: string; // Base64 com data URI para criação (conforme documentação)
  cnpj?: string;
  plan_id?: string | null;
  customer_id?: string;
  certificate?: File;
  certificate_password?: string;
}

export interface UpdateCompanyData {
  name?: string;
  system_nickname?: string | null;
  legal_representative?: string;
  legal_email?: string;
  legal_phone?: string | null;
  client_id?: string | null;
  client_secret?: string | null;
  // avatar_url não é enviado - o avatar é gerenciado separadamente via endpoint específico
  is_active?: boolean;
  cnpj?: string | null;
  plan_id?: string | null;
  customer_id?: string | null;
  alter_certificate?: boolean;
  certificate?: File;
  certificate_password?: string;
}
