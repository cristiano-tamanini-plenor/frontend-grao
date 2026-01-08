import { useNavigate } from 'react-router-dom';
import { Users as UsersIcon } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import DataGrid from '@/components/DataGrid';
import { useMemo, useState } from 'react';
import { useUsers, useToggleUserStatus, useResetUserPassword } from './hooks/useUser';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { getRoleLabel } from '@/lib/rbac/permissions';
import { UserWithRole } from './types';
import { UserCompaniesModal } from './components/UserCompaniesModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { DeactivateUserModal } from './components/DeactivateUserModal';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { Pencil, Key, UserX, Building2 } from 'lucide-react';
import { Stack } from '@/components/Stack';

export default function Users() {
  const navigate = useNavigate();
  const { canCreate, canEdit } = usePermission('users');
  const { can: canPermission } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const { user: currentUser } = useAuth();
  const toggleStatusMutation = useToggleUserStatus();
  const resetPasswordMutation = useResetUserPassword();
  
  // Verifica permissão específica para resetar senha
  const canResetPassword = canPermission('users.reset_password');

  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isCompaniesModalOpen, setIsCompaniesModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserWithRole | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<UserWithRole | null>(null);

  // Definição das colunas
  const columns = useMemo(() => [
    {
      key: 'avatar',
      header: 'Avatar',
      accessorKey: 'avatar_url',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: string | null, row: UserWithRole) => {
        const initials = row.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

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
      minWidth: 250,
      flex: true,
    },
    {
      key: 'email',
      header: 'Email',
      accessorKey: 'email',
      minWidth: 250,
      flex: true,
    },
    {
      key: 'role',
      header: 'Perfil',
      accessorKey: 'role',
      width: 150,
      cell: (value: string) => {
        const getRoleBadgeVariant = (role: string) => {
          switch (role) {
            case 'OWNER':
              return 'default';
            case 'MEMBER':
              return 'secondary';
            case 'MEMBER_LIMITED':
              return 'outline';
            default:
              return 'outline';
          }
        };
        return (
          <Badge variant={getRoleBadgeVariant(value)}>
            {getRoleLabel(value as any)}
          </Badge>
        );
      },
    },
    {
      key: 'is_active',
      header: 'Status',
      accessorKey: 'is_active',
      width: 120,
      cell: (value: boolean) => {
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Ativo' : 'Inativo'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      accessorKey: 'id',
      width: 200,
      cellAlign: 'right' as const,
      headerAlign: 'right' as const,
      cell: (value: string, row: UserWithRole) => {
        const isCurrentUser = currentUser?.id === row.id;

        return (
          <div className="flex justify-end gap-1">
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedUser(row);
                    setIsCompaniesModalOpen(true);
                  }}
                  title="Gerenciar empresas"
                  className="h-8 w-8"
                >
                  <Building2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/usuarios-app/form?id=${row.id}`)}
                  title="Editar usuário"
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                {canResetPassword && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setResetPasswordUser(row);
                      setIsResetPasswordModalOpen(true);
                    }}
                    title="Resetar senha"
                    className="h-8 w-8"
                  >
                    <Key className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setUserToDeactivate(row);
                    setIsDeactivateModalOpen(true);
                  }}
                  title="Inativar usuário"
                  disabled={isCurrentUser || toggleStatusMutation.isPending}
                  className="h-8 w-8"
                >
                  <UserX className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ], [canEdit, canResetPassword, currentUser?.id, toggleStatusMutation, navigate]);

  const handleRowDoubleClick = (row: any, id: any) => {
    if (canEdit) {
      navigate(`/usuarios-app/form?id=${id}`);
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordUser) return null;
    try {
      const password = await resetPasswordMutation.mutateAsync(resetPasswordUser.id);
      return password;
    } catch (error) {
      return null;
    }
  };

  const handleDeactivateUser = async () => {
    if (!userToDeactivate) return;
    try {
      await toggleStatusMutation.mutateAsync({ id: userToDeactivate.id, isActive: false });
    } catch (error) {
      // Error is handled by the mutation
      throw error;
    }
  };

  return (
    <Stack>
      <ListHeader
        icon={UsersIcon}
        title="Usuários do Sistema"
        canCreate={canCreate}
      />

      <DataGrid
        id="users-grid"
        data={users}
        columns={columns}
        pagination={true}
        pageSize={20}
        enableRowSelection={false}
        loading={isLoading}
        emptyMessage="Nenhum usuário encontrado"
        height="100%"
        searchable={true}
        columnConfigurable={true}
        onRowDoubleClick={handleRowDoubleClick}
      />

      {/* Modal de Empresas */}
      <UserCompaniesModal
        open={isCompaniesModalOpen}
        onOpenChange={setIsCompaniesModalOpen}
        user={selectedUser}
      />

      {/* Modal de Reset de Senha */}
      <ResetPasswordModal
        open={isResetPasswordModalOpen}
        onOpenChange={(open) => {
          setIsResetPasswordModalOpen(open);
          if (!open) {
            setResetPasswordUser(null);
          }
        }}
        onConfirm={handleResetPassword}
        userName={resetPasswordUser?.name || ''}
      />

      {/* Modal de Confirmação de Inativação */}
      <DeactivateUserModal
        open={isDeactivateModalOpen}
        onOpenChange={(open) => {
          setIsDeactivateModalOpen(open);
          if (!open) {
            setUserToDeactivate(null);
          }
        }}
        onConfirm={handleDeactivateUser}
        userName={userToDeactivate?.name || ''}
      />
    </Stack>
  );
}
