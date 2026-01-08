import { useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import { AutoCompleteUserProfiles } from '@/components/input/AutoComplete/AutoCompleteUserProfiles';
import { Company } from '@/pages/private/company/types';
import { UserWithRole } from '../types';
import { userCompaniesService } from '../services/user-companies.service';

const editProfileSchema = z.object({
  user_profile_id: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface EditUserCompanyProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRole | null;
  company: (Company & { user_profile_id?: string }) | null;
  onSuccess: () => void;
}

export function EditUserCompanyProfileModal({
  open,
  onOpenChange,
  user,
  company,
  onSuccess,
}: EditUserCompanyProfileModalProps) {
  const { toast } = useToast();

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      user_profile_id: '',
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user || !company) return;

    try {
      await userCompaniesService.updateUserCompanyProfile(
        user.id,
        company.id,
        data.user_profile_id || null
      );

      toast({
        title: 'Perfil atualizado',
        description: 'O perfil do usuário na empresa foi atualizado com sucesso.',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      logErrorDetails('EditUserCompanyProfileModal.onSubmit', error);
      toast({
        title: 'Erro ao atualizar perfil',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (open && company) {
      form.reset({
        user_profile_id: company.user_profile_id || '',
      });
    }
  }, [open, company, form]);

  if (!user || !company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Perfil - {company.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <AutoCompleteUserProfiles
              control={form.control}
              name="user_profile_id"
              label="Perfil de Usuário"
              description="Selecione o perfil para esta empresa (deixe em branco para remover)"
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
