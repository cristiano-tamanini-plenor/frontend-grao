import { useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Form, FormContainer, FormTitle } from '@/Form';
import { useFormModule } from './hooks/useModule';
import { BoxInformacoesBasicas } from './components/BoxInformacoesBasicas';

export default function ModuleForm() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('id');

  const useForm = useFormModule(moduleId);

  const handleDelete = async () => {
    if (!moduleId) return;
    await useForm.handleDelete(moduleId);
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
      <Form
        {...useForm}
        identifier={moduleId}
        handleDelete={handleDelete}
        header={{
          title: moduleId ? 'Editar Módulo' : 'Novo Módulo',
          subtitle: moduleId
            ? 'Atualize as informações do módulo'
            : 'Preencha as informações para criar um novo módulo',
          icon: Package,
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
