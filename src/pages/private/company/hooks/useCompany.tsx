import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { companiesService } from '../services/companies.service';
import type { Company } from '../types';
import { useAuth } from '@/modules/auth/hooks/useAuth';

interface CompanyContextType {
  currentCompany: Company | null;
  companies: Company[];
  isLoading: boolean;
  error: Error | null;
  setCompany: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = 'selected_company_id';

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCompanies = async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await companiesService.listUserCompanies();
      setCompanies(data);
      
      // Verificar se há empresas
      if (data.length === 0) {
        setError(new Error('NO_COMPANIES'));
        setIsLoading(false);
        return;
      }
      
      // Try to get saved company from localStorage
      const savedCompanyId = localStorage.getItem(STORAGE_KEY);
      let companyToSelect: Company | null = null;

      if (savedCompanyId) {
        companyToSelect = data.find(c => c.id === savedCompanyId) || null;
      }

      // If no saved company or saved company not found, use first one
      if (!companyToSelect && data.length > 0) {
        companyToSelect = data[0];
      }

      if (companyToSelect) {
        setCurrentCompany(companyToSelect);
        localStorage.setItem(STORAGE_KEY, companyToSelect.id);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, [isAuthenticated]);

  const setCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      // Invalidar cache da sidebar da empresa anterior
      if (currentCompany?.id) {
        queryClient.removeQueries({ queryKey: ['sidebar', currentCompany.id] });
      }
      
      setCurrentCompany(company);
      localStorage.setItem(STORAGE_KEY, company.id);
      
      // Invalidar cache da sidebar da nova empresa para forçar reload
      queryClient.invalidateQueries({ queryKey: ['sidebar', company.id] });
    }
  };

  const refreshCompanies = async () => {
    setIsLoading(true);
    await loadCompanies();
  };

  const value = {
    currentCompany,
    companies,
    isLoading,
    error,
    setCompany,
    refreshCompanies,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
}
