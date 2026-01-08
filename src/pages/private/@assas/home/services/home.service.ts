import { apiClient } from '@/lib/api/client';
import type { Charge, ChargesResponse } from '../../charges/services/charges.service';
import type { SubscriptionsResponse } from '../../subscriptions/services/subscriptions.service';
import type { CustomersResponse } from '../../customers/services/customers.service';

/**
 * Interface para saldo da conta
 */
export interface AccountBalance {
  balance: number;
  processingAmount: number;
}

/**
 * Interface para movimentação do extrato
 */
export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  description: string;
  value: number;
  date: string;
  status: string;
  customer?: string;
  customerName?: string;
}

/**
 * Interface para resposta da API de status de integração
 */
export interface IntegrationStatusResponse {
  hasIntegration: boolean;
  message: string;
}

/**
 * Interface para status de integração (formato interno)
 */
export interface IntegrationStatus {
  isConnected: boolean;
  message?: string;
}

/**
 * Interface para contagens dos cards
 */
export interface FeatureCounts {
  activeCustomers: number;
  activeSubscriptions: number;
  totalCharges: number;
}

/**
 * Interface para dados da home do Asaas
 */
export interface AsaasHomeData {
  balance: AccountBalance;
  recentTransactions: Transaction[];
  integrationStatus: IntegrationStatus;
  counts: FeatureCounts;
}

/**
 * Serviço para gerenciar dados da home do Asaas
 */
export const asaasHomeService = {
  /**
   * Busca saldo da conta
   * GET /companies/:companyId/asaas/balance
   */
  async getBalance(companyId: string | number): Promise<AccountBalance> {
    const url = `/companies/${companyId}/asaas/integration/balance`;
    const response = await apiClient.get<AccountBalance>(url);
    return response;
  },

  /**
   * Busca últimas movimentações/transações
   * GET /companies/:companyId/asaas/charges?limit=10
   */
  async getRecentTransactions(companyId: string | number, limit: number = 10): Promise<Transaction[]> {
    const url = `/companies/${companyId}/asaas/charges?limit=${limit}&offset=0`;
    const response = await apiClient.get<{ data: Charge[] }>(url);
    
    // Mapeia as charges para o formato de Transaction
    return response.data.map((charge) => ({
      id: charge.id,
      type: charge.status === 'RECEIVED' ? 'credit' : 'debit',
      description: charge.description || 'Cobrança',
      value: charge.netValue || charge.value,
      date: charge.dateCreated || charge.paymentDate || new Date().toISOString(),
      status: charge.status,
      customer: charge.customer,
      customerName: charge.customerData?.name,
    }));
  },

  /**
   * Verifica status de integração
   * GET /companies/:companyId/asaas/integration/status
   */
  async getIntegrationStatus(companyId: string | number): Promise<IntegrationStatus> {
    const url = `/companies/${companyId}/asaas/integration/status`;
    try {
      const response = await apiClient.get<IntegrationStatusResponse>(url);
      // Mapeia a resposta da API para o formato interno
      return {
        isConnected: response.hasIntegration,
        message: response.message,
      };
    } catch (error) {
      // Se a rota não existir, retorna status desconectado
      return { isConnected: false, message: 'Não foi possível verificar o status da integração' };
    }
  },

  /**
   * Configura integração do Asaas
   * POST /companies/:companyId/asaas/integration
   */
  async configureIntegration(
    companyId: string | number,
    token: string
  ): Promise<{ message: string; success: boolean }> {
    const url = `/companies/${companyId}/asaas/integration`;
    const response = await apiClient.post<{ message: string; success: boolean }>(url, { token });
    return response;
  },

  /**
   * Busca contagens de features (clientes, assinaturas, cobranças)
   */
  async getFeatureCounts(companyId: string | number): Promise<FeatureCounts> {
    try {
      // Busca clientes (totalCount retorna todos os clientes)
      const customersUrl = `/companies/${companyId}/asaas/customers?limit=1&offset=0`;
      const customersResponse = await apiClient.get<CustomersResponse>(customersUrl);
      
      // Busca assinaturas ativas (status ACTIVE)
      const subscriptionsUrl = `/companies/${companyId}/asaas/subscriptions?limit=1&offset=0&status=ACTIVE`;
      const subscriptionsResponse = await apiClient.get<SubscriptionsResponse>(subscriptionsUrl);
      
      // Busca total de cobranças
      const chargesUrl = `/companies/${companyId}/asaas/charges?limit=1&offset=0`;
      const chargesResponse = await apiClient.get<ChargesResponse>(chargesUrl);

      return {
        activeCustomers: customersResponse.totalCount || 0,
        activeSubscriptions: subscriptionsResponse.totalCount || 0,
        totalCharges: chargesResponse.totalCount || 0,
      };
    } catch (error) {
      // Em caso de erro, retorna valores padrão
      console.error('Error fetching feature counts:', error);
      return {
        activeCustomers: 0,
        activeSubscriptions: 0,
        totalCharges: 0,
      };
    }
  },

  /**
   * Busca dados completos da home do Asaas
   * Combina balance, transações recentes, status de integração e contagens
   */
  async getHomeData(companyId: string | number): Promise<AsaasHomeData> {
    // Usa Promise.allSettled para não falhar completamente se algum endpoint falhar
    const [balanceResult, transactionsResult, integrationStatusResult, countsResult] = await Promise.allSettled([
      this.getBalance(companyId),
      this.getRecentTransactions(companyId, 10),
      this.getIntegrationStatus(companyId),
      this.getFeatureCounts(companyId),
    ]);

    // Extrai os valores ou usa valores padrão em caso de erro
    const balance = balanceResult.status === 'fulfilled' 
      ? balanceResult.value 
      : { balance: 0, processingAmount: 0 };
    
    const transactions = transactionsResult.status === 'fulfilled' 
      ? transactionsResult.value 
      : [];
    
    const integrationStatus = integrationStatusResult.status === 'fulfilled' 
      ? integrationStatusResult.value 
      : { isConnected: false, message: 'Erro ao verificar status' };
    
    const counts = countsResult.status === 'fulfilled' 
      ? countsResult.value 
      : { activeCustomers: 0, activeSubscriptions: 0, totalCharges: 0 };

    return {
      balance,
      recentTransactions: transactions,
      integrationStatus,
      counts,
    };
  },
};

