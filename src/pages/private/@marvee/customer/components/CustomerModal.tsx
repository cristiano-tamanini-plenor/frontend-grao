import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Customer } from '../services/customers.service';

interface CustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function CustomerModal({ open, onOpenChange, customer }: CustomerModalProps) {
  if (!customer) return null;

  // Formata CPF/CNPJ
  const formatCpfCnpj = (value: string | null | undefined) => {
    if (!value) return '—';
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    if (numbers.length === 14) {
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }

    return value;
  };

  // Formata telefone
  const formatPhone = (value: string | null | undefined) => {
    if (!value) return '—';
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    return value;
  };

  // Formata data
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Formata CEP
  const formatCep = (value: string | null | undefined) => {
    if (!value) return '—';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes do Cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados Gerais */}
          <div className="border rounded-lg p-4">
            <h3 className="text-base font-semibold mb-4 pb-2 border-b">
              Dados Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Código
                </label>
                <p className="text-sm font-mono">{customer.code || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  ID
                </label>
                <p className="text-sm font-mono">{customer.id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Nome
                </label>
                <p className="text-sm">{customer.name || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Nome Fantasia
                </label>
                <p className="text-sm">{customer.fantasy_name || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Tipo de Entidade
                </label>
                <p className="text-sm">{customer.entity_type || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  E-mail
                </label>
                <p className="text-sm">{customer.email || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Telefone
                </label>
                <p className="text-sm">{formatPhone(customer.phone)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Nome do Contato
                </label>
                <p className="text-sm">{customer.contact_name || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Website
                </label>
                <p className="text-sm">
                  {customer.website ? (
                    <a
                      href={customer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {customer.website}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Status
                </label>
                <p className="text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      customer.status
                        ? 'text-green-600 bg-green-50'
                        : 'text-red-600 bg-red-50'
                    }`}
                  >
                    {customer.status ? 'Ativo' : 'Inativo'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Data de Criação
                </label>
                <p className="text-sm">{formatDate(customer.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Última Atualização
                </label>
                <p className="text-sm">{formatDate(customer.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="border rounded-lg p-4">
            <h3 className="text-base font-semibold mb-4 pb-2 border-b">
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  CEP
                </label>
                <p className="text-sm">{formatCep(customer.cep)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Tipo de Endereço
                </label>
                <p className="text-sm">{customer.type_address || '—'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-muted-foreground">
                  Logradouro
                </label>
                <p className="text-sm">{customer.address || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Número
                </label>
                <p className="text-sm">{customer.number || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Complemento
                </label>
                <p className="text-sm">{customer.complement || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Bairro
                </label>
                <p className="text-sm">{customer.district || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Cidade
                </label>
                <p className="text-sm">{customer.city || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Estado
                </label>
                <p className="text-sm">
                  {customer.state_id ? `ID: ${customer.state_id}` : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Município
                </label>
                <p className="text-sm">
                  {customer.county_id ? `ID: ${customer.county_id}` : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  País
                </label>
                <p className="text-sm">
                  {customer.country_id ? `ID: ${customer.country_id}` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Fiscal */}
          <div className="border rounded-lg p-4">
            <h3 className="text-base font-semibold mb-4 pb-2 border-b">
              Dados Fiscais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  CPF/CNPJ
                </label>
                <p className="text-sm">{formatCpfCnpj(customer.cnpjcpf)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Inscrição Estadual
                </label>
                <p className="text-sm">
                  {customer.state_registrate || customer.county_registrate || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Regime Tributário
                </label>
                <p className="text-sm">{customer.tax_regime || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Regime Tributário Especial
                </label>
                <p className="text-sm">
                  {customer.special_tax_regime || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Modalidade de Lucro
                </label>
                <p className="text-sm">
                  {customer.modalidade_lucro || '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  CNAE Principal
                </label>
                <p className="text-sm">
                  {customer.main_cnae_id ? `ID: ${customer.main_cnae_id}` : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Emite NFS-e
                </label>
                <p className="text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      customer.emite_nfses
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-600 bg-gray-50'
                    }`}
                  >
                    {customer.emite_nfses ? 'Sim' : 'Não'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Recebe NFS-e
                </label>
                <p className="text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      customer.recebe_nfses
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-600 bg-gray-50'
                    }`}
                  >
                    {customer.recebe_nfses ? 'Sim' : 'Não'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Perfil Fiscal
                </label>
                <p className="text-sm">
                  {customer.tax_profile_id
                    ? `ID: ${customer.tax_profile_id}`
                    : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">
                  Indicador de IE
                </label>
                <p className="text-sm">{customer.ie_indicator || '—'}</p>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          {(customer.origin ||
            customer.origin_description ||
            customer.segment_id ||
            customer.seller_id) && (
            <div className="border rounded-lg p-4">
              <h3 className="text-base font-semibold mb-4 pb-2 border-b">
                Informações Adicionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.origin && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">
                      Origem
                    </label>
                    <p className="text-sm">{customer.origin}</p>
                  </div>
                )}
                {customer.origin_description && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">
                      Descrição da Origem
                    </label>
                    <p className="text-sm">{customer.origin_description}</p>
                  </div>
                )}
                {customer.segment_id && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">
                      Segmento
                    </label>
                    <p className="text-sm">ID: {customer.segment_id}</p>
                  </div>
                )}
                {customer.seller_id && (
                  <div>
                    <label className="text-sm font-semibold text-muted-foreground">
                      Vendedor
                    </label>
                    <p className="text-sm">ID: {customer.seller_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

