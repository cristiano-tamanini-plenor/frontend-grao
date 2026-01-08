import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PIcon } from '@/components/ui/p-icon';
import { Info } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { customersService } from '@/pages/private/@marvee/customer/services/customers.service';
import ModalCarteira from './modalCarteira';

interface CardCarteiraProps {
  analystId: number | null;
}

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function CardCarteira({ analystId }: CardCarteiraProps) {
  const { currentCompany } = useCompany();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Busca clientes ativos do analista
  const { data: activeCustomers, isLoading } = useQuery({
    queryKey: ['marvee-customers-active-by-analyst', currentCompany?.id, analystId],
    queryFn: async () => {
      if (!currentCompany?.id || !analystId) {
        return [];
      }
      return await customersService.getActiveCustomersByAnalyst(currentCompany.id, analystId);
    },
    enabled: !!currentCompany?.id && !!analystId,
    refetchOnMount: true,
    staleTime: 0, // Sempre considera os dados como stale para garantir refetch quando analystId muda
  });

  // Força refetch quando analystId mudar
  useEffect(() => {
    if (currentCompany?.id && analystId) {
      queryClient.invalidateQueries({
        queryKey: ['marvee-customers-active-by-analyst', currentCompany.id, analystId],
      });
    }
  }, [analystId, currentCompany?.id, queryClient]);

  // Obtém a quantidade de clientes ativos
  const quantidade = activeCustomers?.length ?? 0;

  // Calcula a soma dos fees (quando não forem null)
  const totalFee = activeCustomers?.reduce((sum, customer) => {
    if (customer.fee !== null && customer.fee !== undefined && !isNaN(customer.fee)) {
      return sum + customer.fee;
    }
    return sum;
  }, 0) ?? 0;

  return (
    <>
      <Card 
        className="p-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer relative"
        onClick={() => setIsModalOpen(true)}
      >
      <CardContent className="p-0">
        {/* Ícone de informação no canto superior direito */}
        <Info className="absolute top-2 right-2 h-3 w-3 text-muted-foreground" />
        
        <div className="flex items-center justify-between gap-2 py-1">
          {/* Ícone à esquerda */}
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
            <PIcon 
              name="empty_wallet" 
              variant="Bulk" 
              size={16} 
              color="#3B82F6" 
            />
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground mb-0.5 leading-tight">Carteira</p>
            <p className="text-lg font-bold mb-0.5 leading-tight">{isLoading ? '...' : quantidade}</p>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">FEE</span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                {isLoading ? '...' : formatCurrency(totalFee)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <ModalCarteira
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      customers={activeCustomers ?? []}
      isLoading={isLoading}
    />
    </>
  );
}
