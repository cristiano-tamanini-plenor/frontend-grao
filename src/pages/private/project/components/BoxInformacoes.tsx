import { useFormContext } from 'react-hook-form';
import { InputText, InputTextarea } from '@/components/input/InputText';
import { InputSwitch } from '@/components/input';
import { ImageUpload } from './ImageUpload';
import type { ProjectFormSchema } from '../schemas/project.schemas';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsService } from '../services/projects.service';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

export function BoxInformacoes() {
  const formMethods = useFormContext<ProjectFormSchema>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');
  const isEditMode = !!projectId;
  const { currentCompany } = useCompany();

  // Busca o projeto para mostrar as imagens atuais
  const { data: project } = useQuery({
    queryKey: ['project', currentCompany?.id, projectId],
    queryFn: async () => {
      if (!projectId || !currentCompany?.id) return null;
      return await projectsService.getProjectById(currentCompany.id, projectId);
    },
    enabled: isEditMode && !!currentCompany?.id,
  });

  const handleLogomarcaChange = (file: File | null) => {
    formMethods.setValue('logomarca', file, { shouldDirty: true });
  };

  const handleBannerChange = (file: File | null) => {
    formMethods.setValue('imagem_banner', file, { shouldDirty: true });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <InputText
          control={formMethods.control}
          name="nome"
          label="Nome do Projeto"
          placeholder="Nome do projeto"
          description="Nome do projeto"
          required
        />

        {/* Centro de Custo */}
        <InputText
          control={formMethods.control}
          name="centro_custo_id"
          label="Centro de Custo"
          placeholder="ID do centro de custo"
          description="ID do centro de custo do sistema terceiro"
        />
      </div>

      {/* Descrição */}
      <InputTextarea
        control={formMethods.control}
        name="descricao_detalhada"
        label="Descrição Detalhada"
        placeholder="Descrição completa do projeto"
        description="Descrição detalhada do projeto"
        textareaProps={{
          rows: 4,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data Inicial */}
        <InputText
          control={formMethods.control}
          name="data_inicial"
          label="Data Inicial"
          description="Data de início do projeto"
          required
          inputProps={{
            type: 'date',
          }}
        />

        {/* Data Final */}
        <InputText
          control={formMethods.control}
          name="data_final"
          label="Data Final"
          description="Data de término do projeto (opcional)"
          inputProps={{
            type: 'date',
          }}
        />
      </div>

      {/* Logomarca */}
      <div>
        <ImageUpload
          label="Logomarca"
          description="Imagem da logomarca do projeto (JPEG, PNG ou GIF, máx. 5MB)"
          currentImageUrl={project?.logomarca_url}
          onImageChange={handleLogomarcaChange}
          accept="image/jpeg,image/png,image/gif"
          maxSizeMB={5}
        />
      </div>

      {/* Banner */}
      <div>
        <ImageUpload
          label="Imagem Banner"
          description="Imagem do banner do projeto (JPEG, PNG ou GIF, máx. 5MB)"
          currentImageUrl={project?.imagem_banner_url}
          onImageChange={handleBannerChange}
          accept="image/jpeg,image/png,image/gif"
          maxSizeMB={5}
        />
      </div>

      {/* Status */}
      {isEditMode && (
        <InputSwitch
          control={formMethods.control}
          name="status"
          label="Projeto Ativo"
          description="Define se o projeto está ativo"
        />
      )}
    </div>
  );
}

