import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, Mail, Key, UserCheck, UserX, Search, UserCog } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import DataGrid from '@/components/DataGrid';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRoleLabel } from '@/lib/rbac/permissions';
import { Stack } from '@/components/Stack';
import { useCompanyUsers } from './hooks/useCompanyUsers';
import { CompanyUser } from './services/company-users.service';
import { InfoDialog } from '@/components/Dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InputText } from '@/components/input/InputText';
import { InputSelect } from '@/components/input/InputSelect';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useToggleUserStatus, useResetUserPassword } from '@/pages/private/user/hooks/useUser';
import { ResetPasswordModal } from '@/pages/private/user/components/ResetPasswordModal';
import { DeactivateUserModal } from '@/pages/private/user/components/DeactivateUserModal';
import { EditUserProfileModal } from './components/EditUserProfileModal';
import { useQueryClient } from '@tanstack/react-query';

export default function CompanyUsers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { canCreate, canEdit } = usePermission('users');
  const { user: currentUser, can: canPermission } = useAuth();
  
  // Verifica permissão específica para resetar senha
  const canResetPassword = canPermission('users.reset_password');
  const [searchQuery, setSearchQuery] = useState('');
  const [resetPasswordUser, setResetPasswordUser] = useState<CompanyUser | null>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [userToDeactivate, setUserToDeactivate] = useState<CompanyUser | null>(null);
  const [editingUserProfile, setEditingUserProfile] = useState<CompanyUser | null>(null);
  const toggleStatusMutation = useToggleUserStatus();
  const resetPasswordMutation = useResetUserPassword();
  const {
    users,
    isLoading,
    currentCompany,
    isInviteModalOpen,
    openInviteModal,
    closeInviteModal,
    formMethods,
    handleInvite,
    isInviting,
    inviteResult,
    userProfiles,
    isLoadingProfiles,
    removeUser,
    isRemovingUser,
  } = useCompanyUsers();

  // Criar mapa de perfis para buscar nomes
  const profileMap = useMemo(() => {
    const map = new Map<string, string>();
    userProfiles.forEach(profile => {
      map.set(profile.id, profile.name);
    });
    return map;
  }, [userProfiles]);

  // Filtrar usuários pela busca
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Colunas do DataGrid
  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Nome',
      accessorKey: 'name',
      minWidth: 300,
      flex: true,
      freezeable: true,
      cell: (value: string, row: CompanyUser) => {
        const initials = row.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={row.avatar_url || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
              <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{value}</span>
                {row.role === 'OWNER' && (
                  <Badge variant="default">Proprietário</Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'E-mail',
      accessorKey: 'email',
      minWidth: 250,
      flex: true,
    },
    {
      key: 'role',
      header: 'Função',
      accessorKey: 'role',
      width: 150,
      cell: (value: string) => (
        <Badge variant="outline">{getRoleLabel(value as any)}</Badge>
      ),
    },
    {
      key: 'user_profile',
      header: 'Perfil de Usuário',
      accessorKey: 'user_profile_id',
      width: 180,
      cell: (value: string | null, row: CompanyUser) => {
        if (!value) return <span className="text-sm text-muted-foreground">Sem perfil</span>;
        const profileName = profileMap.get(value);
        return <span className="text-sm">{profileName || 'Perfil não encontrado'}</span>;
      },
    },
    {
      key: 'invited_by',
      header: 'Pessoa convidou',
      accessorKey: 'invited_by',
      width: 180,
      cell: (value: CompanyUser['invited_by'], row: CompanyUser) => {
        const invitedBy = row.invited_by;
        if (!invitedBy) return '-';
        return <span className="text-sm">{invitedBy.name}</span>;
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      accessorKey: 'id',
      width: 120,
      cellAlign: 'right' as const,
      headerAlign: 'right' as const,
      cell: (value: string | number, row: CompanyUser) => {
        const isCurrentUser = currentUser?.id === row.id;

        return (
          <div className="flex justify-end gap-1">
            {canEdit && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingUserProfile(row);
                  }}
                  title="Editar perfil de usuário"
                  className="h-8 w-8"
                >
                  <UserCog className="h-4 w-4" />
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
                  title="Remover usuário da empresa"
                  disabled={isCurrentUser || isRemovingUser}
                  className="h-8 w-8"
                >
                  <UserX className="h-4 w-4 text-destructive hover:text-destructive" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ], [canEdit, canResetPassword, currentUser?.id, toggleStatusMutation, navigate, profileMap, isRemovingUser]);

  if (!currentCompany) {
    return (
      <Stack>
        <ListHeader
          icon={Users}
          title="Usuários"
          canCreate={false}
        />
        <Alert>
          <AlertTitle>Nenhuma empresa selecionada</AlertTitle>
          <AlertDescription>
            Selecione uma empresa para gerenciar os usuários.
          </AlertDescription>
        </Alert>
      </Stack>
    );
  }

  const roleOptions = [
    { value: 'GUEST', label: 'Convidado' },
    { value: 'MEMBER_LIMITED', label: 'Membro Limitado' },
    { value: 'MEMBER', label: 'Membro' },
  ];

  const userProfileOptions = userProfiles.map((profile) => ({
    value: profile.id,
    label: profile.name,
  }));

  return (
    <Stack>
      {/* Header com título e ações */}
      <ListHeader
        icon={Users}
        title="Usuários"
        canCreate={false}
      >
        {canCreate && (
          <Button onClick={openInviteModal} size="sm" className="bg-green-600 hover:bg-green-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Convidar pessoas
          </Button>
        )}
      </ListHeader>

      {/* Barra de pesquisa */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por e-mail"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filtro de usuários */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Todos os usuários ({filteredUsers.length})
        </span>
      </div>

      {/* DataGrid */}
      <DataGrid
        id="company-users-grid"
        data={filteredUsers}
        columns={columns}
        pagination={true}
        pageSize={20}
        enableRowSelection={false}
        loading={isLoading}
        emptyMessage="Nenhum usuário encontrado. Clique em 'Convidar pessoas' para adicionar."
        height="100%"
        searchable={false}
        exportable={true}
        columnConfigurable={true}
      />

      {/* Modal de Convite */}
      <Dialog open={isInviteModalOpen} onOpenChange={closeInviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar pessoas</DialogTitle>
          </DialogHeader>

          <Form {...formMethods}>
            <form
              onSubmit={formMethods.handleSubmit(async (formData) => {
                await handleInvite(formData);
              })}
              className="space-y-6"
            >
              {/* Campo de Email */}
              <div className="space-y-2">
                <InputText
                  control={formMethods.control}
                  name="emails"
                  label="Convidar por e-mail"
                  placeholder="E-mail, separado por vírgulas ou espaços"
                  required
                  inputProps={{
                    id: 'emails',
                    className: 'w-full',
                  }}
                />
              </div>

              {/* Seleção de Perfil */}
              <div className="space-y-2">
                <InputSelect
                  control={formMethods.control}
                  name="role"
                  label="Adicionar como"
                  placeholder="Selecione o perfil"
                  required
                  options={roleOptions}
                />
                <p className="text-sm text-muted-foreground">
                  {formMethods.watch('role') === 'MEMBER' && 'Pode acessar todos os itens públicos em seu Espaço de trabalho.'}
                  {formMethods.watch('role') === 'MEMBER_LIMITED' && 'Pode acessar apenas itens específicos conforme permissões configuradas.'}
                  {formMethods.watch('role') === 'GUEST' && 'Acesso limitado apenas para visualização de itens compartilhados.'}
                </p>
              </div>

              {/* Seleção de Perfil de Usuário da Empresa */}
              <div className="space-y-2">
                {isLoadingProfiles ? (
                  <div className="text-sm text-muted-foreground">Carregando perfis...</div>
                ) : userProfileOptions.length > 0 ? (
                  <>
                    <InputSelect
                      control={formMethods.control}
                      name="user_profile_id"
                      label="Perfil de usuário da empresa"
                      placeholder="Selecione o perfil (opcional)"
                      options={userProfileOptions}
                    />
                    <p className="text-sm text-muted-foreground">
                      Define quais telas e recursos o usuário terá acesso nesta empresa.
                    </p>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Nenhum perfil de usuário cadastrado para esta empresa.
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeInviteModal}
                  disabled={isInviting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isInviting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isInviting ? 'Enviando...' : 'Mandar convite'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal com resultado do convite */}
      <InfoDialog
        open={!!inviteResult}
        onOpenChange={() => inviteResult && closeInviteModal()}
        title={
          inviteResult?.wasExistingUser ? (
            <>
              <UserCheck className="h-5 w-5 text-green-600" />
              Usuário Adicionado
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 text-blue-600" />
              Convite Enviado
            </>
          )
        }
        description={
          inviteResult?.wasExistingUser
            ? 'O usuário já existia no sistema e foi associado à empresa.'
            : 'Um novo usuário foi criado e associado à empresa.'
        }
        footer={
          <>
            <Button variant="outline" onClick={closeInviteModal}>
              Fechar
            </Button>
            {!inviteResult?.wasExistingUser && inviteResult?.temporaryPassword && (
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(inviteResult.temporaryPassword || '');
                  toast.success('Senha copiada!');
                }}
              >
                Copiar Senha
              </Button>
            )}
          </>
        }
      >
        <div>
          <p className="text-sm font-medium mb-1">Usuário:</p>
          <p className="text-base">{inviteResult?.userName}</p>
        </div>

        {inviteResult?.wasExistingUser ? (
          <Alert>
            <UserCheck className="h-4 w-4" />
            <AlertTitle>Usuário existente</AlertTitle>
            <AlertDescription>
              Este usuário já possuía uma conta no sistema. Ele foi associado à empresa e pode
              usar sua senha atual para fazer login.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <Key className="h-4 w-4" />
            <AlertTitle>Senha Provisória Gerada</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <p className="text-sm">
                  Uma senha provisória foi gerada. O usuário precisará alterá-la no primeiro acesso.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Senha Temporária:
                  </p>
                  <p className="text-lg font-mono font-bold break-all">
                    {inviteResult?.temporaryPassword}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Salve esta senha. Ela não será exibida novamente.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </InfoDialog>

      {/* Modal de Reset de Senha */}
      <ResetPasswordModal
        open={isResetPasswordModalOpen}
        onOpenChange={(open) => {
          setIsResetPasswordModalOpen(open);
          if (!open) {
            setResetPasswordUser(null);
          }
        }}
        onConfirm={async () => {
          if (!resetPasswordUser) return null;
          try {
            const password = await resetPasswordMutation.mutateAsync(String(resetPasswordUser.id));
            return password;
          } catch (error) {
            return null;
          }
        }}
        userName={resetPasswordUser?.name || ''}
      />

      {/* Modal de Confirmação de Remoção */}
      <DeactivateUserModal
        open={isDeactivateModalOpen}
        onOpenChange={(open) => {
          setIsDeactivateModalOpen(open);
          if (!open) {
            setUserToDeactivate(null);
          }
        }}
        onConfirm={async () => {
          if (!userToDeactivate) return;
          try {
            await removeUser(userToDeactivate.id);
          } catch (error) {
            // Error is handled by the mutation
            throw error;
          }
        }}
        userName={userToDeactivate?.name || ''}
      />

      {/* Modal de Edição de Perfil de Usuário */}
      <EditUserProfileModal
        open={!!editingUserProfile}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUserProfile(null);
          }
        }}
        user={editingUserProfile}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['company-users'] });
          setEditingUserProfile(null);
        }}
      />
    </Stack>
  );
}
