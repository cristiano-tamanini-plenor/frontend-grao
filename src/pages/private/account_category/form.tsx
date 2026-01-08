import { useSearchParams } from 'react-router-dom';
import { FolderTree } from 'lucide-react';
import { Form, FormContainer, FormTitle } from '@/Form';
import { useFormAccountCategory } from './hooks/useFormAccountCategory';
import { BoxInformacoesBasicas } from './components/BoxInformacoesBasicas';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

export default function AccountCategoryForm() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('id');
  const { currentCompany } = useCompany();

  const useForm = useFormAccountCategory(categoryId);

  const handleDelete = async () => {
    if (!categoryId) return;
    await useForm.handleDelete?.();
  };

  if (!currentCompany) {
    return (
      <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma empresa selecionada</h3>
            <p className="text-muted-foreground">
              Selecione uma empresa para criar ou editar categorias de conta
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
      <Form
        {...useForm}
        identifier={categoryId}
        handleDelete={handleDelete}
        header={{
          title: categoryId ? 'Editar Categoria de Conta' : 'Nova Categoria de Conta',
          subtitle: categoryId
            ? 'Atualize as informações da categoria de conta'
            : 'Preencha as informações para criar uma nova categoria de conta',
          icon: FolderTree,
          iconSize: 'large',
        }}
      >
        <FormContainer>
          <FormTitle title="Informações Básicas" Icon={FolderTree} />
          <BoxInformacoesBasicas />
        </FormContainer>
      </Form>
    </div>
  );
}

