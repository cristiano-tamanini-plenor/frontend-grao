import { useState, useMemo } from 'react';
import { ListHeader } from '@/components/ListHeader';
import { Button } from '@/components/ui/button';
import { Building2, Eye, EyeOff, Pencil, Trash2, FileCheck, AlertCircle } from 'lucide-react';
import { CompanyFormModal } from './form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatCNPJ } from '@/lib/utils/cnpj';
import DataGrid from '@/components/DataGrid';
import { useDeleteCompany } from './hooks/useDeleteCompany';
import { Company } from './types';
import { Stack } from '@/components/Stack';
import { DeleteCompanyModal } from './components/DeleteCompanyModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { companiesService } from './services/companies.service';
import { usePermission } from '@/hooks/usePermission';

export default function Companies() {
  const { canCreate, canEdit, canDelete } = usePermission('organizations');
  const queryClient = useQueryClient();
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['all-companies'],
    queryFn: () => companiesService.listAllCompanies(),
  });
  const deleteCompanyMutation = useDeleteCompany();

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const refreshCompanies = () => {
    queryClient.invalidateQueries({ queryKey: ['all-companies'] });
  };

  // Filtrar empresas baseado na busca
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return companies;
    }

    const query = searchQuery.toLowerCase().trim();
    return companies.filter((company) => {
      // Busca por nome
      const nameMatch = company.name?.toLowerCase().includes(query) ?? false;
      // Busca por CNPJ (com e sem formatação)
      const cnpjMatch = company.cnpj 
        ? (company.cnpj.toLowerCase().includes(query) || 
           company.cnpj.replace(/\D/g, '').includes(query.replace(/\D/g, '')))
        : false;
      // Busca por nome fantasia/apelido sistema
      const nicknameMatch = company.system_nickname?.toLowerCase().includes(query) ?? false;
      // Busca por responsável legal
      const representativeMatch = company.legal_representative?.toLowerCase().includes(query) ?? false;
      // Busca por email
      const emailMatch = company.legal_email?.toLowerCase().includes(query) ?? false;
      // Busca por telefone
      const phoneMatch = company.legal_phone?.toLowerCase().includes(query) ?? false;
      // Busca por client_id
      const clientIdMatch = company.client_id?.toLowerCase().includes(query) ?? false;

      return nameMatch || cnpjMatch || nicknameMatch || representativeMatch || 
             emailMatch || phoneMatch || clientIdMatch;
    });
  }, [companies, searchQuery]);

  const canManage = canEdit || canDelete;

  const handleCreate = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  const handleSuccess = () => {
    refreshCompanies();
    handleModalClose();
  };

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;
    try {
      await deleteCompanyMutation.mutateAsync(companyToDelete.id);
      refreshCompanies();
      setIsDeleteModalOpen(false);
      setCompanyToDelete(null);
    } catch (error) {
      // Error is handled by the mutation
      throw error;
    }
  };

  const toggleSecretVisibility = (companyId: string) => {
    setVisibleSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const maskSecret = (secret: string | null) => {
    if (!secret) return '-';
    return '*'.repeat(Math.min(secret.length, 16));
  };

  const handleRowDoubleClick = (row: Company) => {
    if (canManage) {
      setSelectedCompany(row);
      setIsModalOpen(true);
    }
  };

  // Definição das colunas
  const columns = useMemo(() => [
    {
      key: 'avatar',
      header: 'Avatar',
      accessorKey: 'avatar_url',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (_: string | null, row: Company) => {
        const initials = row.name
          .substring(0, 2)
          .toUpperCase();

        return (
          <Avatar className="h-6 w-6 mx-auto">
            <AvatarImage src={row.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      minWidth: 250,
      flex: true,
    },
    {
      key: 'cnpj',
      header: 'CNPJ',
      accessorKey: 'cnpj',
      width: 180,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string | null) => (
        <span className="text-sm">{value ? formatCNPJ(value) : '-'}</span>
      ),
    },
    {
      key: 'legal_representative',
      header: 'Responsável Legal',
      accessorKey: 'legal_representative',
      minWidth: 200,
      flex: true,
    },
    {
      key: 'legal_email',
      header: 'Email',
      accessorKey: 'legal_email',
      minWidth: 220,
      flex: true,
    },
    {
      key: 'legal_phone',
      header: 'Telefone',
      accessorKey: 'legal_phone',
      width: 150,
      cell: (value: string | null) => (
        <span>{value || '-'}</span>
      ),
    },
    {
      key: 'client_id',
      header: 'Client ID',
      accessorKey: 'client_id',
      width: 150,
      cell: (value: string | null) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {value ?? '-'}
        </code>
      ),
    },
    {
      key: 'client_secret',
      header: 'Client Secret',
      accessorKey: 'client_secret',
      width: 200,
      cell: (value: string | null, row: Company) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded">
            {visibleSecrets.has(row.id)
              ? (value ?? '-')
              : maskSecret(value)}
          </code>
          {value && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                toggleSecretVisibility(row.id);
              }}
            >
              {visibleSecrets.has(row.id) ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'certificate',
      header: 'Certificado',
      accessorKey: 'certificate_imported',
      width: 150,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (_: boolean, row: Company) => {
        if (!row.certificate_imported) {
          return (
            <Badge variant="outline" className="text-muted-foreground">
              Não importado
            </Badge>
          );
        }

        if (!row.certificate_validity) {
          return (
            <Badge variant="default" className="flex items-center gap-1">
              <FileCheck className="h-3 w-3" />
              Importado
            </Badge>
          );
        }

        const validityDate = new Date(row.certificate_validity);
        const today = new Date();
        const daysUntilExpiry = Math.ceil(
          (validityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry < 0) {
          return (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Expirado
            </Badge>
          );
        }

        if (daysUntilExpiry < 30) {
          return (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Expira em {daysUntilExpiry}d
            </Badge>
          );
        }

        if (daysUntilExpiry < 90) {
          return (
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileCheck className="h-3 w-3" />
              Expira em {daysUntilExpiry}d
            </Badge>
          );
        }

        return (
          <Badge variant="default" className="flex items-center gap-1">
            <FileCheck className="h-3 w-3" />
            Válido
          </Badge>
        );
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      accessorKey: 'is_active',
      width: 120,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      accessorKey: 'id',
      width: 150,
      cellAlign: 'right' as const,
      headerAlign: 'right' as const,
      cell: (_: string, row: Company) => (
        <div className="flex justify-end gap-1">
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCompany(row);
                  setIsModalOpen(true);
                }}
                title="Editar empresa"
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row);
                }}
                title="Excluir empresa"
                className="h-8 w-8 text-destructive hover:text-destructive"
                disabled={deleteCompanyMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ], [visibleSecrets, canManage, deleteCompanyMutation.isPending, handleDeleteClick]);

  return (
    <Stack>
      <ListHeader
        title="Empresas"
        icon={Building2}
        canCreate={canCreate}
        addButtonLabel="Nova Empresa"
        onAdd={handleCreate}
      />

      <DataGrid
        id="companies-grid"
        data={filteredCompanies}
        columns={columns}
        pagination={true}
        pageSize={20}
        enableRowSelection={false}
        loading={isLoading}
        emptyMessage="Nenhuma empresa encontrada"
        height="100%"
        searchable={false}
        exportable={true}
        columnConfigurable={true}
        onRowDoubleClick={handleRowDoubleClick}
      />

      <CompanyFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setSelectedCompany(null);
          }
        }}
        company={selectedCompany}
        onSuccess={handleSuccess}
      />

      <DeleteCompanyModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open);
          if (!open) {
            setCompanyToDelete(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        companyName={companyToDelete?.name || ''}
      />
    </Stack>
  );
}

