import { useState, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AutoCompleteMCategories } from '@/components/input/AutoComplete/Marvee/AutoCompleteMCategories';
import { ConfirmDialog } from '@/components/Dialog';
import {
  useAccountCategoryMarvee,
  useCreateAccountCategoryMarvee,
  useDeleteAccountCategoryMarvee,
} from '../hooks/useAccountCategoryMarvee';
import { useCategories } from '@/pages/private/@marvee/category/hooks/useCategories';
import type { AccountCategoryFormSchema } from '../schemas/account-category.schemas';
import { AccountCategoryLevel } from '../types';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface MarveeCategoriesListProps {
  accountCategoryId: string | null;
}

export function MarveeCategoriesList({ accountCategoryId }: MarveeCategoriesListProps) {
  const formMethods = useFormContext<AccountCategoryFormSchema>();
  const level = useWatch({ control: formMethods.control, name: 'level' });
  const { currentCompany } = useCompany();
  const companyId = currentCompany?.id ? Number(currentCompany.id) : undefined;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: number; categoryId: number } | null>(null);
  
  // Form temporário para o dialog de adicionar categoria
  const addCategoryFormSchema = z.object({
    marvee_category_id: z.number().nullable().optional(),
  });
  
  type AddCategoryFormSchema = z.infer<typeof addCategoryFormSchema>;
  
  const addCategoryForm = useForm<AddCategoryFormSchema>({
    resolver: zodResolver(addCategoryFormSchema),
    defaultValues: {
      marvee_category_id: null,
    },
  });

  // Só mostra para nível TERTIARY e quando tem accountCategoryId
  if (level !== AccountCategoryLevel.TERTIARY || !accountCategoryId || !companyId) {
    return null;
  }

  // Busca associações
  const { data: associations = [], isLoading } = useAccountCategoryMarvee(
    companyId,
    accountCategoryId
  );

  // Busca todas as categorias Marvee para obter os dados completos
  const { data: allCategoriesResponse } = useCategories({ page: 1, pageSize: 1000 });
  const allCategories = useMemo(() => {
    if (!allCategoriesResponse) return [];
    if (Array.isArray(allCategoriesResponse)) return allCategoriesResponse;
    return allCategoriesResponse.data || [];
  }, [allCategoriesResponse]);

  // Mapeia associações para categorias Marvee completas
  const associatedCategories = useMemo(() => {
    return associations
      .map((association) => {
        const category = allCategories.find((cat) => cat.id === association.marvee_category_id);
        if (!category) return null;
        return {
          ...category,
          associationId: association.id,
        };
      })
      .filter((cat) => cat !== null);
  }, [associations, allCategories]);

  const createMutation = useCreateAccountCategoryMarvee();
  const deleteMutation = useDeleteAccountCategoryMarvee();

  const handleAddCategory = async () => {
    const marveeCategoryId = addCategoryForm.getValues('marvee_category_id');
    if (!marveeCategoryId || !companyId || !accountCategoryId) {
      addCategoryForm.setError('marvee_category_id', {
        type: 'manual',
        message: 'Selecione uma categoria Marvee',
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        companyId,
        data: {
          account_category_id: Number(accountCategoryId),
          marvee_category_id: marveeCategoryId,
        },
      });
      setIsAddDialogOpen(false);
      addCategoryForm.reset();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDeleteClick = (associationId: number, categoryId: number) => {
    setCategoryToDelete({ id: associationId, categoryId });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete || !companyId) return;

    try {
      await deleteMutation.mutateAsync({
        companyId,
        id: categoryToDelete.id,
        accountCategoryId: Number(accountCategoryId),
      });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const getCategoryLabel = (category: any) => {
    const categoryCode = category.category || '';
    const description = category.description || '';
    
    if (categoryCode && description) {
      return `${categoryCode} - ${description}`;
    }
    return categoryCode || description || 'Sem descrição';
  };

  // IDs já associados para filtrar no AutoComplete
  const associatedCategoryIds = useMemo(
    () => associatedCategories.map((cat) => cat.id),
    [associatedCategories]
  );

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Categorias Marvee Associadas</h3>
                <p className="text-xs text-muted-foreground">
                  Gerencie as categorias Marvee associadas a esta categoria de conta
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Associar Categoria
              </Button>
            </div>

            {isLoading ? (
              <div className="text-sm text-muted-foreground py-4">
                Carregando associações...
              </div>
            ) : associatedCategories.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 border rounded-md px-4">
                Nenhuma categoria Marvee associada. Clique em "Associar Categoria" para adicionar.
              </div>
            ) : (
              <div className="space-y-2">
                {associatedCategories.map((category) => (
                  <div
                    key={category.associationId}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{getCategoryLabel(category)}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(category.associationId, category.id)}
                      disabled={deleteMutation.isPending}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog para adicionar categoria */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Associar Categoria Marvee</DialogTitle>
            <DialogDescription>
              Selecione uma categoria Marvee para associar a esta categoria de conta.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <AutoCompleteMCategories
              control={addCategoryForm.control}
              name="marvee_category_id"
              label="Categoria Marvee"
              placeholder="Selecione uma categoria..."
              description="Apenas categorias de nível 3 podem ser selecionadas"
              required={true}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                addCategoryForm.reset();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={addCategoryForm.handleSubmit(handleAddCategory)}
              disabled={!addCategoryForm.watch('marvee_category_id') || createMutation.isPending}
            >
              {createMutation.isPending ? 'Associando...' : 'Associar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remover Associação"
        description="Tem certeza que deseja remover esta associação? Esta ação não pode ser desfeita."
        onConfirm={handleConfirmDelete}
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </>
  );
}

