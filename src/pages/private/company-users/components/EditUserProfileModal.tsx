import { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import { InputSelect } from '@/components/input/InputSelect';
import { CompanyUser } from '../services/company-users.service';
import { userCompaniesService } from '@/pages/private/user/services/user-companies.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { userProfilesService } from '@/pages/private/user-profile/services/user-profiles.service';
import { useQuery } from '@tanstack/react-query';

const editProfileSchema = z.object({
  user_profile_id: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditUserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: CompanyUser | null;
  onSuccess: () => void;
}

export function EditUserProfileModal({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserProfileModalProps) {
  const { toast } = useToast();
  const { currentCompany } = useCompany();

  // Buscar perfis disponíveis da empresa
  const { data: profiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['user-profiles', currentCompany?.id],
    queryFn: () => {
      if (!currentCompany?.id) return Promise.resolve([]);
      return userProfilesService.getProfilesByCompany(currentCompany.id);
    },
    enabled: !!currentCompany?.id && open,
  });

  // Valor especial para representar "sem perfil"
  const NONE_VALUE = '__none__';

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      user_profile_id: NONE_VALUE,
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user || !currentCompany) return;

    try {
      // Converter o valor especial NONE_VALUE para null
      const profileId = data.user_profile_id && data.user_profile_id !== NONE_VALUE
        ? data.user_profile_id 
        : null;
      
      await userCompaniesService.updateUserCompanyProfile(
        String(user.id),
        String(currentCompany.id),
        profileId
      );

      toast({
        title: 'Perfil atualizado',
        description: 'O perfil do usuário na empresa foi atualizado com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      logErrorDetails('EditUserProfileModal.onSubmit', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (open && user) {
      const currentProfileId = user.user_profile_id || NONE_VALUE;
      form.reset({
        user_profile_id: currentProfileId,
      });
    } else if (!open) {
      // Reset form quando fechar
      form.reset({
        user_profile_id: NONE_VALUE,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  if (!user || !currentCompany) return null;

  // Preparar opções com "Sem perfil"
  const profileOptions = [
    { value: NONE_VALUE, label: 'Sem perfil' },
    ...profiles.map((profile) => ({
      value: profile.id,
      label: profile.name,
    })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil de Usuário</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Usuário: <span className="font-medium">{user.name}</span>
              </p>
            </div>

            <div className="space-y-2">
              <InputSelect
                control={form.control}
                name="user_profile_id"
                label="Perfil de Usuário"
                description="Selecione o perfil para este usuário na empresa atual (escolha 'Sem perfil' para remover)"
                placeholder={isLoadingProfiles ? 'Carregando perfis...' : 'Selecione o perfil'}
                options={profileOptions}
                disabled={isLoadingProfiles || form.formState.isSubmitting}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || isLoadingProfiles}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

