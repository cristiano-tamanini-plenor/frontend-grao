import { useFormContext } from 'react-hook-form';
import { InputText, InputTelefone } from '@/components/input/InputText';
import { InputSelect } from '@/components/input/InputSelect';
import { AvatarUpload } from './AvatarUpload';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { getAllRoles } from '@/lib/rbac/permissions';
import type { UserFormSchema } from '../schemas/user.schemas';
import { useSearchParams } from 'react-router-dom';


export function BoxInformacoes() {
  const formMethods = useFormContext<UserFormSchema>();
  const { role: currentUserRole } = useAuth();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');
  const isEditMode = !!userId;

  const roles = getAllRoles();
  const availableRoles = (currentUserRole === 'MEMBER'
    ? roles.filter(r => r.value !== 'OWNER')
    : roles
  ).map(role => ({
    value: role.value,
    label: role.label,
    code: role.label, // Usa o label como code para exibição no select
  }));

  const watchedUser = formMethods.watch();
  const avatarUrl = formMethods.watch('avatar_url');
  const isEditAndOwner = isEditMode && watchedUser.role === 'OWNER' && currentUserRole === 'MEMBER';

  const handleAvatarChange = (url: string) => {
    formMethods.setValue('avatar_url', url, { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
        {/* Avatar */}
        {isEditMode && userId && (
          <div className="flex justify-center pb-4">
            <AvatarUpload
              currentAvatarUrl={avatarUrl || undefined}
              userId={userId}
              onAvatarChange={handleAvatarChange}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nome */}
          <InputText
            control={formMethods.control}
            name="name"
            label="Nome"
            placeholder="Nome completo"
            description="Nome completo do usuário"
            required
          />

          {/* Email */}
          <InputText
            control={formMethods.control}
            name="email"
            label="Email"
            placeholder="email@exemplo.com"
            description="Email do usuário (não pode ser alterado)"
            required
            inputProps={{
              disabled: isEditMode,
            }}
          />
        </div>

        {/* Perfil */}
        <InputSelect
          control={formMethods.control}
          name="role"
          label="Perfil"
          placeholder="Selecione o perfil"
          description="Perfil de acesso do usuário no sistema"
          required
          options={availableRoles}
          disabled={isEditAndOwner}
        />
        {isEditAndOwner && (
          <p className="text-xs text-muted-foreground">
            Você não pode alterar o perfil de um OWNER
          </p>
        )}

        {/* Telefone */}
        <InputTelefone
          control={formMethods.control}
          name="phone_e164"
          label="Telefone"
          placeholder="(11) 91234-5678"
          description="Telefone no formato internacional (+55...)"
          required
        />
    </div>
  );
}

