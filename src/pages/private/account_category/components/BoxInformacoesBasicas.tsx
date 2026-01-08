import { useFormContext, useWatch } from 'react-hook-form';
import { InputText, InputTextarea } from '@/components/input/InputText';
import { InputSwitch } from '@/components/input';
import { InputSelect } from '@/components/input/InputSelect';
import { AutoCompleteAccountCategory } from '@/components/input/AutoComplete';
import { MarveeCategoriesList } from './MarveeCategoriesList';
import type { AccountCategoryFormSchema } from '../schemas/account-category.schemas';
import { AccountCategoryLevel } from '../types';
import { useSearchParams } from 'react-router-dom';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { useMemo, useEffect, useRef } from 'react';
import { applyStructureMask, formatWithLeadingZero } from '../utils/structure-mask';
import { useAccountCategories } from '../hooks/useAccountCategory';

export function BoxInformacoesBasicas() {
  const [searchParams] = useSearchParams();
  const accountCategoryId = searchParams.get('id');
  const isEditMode = !!accountCategoryId; // Se tem ID, está em modo edição
  const formMethods = useFormContext<AccountCategoryFormSchema>();
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id;
  const companyIdNumber = companyId ? Number(companyId) : undefined;

  // Observa o nível selecionado
  const level = useWatch({ control: formMethods.control, name: 'level' });
  const accountCategoryFatherId = useWatch({ control: formMethods.control, name: 'account_category_father_id' });
  
  // Para nível Tertiary, observa a categoria primária selecionada (filtro)
  const primaryCategoryFilterId = useWatch({ control: formMethods.control, name: 'primary_category_filter_id' });

  // Busca todas as categorias para sugerir próxima no nível Primary
  const { data: allCategories = [] } = useAccountCategories(companyIdNumber);

  // Busca a categoria pai selecionada
  const selectedFatherCategory = useMemo(() => {
    if (!accountCategoryFatherId || !allCategories.length) return null;
    return allCategories.find((cat) => cat.id === accountCategoryFatherId) || null;
  }, [accountCategoryFatherId, allCategories]);

  // Calcula próxima estrutura sugerida
  const suggestedStructure = useMemo(() => {
    if (!companyIdNumber) return null;

    // Para nível Primary
    if (level === AccountCategoryLevel.PRIMARY) {
      // Filtra apenas categorias primárias
      const primaryCategories = allCategories.filter(
        (cat) => cat.level === AccountCategoryLevel.PRIMARY && cat.status
      );

      if (primaryCategories.length === 0) {
        return formatWithLeadingZero(1);
      }

      // Extrai números das estruturas existentes
      const structureNumbers = primaryCategories
        .map((cat) => {
          if (!cat.structure) return 0;
          const match = cat.structure.match(/^(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((num) => num > 0);

      if (structureNumbers.length === 0) {
        return formatWithLeadingZero(1);
      }

      // Encontra o próximo número disponível
      const maxNumber = Math.max(...structureNumbers);
      const nextNumber = maxNumber + 1;
      return formatWithLeadingZero(nextNumber);
    }

    // Para nível Secondary - precisa ter categoria pai selecionada
    if (level === AccountCategoryLevel.SECONDARY && selectedFatherCategory) {
      const fatherStructure = selectedFatherCategory.structure;
      if (!fatherStructure) return null;

      // Extrai o número do pai (primeira parte)
      const fatherMatch = fatherStructure.match(/^(\d+)/);
      if (!fatherMatch) return null;
      const fatherNumber = fatherMatch[1];

      // Busca todas as categorias Secondary que são filhas deste pai
      const secondaryChildren = allCategories.filter(
        (cat) =>
          cat.level === AccountCategoryLevel.SECONDARY &&
          cat.status &&
          cat.account_category_father_id === selectedFatherCategory.id
      );

      if (secondaryChildren.length === 0) {
        // Se não tem filhos, sugere o primeiro (01)
        return `${fatherNumber}.${formatWithLeadingZero(1)}`;
      }

      // Extrai números da segunda parte da estrutura (após o "xx.")
      const childNumbers = secondaryChildren
        .map((cat) => {
          if (!cat.structure) return 0;
          // Procura padrão "xx.XX" onde XX é o número do filho
          const match = cat.structure.match(/^\d+\.(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((num) => num > 0);

      if (childNumbers.length === 0) {
        return `${fatherNumber}.${formatWithLeadingZero(1)}`;
      }

      // Encontra o próximo número disponível
      const maxNumber = Math.max(...childNumbers);
      const nextNumber = maxNumber + 1;
      return `${fatherNumber}.${formatWithLeadingZero(nextNumber)}`;
    }

    // Para nível Tertiary - precisa ter categoria pai selecionada
    if (level === AccountCategoryLevel.TERTIARY && selectedFatherCategory) {
      const fatherStructure = selectedFatherCategory.structure;
      if (!fatherStructure) return null;

      // Extrai a estrutura do pai (formato "xx.xx")
      const fatherMatch = fatherStructure.match(/^(\d+\.\d+)/);
      if (!fatherMatch) return null;
      const fatherPrefix = fatherMatch[1];

      // Busca todas as categorias Tertiary que são filhas deste pai
      const tertiaryChildren = allCategories.filter(
        (cat) =>
          cat.level === AccountCategoryLevel.TERTIARY &&
          cat.status &&
          cat.account_category_father_id === selectedFatherCategory.id
      );

      if (tertiaryChildren.length === 0) {
        // Se não tem filhos, sugere o primeiro (01)
        return `${fatherPrefix}.${formatWithLeadingZero(1)}`;
      }

      // Extrai números da terceira parte da estrutura (após o "xx.xx.")
      const childNumbers = tertiaryChildren
        .map((cat) => {
          if (!cat.structure) return 0;
          // Procura padrão "xx.xx.XX" onde XX é o número do filho
          const match = cat.structure.match(/^\d+\.\d+\.(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((num) => num > 0);

      if (childNumbers.length === 0) {
        return `${fatherPrefix}.${formatWithLeadingZero(1)}`;
      }

      // Encontra o próximo número disponível
      const maxNumber = Math.max(...childNumbers);
      const nextNumber = maxNumber + 1;
      return `${fatherPrefix}.${formatWithLeadingZero(nextNumber)}`;
    }

    return null;
  }, [level, allCategories, companyIdNumber, selectedFatherCategory]);

  // Aplica sugestão quando estrutura sugerida está disponível e campo está vazio
  useEffect(() => {
    const currentStructure = formMethods.getValues('structure');
    
    // Para Primary: aplica sugestão quando nível é selecionado e estrutura está vazia
    if (level === AccountCategoryLevel.PRIMARY && suggestedStructure && !currentStructure) {
      formMethods.setValue('structure', suggestedStructure, { shouldDirty: false });
    }
    
    // Para Secondary e Tertiary: aplica sugestão quando categoria pai é selecionada e estrutura está vazia
    if (
      (level === AccountCategoryLevel.SECONDARY || level === AccountCategoryLevel.TERTIARY) &&
      suggestedStructure &&
      accountCategoryFatherId &&
      !currentStructure
    ) {
      formMethods.setValue('structure', suggestedStructure, { shouldDirty: false });
    }
  }, [level, suggestedStructure, formMethods, accountCategoryFatherId]);

  // Observa mudanças no nível para aplicar sugestão quando necessário
  const prevLevelRef = useRef<AccountCategoryLevel | undefined>(level);
  useEffect(() => {
    const currentStructure = formMethods.getValues('structure');
    
    // Se mudou para Primary e não tem estrutura, aplica sugestão
    if (
      level === AccountCategoryLevel.PRIMARY &&
      prevLevelRef.current !== AccountCategoryLevel.PRIMARY &&
      suggestedStructure &&
      !currentStructure
    ) {
      formMethods.setValue('structure', suggestedStructure, { shouldDirty: false });
    }
    
    // Se mudou para Secondary/Tertiary e tem categoria pai, aplica sugestão
    if (
      (level === AccountCategoryLevel.SECONDARY || level === AccountCategoryLevel.TERTIARY) &&
      prevLevelRef.current !== level &&
      suggestedStructure &&
      accountCategoryFatherId &&
      !currentStructure
    ) {
      formMethods.setValue('structure', suggestedStructure, { shouldDirty: false });
    }
    
    prevLevelRef.current = level;
  }, [level, suggestedStructure, formMethods, accountCategoryFatherId]);

  // Limpa estrutura quando muda de Primary para Secondary/Tertiary ou quando categoria pai não está preenchida
  useEffect(() => {
    const currentStructure = formMethods.getValues('structure');
    const currentFatherId = formMethods.getValues('account_category_father_id');
    
    // Se mudou para Secondary ou Tertiary e não tem categoria pai, limpa estrutura
    if (
      (level === AccountCategoryLevel.SECONDARY || level === AccountCategoryLevel.TERTIARY) &&
      (!currentFatherId || currentFatherId === '') &&
      currentStructure
    ) {
      formMethods.setValue('structure', '', { shouldDirty: false });
    }
    
    // Se mudou de Secondary/Tertiary para Primary, limpa categoria pai, filtro e estrutura
    if (level === AccountCategoryLevel.PRIMARY) {
      const fatherId = formMethods.getValues('account_category_father_id');
      const filterId = formMethods.getValues('primary_category_filter_id');
      if (fatherId) {
        formMethods.setValue('account_category_father_id', null, { shouldDirty: false });
      }
      if (filterId) {
        formMethods.setValue('primary_category_filter_id', null, { shouldDirty: false });
      }
      // Se não tem estrutura sugerida ainda, limpa
      if (!suggestedStructure && currentStructure) {
        formMethods.setValue('structure', '', { shouldDirty: false });
      }
    }
    
    // Se mudou para Tertiary e não tem filtro primário, limpa categoria pai
    if (level === AccountCategoryLevel.TERTIARY && !primaryCategoryFilterId) {
      const fatherId = formMethods.getValues('account_category_father_id');
      if (fatherId) {
        formMethods.setValue('account_category_father_id', null, { shouldDirty: false });
      }
    }
    
    // Se mudou o filtro primário, limpa categoria pai para forçar nova seleção
    if (level === AccountCategoryLevel.TERTIARY) {
      const currentFilterId = formMethods.getValues('primary_category_filter_id');
      const currentFatherId = formMethods.getValues('account_category_father_id');
      if (currentFilterId !== primaryCategoryFilterId && currentFatherId) {
        formMethods.setValue('account_category_father_id', null, { shouldDirty: false });
      }
    }
  }, [level, formMethods, suggestedStructure, primaryCategoryFilterId]);

  // Determina se campos devem estar desabilitados
  const isFieldsDisabled = useMemo(() => {
    if (level === AccountCategoryLevel.PRIMARY) {
      return false; // No nível Primary, todos os campos estão habilitados
    }
    // Para Secondary e Tertiary, campos só ficam habilitados se categoria pai estiver preenchida
    return !accountCategoryFatherId || accountCategoryFatherId === '';
  }, [level, accountCategoryFatherId]);

  // Determina qual nível filtrar no autocomplete de categoria pai
  const filterByLevel = useMemo(() => {
    if (level === AccountCategoryLevel.SECONDARY) {
      return 'primary'; // Secondary mostra apenas Primary
    }
    if (level === AccountCategoryLevel.TERTIARY) {
      return 'secondary'; // Tertiary mostra apenas Secondary
    }
    return null; // Primary não mostra categoria pai
  }, [level]);

  // Determina se categoria pai é obrigatória
  const isFatherRequired = level === AccountCategoryLevel.SECONDARY || level === AccountCategoryLevel.TERTIARY;

  return (
    <div className="space-y-4">
      {/* Primeira linha: Nível (6 colunas) */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <InputSelect
            control={formMethods.control}
            name="level"
            label="Nível"
            placeholder="Selecione o nível"
            description={
              isEditMode
                ? 'O nível não pode ser alterado após o cadastro'
                : 'Nível de classificação da categoria'
            }
            options={[
              { value: AccountCategoryLevel.PRIMARY, label: 'Primária', code: 'Primária' },
              { value: AccountCategoryLevel.SECONDARY, label: 'Secundária', code: 'Secundária' },
              { value: AccountCategoryLevel.TERTIARY, label: 'Terciária', code: 'Terciária' },
            ]}
            required
            disabled={isEditMode}
          />
        </div>
      </div>

      {/* Segunda linha: Filtro de Categoria Primária (6 colunas) - Só aparece para Tertiary */}
      {companyId && level === AccountCategoryLevel.TERTIARY && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <AutoCompleteAccountCategory
              control={formMethods.control}
              name="primary_category_filter_id"
              label="Filtrar por Categoria Primária"
              placeholder="Selecione uma categoria primária para filtrar..."
              description="Selecione uma categoria primária para filtrar as categorias secundárias disponíveis"
              companyId={companyId}
              excludeId={accountCategoryId}
              required={false}
              filterByLevel="primary"
            />
          </div>
        </div>
      )}

      {/* Terceira linha: Categoria Pai (6 colunas) - Só aparece para Secondary e Tertiary */}
      {companyId && level !== AccountCategoryLevel.PRIMARY && (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <AutoCompleteAccountCategory
              control={formMethods.control}
              name="account_category_father_id"
              label="Categoria Pai"
              placeholder="Selecione uma categoria pai..."
              description={
                level === AccountCategoryLevel.SECONDARY
                  ? 'Selecione uma categoria primária como pai'
                  : 'Selecione uma categoria secundária como pai'
              }
              companyId={companyId}
              excludeId={accountCategoryId}
              required={isFatherRequired}
              filterByLevel={filterByLevel || undefined}
              filterByParentId={level === AccountCategoryLevel.TERTIARY && primaryCategoryFilterId ? primaryCategoryFilterId : undefined}
            />
          </div>
        </div>
      )}

      {/* Quarta linha: Estrutura (3 colunas) e Descrição (9 colunas) */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-3">
          <FormField
            control={formMethods.control}
            name="structure"
            render={({ field }) => {
              const handleStructureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value;
                if (!level) {
                  field.onChange(value);
                  return;
                }

                // Aplica máscara baseada no nível
                const masked = applyStructureMask(value, level);
                field.onChange(masked);
              };

              const placeholder =
                level === AccountCategoryLevel.PRIMARY
                  ? 'Ex: 01'
                  : level === AccountCategoryLevel.SECONDARY
                  ? 'Ex: 01.01'
                  : 'Ex: 01.01.01';

              const description =
                level === AccountCategoryLevel.PRIMARY
                  ? 'Código da categoria primária (2 dígitos)'
                  : level === AccountCategoryLevel.SECONDARY
                  ? 'Código da categoria secundária (formato: xx.xx)'
                  : 'Código da categoria terciária (formato: xx.xx.xx)';

              return (
                <FormItem>
                  <FormLabel>Estrutura</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      onChange={handleStructureChange}
                      placeholder={placeholder}
                      disabled={isFieldsDisabled}
                      maxLength={level === AccountCategoryLevel.PRIMARY ? 2 : level === AccountCategoryLevel.SECONDARY ? 5 : 8}
                    />
                  </FormControl>
                  <FormDescription>{description}</FormDescription>
                  {suggestedStructure && !field.value && (
                    <FormDescription className="text-primary">
                      Sugestão: {suggestedStructure}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <div className="col-span-12 md:col-span-9">
          <InputText
            control={formMethods.control}
            name="description"
            label="Descrição"
            placeholder="Descreva a categoria de conta..."
            description="Breve descrição sobre a categoria"
            inputProps={{
              disabled: isFieldsDisabled,
            }}
          />
        </div>
      </div>

      {/* Quinta linha: Lista de Categorias Marvee - Só aparece para Tertiary */}
      {level === AccountCategoryLevel.TERTIARY && accountCategoryId && (
        <MarveeCategoriesList accountCategoryId={accountCategoryId} />
      )}

      {/* Última linha: Status */}
      <InputSwitch
        control={formMethods.control}
        name="status"
        label="Categoria Ativa"
        description="Define se a categoria está ativa e disponível"
      />
    </div>
  );
}
