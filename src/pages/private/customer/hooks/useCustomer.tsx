import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { customersService } from '../services/customers.service';
import type { CustomerFormSchema } from '../schemas/customer.schemas';
import type { Customer } from '../types';

export function useCustomer(id?: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      return customersService.getCustomerById(id);
    },
    enabled: !!id,
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      return customersService.listCustomers();
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CustomerFormSchema): Promise<Customer> => {
      return customersService.createCustomer(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente criado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      toast.error('Erro ao criar cliente: ' + errorMessage);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerFormSchema }): Promise<Customer> => {
      return customersService.updateCustomer(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast.success('Cliente atualizado com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      toast.error('Erro ao atualizar cliente: ' + errorMessage);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return customersService.deleteCustomer(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast.success('Cliente excluído com sucesso!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro desconhecido';
      toast.error('Erro ao excluir cliente: ' + errorMessage);
    },
  });
}

