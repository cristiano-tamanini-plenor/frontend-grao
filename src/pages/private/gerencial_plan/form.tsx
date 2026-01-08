import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Form, FormContainer, FormTitle } from '@/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { gerencialPlanFormSchema, type GerencialPlanFormSchema } from './schemas/gerencial-plan.schemas';
import {
  useGerencialPlan,
  useCreateGerencialPlan,
  useUpdateGerencialPlan,
  useDeleteGerencialPlan,
} from './hooks/useGerencialPlan';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { InputText } from '@/components/input/InputText';
import { InputSelect } from '@/components/input/InputSelect';
import { InputInteger } from '@/components/input/InputText/InputInteger';
import { AutoCompleteAccountCategory } from '@/components/input/AutoComplete';
import { GerencialPlanType } from './types';
import { useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { AddButton } from '@/components/crud/ActionButtons';
import { useAccountCategories } from '@/pages/private/account_category/hooks/useAccountCategory';

export default function GerencialPlanForm() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const planId = searchParams.get('id');
  const isEditMode = !!planId;
  const { currentCompany } = useCompany();
  const companyIdNumber = currentCompany?.id ? Number(currentCompany.id) : undefined;

  const { data: plan, isLoading: isLoadingPlan } = useGerencialPlan(
    companyIdNumber,
    planId ? Number(planId) : undefined
  );
  const createMutation = useCreateGerencialPlan();
  const updateMutation = useUpdateGerencialPlan();
  const deleteMutation = useDeleteGerencialPlan();

  const formMethods = useForm<GerencialPlanFormSchema>({
    resolver: zodResolver(gerencialPlanFormSchema),
    defaultValues: {
      sequence: 1,
      type: GerencialPlanType.CATEGORY,
      account_category_id: null,
      description: null,
    },
  });

  const type = useWatch({ control: formMethods.control, name: 'type' });
  const accountCategoryId = useWatch({ control: formMethods.control, name: 'account_category_id' });
  
  // Busca a categoria de conta selecionada para preencher a descrição automaticamente
  const { data: accountCategories = [] } = useAccountCategories(companyIdNumber);
  const selectedAccountCategory = accountCategories.find(
    (cat) => cat.id === (typeof accountCategoryId === 'string' ? Number(accountCategoryId) : accountCategoryId)
  );

  // Limpa descrição quando muda de RESULT para CATEGORY
  useEffect(() => {
    if (type === GerencialPlanType.CATEGORY) {
      formMethods.setValue('description', null, { shouldValidate: false });
    }
  }, [type, formMethods]);

  // Preenche descrição automaticamente quando seleciona uma categoria (tipo CATEGORY)
  useEffect(() => {
    if (type === GerencialPlanType.CATEGORY && selectedAccountCategory) {
      // Usa a descrição da categoria de conta como descrição padrão
      const categoryDescription = selectedAccountCategory.description || selectedAccountCategory.structure || '';
      formMethods.setValue('description', categoryDescription, { shouldValidate: false });
    }
  }, [type, selectedAccountCategory, formMethods]);

  // Carrega dados quando está em modo edição
  useEffect(() => {
    if (plan && isEditMode) {
      formMethods.reset({
        sequence: plan.sequence,
        type: plan.type,
        account_category_id: plan.account_category_id,
        description: plan.description,
      });
    }
  }, [plan, isEditMode, formMethods]);

  const handleSubmit = async (data: GerencialPlanFormSchema) => {
    if (!companyIdNumber) {
      toast.error('Nenhuma empresa selecionada');
      return;
    }

    // Prepara os dados para envio
    const submitData: any = {
      sequence: data.sequence,
      type: data.type,
      account_category_id: data.account_category_id ?? null,
    };

    // Description é sempre obrigatório no backend
    if (data.type === GerencialPlanType.RESULT) {
      // Para tipo RESULT, usa a descrição do formulário
      submitData.description = data.description || '';
    } else {
      // Para tipo CATEGORY, usa a descrição da categoria de conta selecionada
      const category = accountCategories.find(
        (cat) => cat.id === (typeof data.account_category_id === 'string' ? Number(data.account_category_id) : data.account_category_id)
      );
      submitData.description = category?.description || category?.structure || '';
    }

    try {
      if (isEditMode && planId) {
        await updateMutation.mutateAsync({
          companyId: companyIdNumber,
          id: Number(planId),
          data: submitData,
        });
        // Mantém na mesma página após atualizar
        formMethods.reset({ ...data, description: submitData.description }, { keepDefaultValues: false });
      } else {
        const created = await createMutation.mutateAsync({
          companyId: companyIdNumber,
          data: submitData,
        });
        // Navega para a página de edição após criar
        if (created?.id) {
          navigate(`/plano-gerencial/form?id=${created.id}`, { replace: true });
        }
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDelete = async () => {
    if (!planId || !companyIdNumber) return;

    try {
      await deleteMutation.mutateAsync({
        companyId: companyIdNumber,
        id: Number(planId),
      });
      navigate('/plano-gerencial', { replace: true });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  if (!currentCompany) {
    return (
      <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma empresa selecionada</h3>
            <p className="text-muted-foreground">
              Selecione uma empresa para criar ou editar linhas do plano gerencial
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0">
      <Form
        formMethods={formMethods}
        handleSubmit={formMethods.handleSubmit(handleSubmit)}
        isLoadingUpdate={updateMutation.isPending}
        isLoadingCreate={createMutation.isPending}
        isLoadingDelete={deleteMutation.isPending}
        isLoadingForm={isLoadingPlan}
        handleDelete={isEditMode ? handleDelete : undefined}
        identifier={planId || undefined}
        onUpdate={async (e) => {
          e.preventDefault();
          await formMethods.handleSubmit(handleSubmit)();
        }}
        disabled={{
          save: false,
          update: false,
          remove: false,
        }}
        ExtraActions={
          isEditMode ? (
            <AddButton
              onClick={() => navigate('/plano-gerencial/form', { replace: true })}
              type="button"
              iconOnly={true}
              tooltip="Criar nova linha"
            />
          ) : undefined
        }
        header={{
          title: isEditMode ? 'Editar Linha do Plano Gerencial' : 'Nova Linha do Plano Gerencial',
          subtitle: isEditMode
            ? 'Atualize as informações da linha do plano gerencial'
            : 'Preencha as informações para criar uma nova linha do plano gerencial',
          icon: FileText,
          iconSize: 'large',
        }}
      >
        <FormContainer>
          <FormTitle title="Informações Básicas" Icon={FileText} />
          <div className="grid grid-cols-12 gap-4">
            {/* Sequência */}
            <div className="col-span-12 md:col-span-3">
              <InputInteger
                control={formMethods.control}
                name="sequence"
                label="Sequência"
                placeholder="Digite a sequência"
                description="Ordem de exibição da linha no plano"
                required
              />
            </div>

            {/* Tipo */}
            <div className="col-span-12 md:col-span-3">
              <InputSelect
                control={formMethods.control}
                name="type"
                label="Tipo"
                placeholder="Selecione o tipo"
                description="Tipo da linha: Categoria ou Resultado"
                options={[
                  { value: GerencialPlanType.CATEGORY, label: 'Categoria', code: 'Categoria' },
                  { value: GerencialPlanType.RESULT, label: 'Resultado', code: 'Resultado' },
                ]}
                required
                disabled={isEditMode}
              />
            </div>

            {/* Descrição - Só aparece para tipo 'result' */}
            {type === GerencialPlanType.RESULT && (
              <div className="col-span-12 md:col-span-6">
                <InputText
                  control={formMethods.control}
                  name="description"
                  label="Descrição"
                  placeholder="Digite a descrição (ex: '(=) Receita Líquida')"
                  description="Texto descritivo da linha de resultado (obrigatório)"
                  required
                />
              </div>
            )}

            {/* Categoria de Conta - Só aparece para tipo 'category' */}
            {type === GerencialPlanType.CATEGORY && (
              <div className="col-span-12 md:col-span-6">
                <AutoCompleteAccountCategory
                  control={formMethods.control}
                  name="account_category_id"
                  label="Categoria de Conta"
                  placeholder="Selecione uma categoria de conta..."
                  description="Categoria de conta associada a esta linha (apenas primeiro nível)"
                  required={true}
                  filterByLevel="primary"
                  companyId={companyIdNumber}
                />
              </div>
            )}

            {/* Aviso para tipo 'result' */}
            {type === GerencialPlanType.RESULT && (
              <div className="col-span-12">
                <div className="rounded-md bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Linha do tipo Resultado:</strong> Após salvar, você poderá adicionar as categorias que compõem este resultado na página de edição.
                  </p>
                </div>
              </div>
            )}
          </div>
        </FormContainer>
      </Form>
    </div>
  );
}

