import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Customer } from '@/pages/private/@marvee/customer/services/customers.service';
import { Building2, Mail, Phone, MapPin, Hash, Calendar } from 'lucide-react';

interface ModalCustomerCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer;
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

export default function ModalCustomerCard({
  open,
  onOpenChange,
  customer,
}: ModalCustomerCardProps) {
  const avatarUrl = buildAvatarUrl(customer);
  const customerName = customer.fantasy_name || customer.name || 'Cliente';
  const fullAddress = [
    customer.address,
    customer.number && `nº ${customer.number}`,
    customer.complement,
    customer.district,
    customer.city,
    customer.cep && `CEP: ${customer.cep}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cartão de Visita</DialogTitle>
          <DialogDescription>
            Informações completas do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header com Avatar e Nome */}
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="w-24 h-24 rounded-md overflow-hidden border-2 border-border bg-muted flex items-center justify-center flex-shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={customerName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-1">{customerName}</h3>
              {customer.cnpjcpf && (
                <p className="text-sm text-muted-foreground">CNPJ/CPF: {customer.cnpjcpf}</p>
              )}
              {customer.code && (
                <p className="text-sm text-muted-foreground">Código: {customer.code}</p>
              )}
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="space-y-3">
            {customer.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>
            )}

            {customer.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {customer.phone}
                  </a>
                </div>
              </div>
            )}

            {fullAddress && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Endereço</p>
                  <p className="text-sm text-muted-foreground">{fullAddress}</p>
                </div>
              </div>
            )}

            {customer.contact_name && (
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Contato</p>
                  <p className="text-sm text-muted-foreground">{customer.contact_name}</p>
                </div>
              </div>
            )}

            {customer.opening_date && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Data de Abertura</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(customer.opening_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          {(customer.website || customer.entity_type) && (
            <div className="pt-4 border-t space-y-2">
              {customer.website && (
                <div>
                  <p className="text-sm font-medium mb-1">Website</p>
                  <a
                    href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {customer.website}
                  </a>
                </div>
              )}
              {customer.entity_type && (
                <div>
                  <p className="text-sm font-medium mb-1">Tipo de Entidade</p>
                  <p className="text-sm text-muted-foreground">{customer.entity_type}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

