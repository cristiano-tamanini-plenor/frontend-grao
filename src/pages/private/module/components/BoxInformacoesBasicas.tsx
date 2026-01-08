import { useFormContext } from 'react-hook-form';
import { InputText, InputTextarea } from '@/components/input/InputText';
import { InputSwitch } from '@/components/input';
import { AutoCompleteIcon } from '@/components/input/AutoComplete';
import { InputMultiSelect } from '@/components/input/InputSelect';
import type { ModuleFormSchema } from '../schemas/module.schemas';

export function BoxInformacoesBasicas() {
  const formMethods = useFormContext<ModuleFormSchema>();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Código */}
        <InputText
          control={formMethods.control}
          name="code"
          label="Código"
          placeholder="Ex: USERS"
          description="Código único do módulo (apenas letras maiúsculas e _)"
          required
          inputProps={{
            className: 'uppercase',
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase();
            },
          }}
        />
        
        {/* Nome */}
        <InputText
          control={formMethods.control}
          name="name"
          label="Nome"
          placeholder="Ex: Usuários"
          description="Nome do módulo que será exibido no sistema"
          required
        />
      </div>

      {/* Descrição */}
      <InputTextarea
        control={formMethods.control}
        name="description"
        label="Descrição"
        placeholder="Descreva o propósito deste módulo..."
        description="Breve descrição sobre a funcionalidade do módulo"
        textareaProps={{
          className: 'resize-none',
          rows: 3,
        }}
      />

      {/* Ícone */}
      <AutoCompleteIcon
        control={formMethods.control}
        name="icon_id"
        label="Ícone"
        placeholder="Selecione um ícone..."
        description="Selecione um ícone cadastrado no sistema"
      />

      {/* Ativo */}
      <InputSwitch
        control={formMethods.control}
        name="active"
        label="Módulo Ativo"
        description="Define se o módulo está ativo e disponível no sistema"
      />

      {/* Roles Permitidas */}
      <InputMultiSelect
        control={formMethods.control}
        name="allowed_roles"
        label="Tipos de Usuário com Acesso"
        description="Selecione quais tipos de usuário podem acessar este módulo (OWNER sempre tem acesso)"
        required
        options={[
          { value: 'OWNER', label: 'Proprietário (sempre tem acesso)' },
          { value: 'MEMBER', label: 'Membro' },
          { value: 'MEMBER_LIMITED', label: 'Membro (Limitado)' },
          { value: 'GUEST', label: 'Convidado' },
          { value: 'DEVELOPER', label: 'Desenvolvedor' },
        ]}
      />
    </div>
  );
}

