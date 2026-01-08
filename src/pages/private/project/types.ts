/**
 * Tipos do backend NestJS (conforme documentação)
 */
export interface Project {
  id: number;
  company_id: number;
  nome: string;
  descricao_detalhada?: string;
  data_inicial: string; // ISO date format (YYYY-MM-DD)
  data_final?: string; // ISO date format (YYYY-MM-DD)
  status: boolean;
  logomarca_url?: string; // URL pública da imagem
  imagem_banner_url?: string; // URL pública da imagem
  centro_custo_id?: string;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export interface CreateProjectDto {
  nome: string;                    // Obrigatório
  descricao_detalhada?: string;     // Opcional
  data_inicial: string;            // Obrigatório (YYYY-MM-DD)
  data_final?: string;             // Opcional (YYYY-MM-DD)
  status?: boolean;                 // Opcional (padrão: true)
  centro_custo_id?: string;        // Opcional
  logomarca?: File;                 // Opcional (JPEG, PNG, GIF, máx. 5MB)
  imagem_banner?: File;             // Opcional (JPEG, PNG, GIF, máx. 5MB)
}

export interface UpdateProjectDto {
  nome?: string;
  descricao_detalhada?: string;
  data_inicial?: string;
  data_final?: string;
  status?: boolean;
  centro_custo_id?: string;
  logomarca?: File;
  imagem_banner?: File;
}

export interface ProjectFormData {
  nome: string;
  descricao_detalhada?: string;
  data_inicial: string;
  data_final?: string;
  status: boolean;
  centro_custo_id?: string;
  logomarca?: File | null;
  imagem_banner?: File | null;
}

