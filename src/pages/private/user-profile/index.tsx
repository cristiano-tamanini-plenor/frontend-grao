import React, { useState, useMemo, useEffect } from 'react';
import { Users2, Save, Users, FileText, Trash2 } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ModulePermission, PermissionAction } from './types';
import { PermissionsTree } from './components/PermissionsTree';
import { UsersModal } from './components/UsersModal';
import { PagesModal } from './components/PagesModal';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { usePlanStructure } from '@/pages/private/company/hooks/usePlanStructure';
import { planToPermissionsStructure } from './utils/plan-to-permissions';
import { apiToPermissionsStructure } from './utils/api-to-permissions';
import { Stack } from '@/components/Stack';
import { useUserProfiles, useUserProfile, useSaveUserProfile, useDeleteUserProfile } from './hooks/useUserProfile';
import { ConfirmDialog } from '@/components/Dialog';

interface ProfileListItem {
  id: string;
  name: string;
  totalUsers: number;
}

export default function UserProfile() {
  const { currentCompany } = useCompany();
  const { data: planStructure, isLoading: isLoadingPlan } = usePlanStructure(currentCompany?.id || null);

  // State
  const [profileId, setProfileId] = useState<string | null>(null);

  // Queries
  const { data: profiles = [], isLoading: isLoadingProfiles } = useUserProfiles();
  const { data: profileData, isLoading: isLoadingProfile } = useUserProfile(profileId);
  const [profileName, setProfileName] = useState('');
  const [modulesPermissions, setModulesPermissions] = useState<ModulePermission[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isPagesModalOpen, setIsPagesModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Mutations
  const saveMutation = useSaveUserProfile();
  const deleteMutation = useDeleteUserProfile();

  // Carregar permissões quando o plano ou perfil mudar
  useEffect(() => {
    if (!planStructure) return;

    if (profileData && profileData.profile) {
      // Carregar perfil existente - converter dados da API para formato do frontend
      setProfileName(profileData.profile.name);
      setSelectedUserIds(profileData.userIds || []);

      const convertedPermissions = apiToPermissionsStructure(
        planStructure,
        profileData.modulePermissions,
        profileData.cadastroPermissions
      );
      setModulesPermissions(convertedPermissions);
    } else if (profileId === null) {
      // Novo perfil - usar estrutura base do plano (apenas se profileId for explicitamente null)
      setProfileName('');
      setSelectedUserIds([]);
      const convertedPermissions = planToPermissionsStructure(planStructure);
      setModulesPermissions(convertedPermissions);
    }
  }, [planStructure, profileData, profileId]);

  const handleProfileSelect = (id: string | null) => {
    setProfileId(id);
  };

  const handleModuleVisibilityChange = (moduleId: string, visible: boolean) => {
    setModulesPermissions(prev =>
      prev.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            visible,
          };
        }
        return module;
      })
    );
  };

  const handlePermissionChange = (
    moduleId: string,
    cadastroId: string,
    action: PermissionAction,
    checked: boolean
  ) => {
    setModulesPermissions(prev =>
      prev.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            cadastros: module.cadastros.map(cadastro => {
              if (cadastro.id === cadastroId) {
                return {
                  ...cadastro,
                  permissions: {
                    ...cadastro.permissions,
                    [action]: checked,
                  },
                };
              }
              return cadastro;
            }),
          };
        }
        return module;
      })
    );
  };

  const handleMultiplePermissionsChange = (
    moduleId: string,
    updates: Array<{ cadastroId: string; action: PermissionAction; checked: boolean }>
  ) => {
    setModulesPermissions(prev =>
      prev.map(module => {
        if (module.id === moduleId) {
          return {
            ...module,
            cadastros: module.cadastros.map(cadastro => {
              const cadastroUpdates = updates.filter(u => u.cadastroId === cadastro.id);
              if (cadastroUpdates.length > 0) {
                const newPermissions = { ...cadastro.permissions };
                cadastroUpdates.forEach(({ action, checked }) => {
                  newPermissions[action] = checked;
                });
                return {
                  ...cadastro,
                  permissions: newPermissions,
                };
              }
              return cadastro;
            }),
          };
        }
        return module;
      })
    );
  };

  const handleUserToggle = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    }
  };

  const handleSave = async () => {
    if (!profileName.trim()) {
      return;
    }

    if (!currentCompany?.id || !planStructure) {
      return;
    }

    const result = await saveMutation.mutateAsync({
      id: profileId || undefined,
      name: profileName,
      company_id: currentCompany.id,
      plan_id: planStructure.planId,
      modulesPermissions,
      userIds: selectedUserIds,
    });

    // Selecionar o perfil salvo
    if (!profileId && result?.profileId) {
      setProfileId(result.profileId);
    }
  };

  const handleNewProfile = () => {
    setProfileId(null);
    setProfileName('');
    if (planStructure) {
      const convertedPermissions = planToPermissionsStructure(planStructure);
      setModulesPermissions(convertedPermissions);
    }
    setSelectedUserIds([]);
  };

  const handleDelete = async () => {
    if (!profileId) return;
    await deleteMutation.mutateAsync(profileId);
    setProfileId(null);
    setShowDeleteDialog(false);
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Nome',
        accessorKey: 'name',
        flex: true,
      },
      {
        key: 'totalUsers',
        header: 'T. Usuários',
        accessorKey: 'totalUsers',
        width: 100,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (value: number) => value || 0,
      },
    ],
    []
  );

  const handleRowClick = (row: ProfileListItem) => {
    handleProfileSelect(row.id);
  };

  if (isLoadingPlan || isLoadingProfiles) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!planStructure) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Nenhum plano encontrado. Configure um plano primeiro.</p>
        </div>
      </div>
    );
  }

  return (
    <Stack className="flex-1 px-0 flex-col h-full min-w-0">
      {/* ListHeader compartilhado para ambos os boxes */}
      <ListHeader icon={Users2} title="Perfis de Usuário" canCreate={true} onAdd={handleNewProfile} />

      <Stack className="flex-1 flex-row gap-6 min-h-0 items-start">
        {/* Lista à esquerda - Largura fixa menor */}
        <div className="w-[400px] flex-shrink-0 flex flex-col h-full overflow-hidden">
          <DataGrid
            id="profiles-grid"
            pagination={false}
            data={profiles}
            columns={columns}
            loading={isLoadingProfiles}
            emptyMessage="Nenhum perfil encontrado"
            height="100%"
            columnConfigurable={true}
            selectedRowId={profileId}
            onRowClick={handleRowClick}
          />
        </div>

        {/* Configuração à direita - Ocupa o espaço restante */}
        <Card className="h-full flex flex-col overflow-hidden p-2 w-full">
          <CardContent className="pt-6 space-y-6 flex flex-col flex-1 min-h-0 p-0">
            <div className="px-6 space-y-6 flex flex-col flex-1 min-h-0">
              {/* Nome do perfil */}
              <div className="flex items-end gap-4 flex-shrink-0">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="profile-name">Nome *</Label>
                  <Input
                    id="profile-name"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Digite o nome do perfil"
                    className="border-primary/50 focus-visible:ring-primary"
                    disabled={isLoadingProfile}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsUsersModalOpen(true)}
                  className="gap-2"
                  disabled={isLoadingProfile}
                >
                  <Users className="h-4 w-4" />
                  Usuários ({selectedUserIds.length})
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsPagesModalOpen(true)}
                        disabled={isLoadingProfile}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Páginas</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {profileId && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={deleteMutation.isPending || isLoadingProfile}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Excluir perfil</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button
                  onClick={handleSave}
                  className="gap-2"
                  disabled={saveMutation.isPending || isLoadingProfile || !profileName.trim()}
                >
                  <Save className="h-4 w-4" />
                  {saveMutation.isPending ? 'SALVANDO...' : 'SALVAR'}
                </Button>
              </div>

              {/* Permissões */}
              {isLoadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Carregando permissões...</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col -mx-6 px-6">
                  <PermissionsTree
                    modules={modulesPermissions}
                    onModuleVisibilityChange={handleModuleVisibilityChange}
                    onPermissionChange={handlePermissionChange}
                    onMultiplePermissionsChange={handleMultiplePermissionsChange}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Stack>

      {/* Modal de Usuários */}
      <UsersModal
        open={isUsersModalOpen}
        onOpenChange={setIsUsersModalOpen}
        selectedUserIds={selectedUserIds}
        onUserToggle={handleUserToggle}
      />

      {/* Modal de Páginas */}
      <PagesModal
        open={isPagesModalOpen}
        onOpenChange={setIsPagesModalOpen}
        modules={modulesPermissions}
        onPermissionChange={handlePermissionChange}
      />

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir perfil?"
        description={
          <>
            Tem certeza que deseja excluir o perfil <span className="font-semibold">{profileName}</span>? Esta ação
            não pode ser desfeita e todos os usuários associados perderão as permissões deste perfil.
          </>
        }
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </Stack>
  );
}
