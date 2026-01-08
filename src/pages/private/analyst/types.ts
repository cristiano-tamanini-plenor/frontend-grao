/**
 * Interface do usuário relacionado
 */
export interface AnalystUser {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
}

/**
 * Interface do analista no frontend
 */
export interface Analyst {
  id: string;
  avatar: string | null;
  status: boolean;
  role: string;
  sector: string;
  start_date: string; // ISO date string
  end_date: string | null; // ISO date string
  description: string | null;
  user_id: number | null;
  marvee_cost_center_id: number | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  user?: AnalystUser | null;
}

