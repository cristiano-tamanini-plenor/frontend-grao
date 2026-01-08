import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Trash2, Building2, Edit } from 'lucide-react';
import DataGrid from '@/components/DataGrid';
import { Stack } from '@/components/Stack';
import { ConfirmDialog, ModalHeader } from '@/components/Dialog';

import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import { formatCNPJ } from '@/lib/utils/cnpj';
import { AddUserCompanyModal } from './AddUserCompanyModal';
import { Company } from '@/pages/private/company/types';
import { UserWithRole } from '../types';
import { userCompaniesService } from '../services/user-companies.service';
import { EditUserCompanyProfileModal } from './EditUserCompanyProfileModal';

interface UserCompaniesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRole | null;
}

export function UserCompaniesModal({ open, onOpenChange, user }: UserCompaniesModalProps) {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<(Company & { user_profile_id?: string; user_profile_name?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [companyToRemove, setCompanyToRemove] = useState<Company | null>(null);
  const [editingCompany, setEditingCompany] = useState<(Company & { user_profile_id?: string; user_profile_name?: string }) | null>(null);

  useEffect(() => {
    if (open && user) {
      loadCompanies();
    }
  }, [open, user]);

  const loadCompanies = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const userCompanies = await userCompaniesService.listUserCompanies(user.id);
      setCompanies(userCompanies);
    } catch (error) {
      logErrorDetails('UserCompaniesModal.loadCompanies', error);
      toast({
        title: 'Erro ao carregar empresas',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCompany = async () => {
    if (!user || !companyToRemove) return;

    // Check if this is the last company
    if (companies.length === 1) {
      toast({
        title: 'Operação não permitida',
        description: 'O usuário deve estar associado a pelo menos uma empresa.',
        variant: 'destructive',
      });
      setCompanyToRemove(null);
      return;
    }

    try {
      await userCompaniesService.removeUserCompany(user.id, companyToRemove.id);
      toast({
        title: 'Empresa removida',
        description: 'A empresa foi desassociada do usuário com sucesso.',
      });
      await loadCompanies();
    } catch (error) {
      logErrorDetails('UserCompaniesModal.handleRemoveCompany', error);
      toast({
        title: 'Erro ao remover empresa',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setCompanyToRemove(null);
    }
  };

  const handleAddSuccess = async () => {
    await loadCompanies();
    setIsAddModalOpen(false);
  };

  // Definição das colunas do DataGrid
  const columns = useMemo(() => [
    {
      key: 'avatar',
      header: 'Avatar',
      accessorKey: 'avatar_url',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string | null, row: Company) => {
        const initials = row.name.substring(0, 2).toUpperCase();

        return (
          <Avatar className="h-6 w-6 mx-auto">
            <AvatarImage src={value || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      flex: true,
    },
    {
      key: 'profile',
      header: 'Perfil',
      accessorKey: 'user_profile_name',
      minWidth: 120,
      cell: (value: string | null | undefined, row: Company & { user_profile_name?: string }) => {
        return row.user_profile_name || 'Sem perfil';
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      accessorKey: 'id',
      width: 120,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string, row: Company & { user_profile_id?: string }) => {
        return (
          <div className="flex gap-1 justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setEditingCompany(row);
              }}
              title="Editar perfil"
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setCompanyToRemove(row);
              }}
              title="Remover associação"
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ], []);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
          <ModalHeader icon={Building2} title={`Empresas de ${user?.name || ''}`}>
            <Button onClick={() => setIsAddModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Associar Nova Empresa
            </Button>
          </ModalHeader>

          <Stack className="flex-1 min-h-0">
            <div className="flex-1 min-h-0">
              <DataGrid
                id="user-companies-grid"
                data={companies}
                columns={columns}
                pagination={true}
                pageSize={10}
                enableRowSelection={false}
                loading={isLoading}
                emptyMessage="Nenhuma empresa associada. Clique em 'Associar Nova Empresa' para adicionar."
                height="100%"
                searchable={true}
                exportable={false}
                columnConfigurable={true}
              />
            </div>
          </Stack>
        </DialogContent>
      </Dialog>

      <AddUserCompanyModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        user={user}
        existingCompanyIds={companies.map((c) => c.id)}
        onSuccess={handleAddSuccess}
      />

      <EditUserCompanyProfileModal
        open={!!editingCompany}
        onOpenChange={(open) => !open && setEditingCompany(null)}
        user={user}
        company={editingCompany}
        onSuccess={loadCompanies}
      />

      <ConfirmDialog
        open={!!companyToRemove}
        onOpenChange={(open) => !open && setCompanyToRemove(null)}
        title="Remover empresa?"
        description={
          <>
            Tem certeza que deseja remover a associação do usuário com a empresa{' '}
            <span className="font-semibold">{companyToRemove?.name}</span>?
          </>
        }
        onConfirm={handleRemoveCompany}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="destructive"
      />
    </>
  );
}

