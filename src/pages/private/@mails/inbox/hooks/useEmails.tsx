import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailsService } from '../services/emails.service';
import type { Email } from '../types';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { toast } from 'sonner';

/**
 * Hook para buscar emails recebidos (Caixa de Entrada)
 */
export function useInbox(filters?: { folder?: string }) {
  const { currentCompany } = useCompany();

  return useQuery<Email[]>({
    queryKey: ['emails-inbox', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return emailsService.listInbox(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

/**
 * Hook para buscar emails enviados (Caixa de Saída)
 */
export function useSent(filters?: { folder?: string }) {
  const { currentCompany } = useCompany();

  return useQuery<Email[]>({
    queryKey: ['emails-sent', currentCompany?.id, filters],
    queryFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      return emailsService.listSent(currentCompany.id, filters);
    },
    enabled: !!currentCompany?.id,
  });
}

/**
 * Hook para buscar um email específico por ID
 */
export function useEmail(emailId: number | null) {
  const { currentCompany } = useCompany();

  return useQuery<Email>({
    queryKey: ['email', currentCompany?.id, emailId],
    queryFn: async () => {
      if (!currentCompany?.id || !emailId) {
        throw new Error('Empresa não selecionada ou email ID inválido');
      }
      return emailsService.getEmailById(currentCompany.id, emailId);
    },
    enabled: !!currentCompany?.id && !!emailId,
  });
}

/**
 * Hook para sincronizar emails do servidor IMAP
 */
export function useSyncEmails() {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!currentCompany?.id) {
        throw new Error('Empresa não selecionada');
      }
      const result = await emailsService.syncEmails(currentCompany.id);
      
      // Se a API retornou success: false, trata como erro
      if (!result.success) {
        throw new Error(result.message || 'Erro ao sincronizar emails');
      }
      
      return result;
    },
    onSuccess: (result) => {
      // Invalida a query de inbox para refetch
      queryClient.invalidateQueries({ queryKey: ['emails-inbox', currentCompany?.id] });
      
      if (result.count > 0) {
        toast.success(`${result.count} ${result.count === 1 ? 'email sincronizado' : 'emails sincronizados'} com sucesso!`);
      } else {
        toast.info(result.message || 'Nenhum email novo encontrado.');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.response?.data?.message || 'Erro desconhecido ao sincronizar emails';
      toast.error(errorMessage);
    },
  });
}

