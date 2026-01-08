import { useFormContext } from 'react-hook-form';
import { InputText, InputTextarea } from '@/components/input/InputText';
import { InputSwitch } from '@/components/input';
import { AutoCompleteIcon } from '@/components/input/AutoComplete';
import { InputSelect } from '@/components/input/InputSelect';
import type { CadastroFormSchema } from '../schemas/cadastro.schemas';

export function BoxInformacoesBasicas() {
  const formMethods = useFormContext<CadastroFormSchema>();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Código */}
        <InputText
          control={formMethods.control}
          name="code"
          label="Código"
          placeholder="Ex: USERS"
          description="Código único do cadastro"
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
          description="Nome do cadastro"
          required
        />

        {/* Tipo */}
        <InputSelect
          control={formMethods.control}
          name="type"
          label="Tipo"
          placeholder="Selecione o tipo"
          description="Tipo do cadastro"
          options={[
            { value: 'page', label: 'Página', code: 'Página' },
            { value: 'crud', label: 'CRUD', code: 'CRUD' },
          ]}
          required
        />
      </div>

      {/* Descrição */}
      <InputTextarea
        control={formMethods.control}
        name="description"
        label="Descrição"
        placeholder="Descreva o propósito deste cadastro..."
        description="Breve descrição sobre a funcionalidade"
        textareaProps={{
          className: 'resize-none',
          rows: 3,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ícone */}
        <AutoCompleteIcon
          control={formMethods.control}
          name="icon_id"
          label="Ícone"
          placeholder="Selecione um ícone..."
          description="Selecione um ícone cadastrado no sistema"
        />

        {/* Rota */}
        <InputText
          control={formMethods.control}
          name="route"
          label="Rota"
          placeholder="Ex: /usuarios"
          description="Caminho da rota no sistema"
        />
      </div>

      {/* Ativo */}
      <InputSwitch
        control={formMethods.control}
        name="active"
        label="Cadastro Ativo"
        description="Define se o cadastro está ativo e disponível"
      />
    </div>
  );
}

