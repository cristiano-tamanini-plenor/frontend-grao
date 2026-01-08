import { useSearchParams } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import { Form, FormContainer, FormTitle } from '@/Form';
import { useFormProject } from './hooks/useProject';
import { BoxInformacoes } from './components/BoxInformacoes';

export default function ProjectForm() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');

  const useForm = useFormProject(projectId);

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
      <Form 
        {...useForm}
        identifier={projectId}
      >
        <FormContainer>
          <FormTitle 
            title="Informações do Projeto" 
            Icon={FolderKanban}
            subtitle="Dados principais do projeto"
          />
          <BoxInformacoes />
        </FormContainer>
      </Form>
    </div>
  );
}

