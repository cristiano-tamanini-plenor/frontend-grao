import { useSearchParams, useNavigate } from 'react-router-dom';
import { ImageIcon } from 'lucide-react';
import { Form, FormContainer, FormTitle } from '@/Form';
import { useFormIcon } from './hooks/useFormIcon';
import { BoxInformacoesBasicas } from './components/BoxInformacoesBasicas';

export default function IconForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const iconId = searchParams.get('id');

  const useForm = useFormIcon(iconId);

  const handleDelete = async () => {
    if (!iconId) return;
    try {
      await useForm.handleDelete?.();
      // Navega para a listagem após exclusão bem-sucedida
      navigate('/icones');
    } catch (error) {
      console.error('Erro ao excluir ícone:', error);
      // Não navega se houver erro
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
      <Form
        {...useForm}
        identifier={iconId}
        handleDelete={handleDelete}
        header={{
          title: iconId ? 'Editar Ícone' : 'Novo Ícone',
          subtitle: iconId
            ? 'Atualize as informações do ícone'
            : 'Preencha as informações para criar um novo ícone',
          icon: ImageIcon,
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

