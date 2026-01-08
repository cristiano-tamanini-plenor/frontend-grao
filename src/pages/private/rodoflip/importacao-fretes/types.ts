/**
 * Tipos e interfaces para o módulo de importação de fretes
 */

export interface FreightImportItem {
  id: number;
  freight_import_id: number;
  sislogica_id: string;
  cte_status: string | null; // Status do CT-e conforme informado no CSV
  import_status: 'pending' | 'imported'; // Status de importação no sistema Marvee
  marvee_id: string | null; // ID retornado pelo sistema Marvee após importação
  cte_type: string | null;
  remessa_number: string | null;
  customer: string | null;
  cte_number: string | null;
  cte_series: string | null;
  cte_key: string | null;
  cfop: string | null;
  cte_value: number | null;
  icms_value: number | null;
  generation_date: string | null;
  service: string | null;
  cnpj_taker: string | null;
  taker_name: string | null;
  createdAt: string;
  updatedAt: string;
  // Campo legado para compatibilidade (mapeia para cte_status)
  status?: string | null;
}

export interface ImportProgress {
  percentage: number;
  total: number;
  imported: number;
  pending: number;
}

export interface FreightImport {
  id: number;
  company_id: number;
  import_date: string;
  user_id: number;
  file_url: string;
  status: 'pending' | 'imported';
  import_progress?: ImportProgress;
  createdAt: string;
  updatedAt: string;
  items?: FreightImportItem[];
  company?: {
    id: number;
    name: string;
  };
}

export interface UploadFreightImportResponse {
  id: number;
  company_id: number;
  import_date: string;
  user_id: number;
  file_url: string;
  status: 'pending' | 'imported';
  import_progress?: ImportProgress;
  createdAt: string;
  updatedAt: string;
  message?: string;
}

export interface DeleteFreightImportResponse {
  message: string;
}
