import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Customer } from '@/pages/private/@marvee/customer/services/customers.service';
import { Loader2, Building2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ModalCustomerCard from './modalCustomerCard';

interface ModalCarteiraProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: Customer[];
  isLoading?: boolean;
}

// Função para construir URL do avatar
function buildAvatarUrl(customer: Customer): string | null {
  // Prioriza company_avatar_url se disponível, caso contrário usa avatar
  const avatar = customer.company_avatar_url || customer.avatar;
  
  if (!avatar) return null;
  
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:')) {
    return avatar;
  }
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:6969';
  const cleanAvatar = avatar.startsWith('/') ? avatar.slice(1) : avatar;
  return `${apiUrl}/${cleanAvatar}`;
}

// Função para obter as primeiras 5 letras do nome
function getShortName(customer: Customer): string {
  const name = customer.fantasy_name || customer.name || '';
  return name.substring(0, 5).toUpperCase();
}

// Componente para o avatar do cliente
function CustomerAvatar({
  customer,
  avatarUrl,
  customerName,
  onClick,
}: {
  customer: Customer;
  avatarUrl: string | null;
  customerName: string;
  onClick: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={onClick}
          >
            {/* Avatar */}
            <div className="relative w-20 h-20 rounded-md overflow-hidden border-2 border-border/50 bg-muted flex items-center justify-center group-hover:border-primary transition-colors">
              {avatarUrl && !imageError ? (
                <img
                  src={avatarUrl}
                  alt={customerName}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            {/* Nome abreviado */}
            <span className="text-xs font-medium text-center text-foreground group-hover:text-primary transition-colors">
              {getShortName(customer)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{customerName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ModalCarteira({
  open,
  onOpenChange,
  customers,
  isLoading = false,
}: ModalCarteiraProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Ordena por nome
  const sortedCustomers = [...customers].sort((a, b) => {
    const nameA = (a.fantasy_name || a.name || '').toLowerCase();
    const nameB = (b.fantasy_name || b.name || '').toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCardModalOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Clientes Ativos</DialogTitle>
            <DialogDescription>
              Lista de clientes ativos da carteira
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Carregando clientes...</p>
              </div>
            ) : sortedCustomers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-4 p-2">
                {sortedCustomers.map((customer) => {
                  const avatarUrl = buildAvatarUrl(customer);
                  const customerName = customer.fantasy_name || customer.name || 'Cliente';
                  
                  return (
                    <CustomerAvatar
                      key={customer.id}
                      customer={customer}
                      avatarUrl={avatarUrl}
                      customerName={customerName}
                      onClick={() => handleCustomerClick(customer)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal do Cartão de Visita */}
      {selectedCustomer && (
        <ModalCustomerCard
          open={isCardModalOpen}
          onOpenChange={setIsCardModalOpen}
          customer={selectedCustomer}
        />
      )}
    </>
  );
}
