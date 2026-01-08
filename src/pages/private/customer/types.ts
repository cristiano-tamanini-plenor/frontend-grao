/**
 * Interface do cliente no frontend
 */
export interface Customer {
  id: string;
  name: string;
  fantasy_name: string;
  guid_marvee: string;
  marvee_id: number | null;
  status: boolean;
  date_initial: string; // ISO 8601
  date_final: string | null; // ISO 8601
  avatar: string | null;
  analyst_id: number | null;
  fee: number | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  analyst?: {
    id: number;
    avatar: string | null;
    role?: string;
    sector?: string;
    status?: boolean;
  } | null;
}

