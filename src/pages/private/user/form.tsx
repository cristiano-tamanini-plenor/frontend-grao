import { useSearchParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { Form, FormContainer, FormTitle } from '@/Form';
import { useFormUser } from './hooks/useUser';
import { BoxInformacoes } from './components/BoxInformacoes';

export default function UserForm() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('id');

  const useForm = useFormUser(userId);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
      <Form 
        {...useForm}
        identifier={userId}
      >
        <FormContainer>
          <FormTitle 
            title="Informações Básicas" 
            Icon={User}
            subtitle="Dados principais do usuário do sistema"
          />
          <BoxInformacoes />
        </FormContainer>
      </Form>
    </div>
  );
}
