import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Form, FormContainer, FormTitle } from '@/Form';
import { useFormCadastro } from './hooks/useFormCadastro';
import { BoxInformacoesBasicas } from './components/BoxInformacoesBasicas';

export default function CadastroForm() {
  const [searchParams] = useSearchParams();
  const cadastroId = searchParams.get('id');

  const useForm = useFormCadastro(cadastroId);

  const handleDelete = async () => {
    if (!cadastroId) return;
    await useForm.handleDelete?.();
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
      <Form
        {...useForm}
        identifier={cadastroId}
        handleDelete={handleDelete}
        header={{
          title: cadastroId ? 'Editar Cadastro' : 'Novo Cadastro',
          subtitle: cadastroId
            ? 'Atualize as informações do cadastro'
            : 'Preencha as informações para criar um novo cadastro',
          icon: FileText,
          iconSize: 'large',
        }}
      >
        <FormContainer>
          <BoxInformacoesBasicas />
        </FormContainer>
      </Form>
    </div>
  );
}
