import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { BackButton, CancelButton, DeleteButton, SaveButton, AddButton } from '@/components/crud/ActionButtons';
import { ConfirmDialog } from '@/components/Dialog';
import { When } from '@/utils/When';
import type { FormActionsProps } from './types';

/**
 * Extrai o recurso da rota atual para usar em permissões
 * Ex: /usuarios/form -> 'users'
 */
function getResourceFromPath(pathname: string): string | null {
  // Remove /form, /novo, ou IDs UUID
  const cleaned = pathname
    .replace(/\/form$/, '')
    .replace(/\/novo$/, '')
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, '')
    .replace(/\/[^/]+$/, ''); // Remove último segmento se for ID

  // Tenta mapear para recurso conhecido
  const segments = cleaned.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  if (!lastSegment) return null;
  
  // Mapeamento simples - pode ser expandido
  const resourceMap: Record<string, string> = {
    'usuarios': 'users',
    'users': 'users',
    'modulos': 'modules',
    'modules': 'modules',
    'empresas': 'organizations',
    'companies': 'organizations',
    'cadastros': 'cadastros',
  };
  
  return resourceMap[lastSegment] || lastSegment;
}

export const FormActions = React.memo((props: FormActionsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  // Detecta recurso da rota para permissões
  const resource = getResourceFromPath(location.pathname);
  
  // Por enquanto, permite todas as ações se não especificado
  // Pode ser melhorado para usar usePermission(resource) quando necessário
  const canCreate = true;
  const canUpdate = true;
  const canDelete = true;

  const itemId = props.identifier ?? id ?? null;
  const isEditMode = !!itemId;

  const isFormDirty =
    props.formMethods.formState.isDirty &&
    Boolean(Object.keys(props.formMethods.formState.dirtyFields).length);

  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onBackConfirm = () => {
    if (location.key !== 'default') {
      return navigate(-1);
    }
    
    const identifier = id || 'novo';
    const basePath = location.pathname.replace(`/${identifier}`, '').replace(/\/form$/, '');
    return navigate(basePath);
  };

  const handleBackClick = () => {
    if (isFormDirty) {
      setShowBackDialog(true);
    } else {
      onBackConfirm();
    }
  };

  const goToNewForm = () => {
    if (!itemId) return;
    const basePath = location.pathname.replace(`/${itemId}`, '').replace(/\/form$/, '');
    return navigate(`${basePath}/form`, { replace: true });
  };

  const handleDelete = async () => {
    if (!props.handleDelete) return;
    
    setIsDeleting(true);
    try {
      await props.handleDelete();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Erro ao deletar:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Ações */}
      <div className="flex items-center gap-2 flex-wrap">
          {/* Ações extras */}
          <When is={Boolean(props.ExtraActions)}>
            {props.ExtraActions}
          </When>

          {/* Botão Voltar */}
          <When is={!props.hiddenActions?.back}>
            <BackButton
              onClick={handleBackClick}
              type="button"
              iconOnly={true}
            />
          </When>

          {/* Modo Edição */}
          <When is={isEditMode}>
            {/* Botão Excluir - só aparece se formulário não está sujo */}
            <When
              is={
                !isFormDirty &&
                canDelete &&
                !props.hiddenActions?.destroy &&
                Boolean(props.handleDelete)
              }
            >
              <DeleteButton
                onClick={() => setShowDeleteDialog(true)}
                disabled={props.disabled?.remove || props.isLoadingDelete}
                type="button"
                iconOnly={true}
              />
            </When>

            {/* Botão Cancelar - só aparece se formulário está sujo */}
            <When is={isFormDirty}>
              <CancelButton
                onClick={() => props.formMethods.reset()}
                type="button"
                iconOnly={true}
              />
            </When>

            {/* Botão Atualizar - só aparece se formulário está sujo */}
            <When
              is={
                isFormDirty &&
                canUpdate &&
                !props.hiddenActions?.update
              }
            >
              <SaveButton
                type="submit"
                onClick={async (e) => {
                  try {
                    if (props.onUpdate) {
                      e.preventDefault();
                      await props.onUpdate(e as any);
                    }
                  } catch (error) {
                    console.error('Erro ao atualizar:', error);
                  }
                }}
                disabled={props.disabled?.update || props.isLoadingUpdate || props.isLoadingForm}
                iconOnly={true}
                tooltip={props.isLoadingUpdate || props.isLoadingForm ? 'Atualizando...' : 'Atualizar'}
              />
            </When>

            {/* Botão Novo - só aparece se formulário não está sujo */}
            <When
              is={
                !isFormDirty &&
                canCreate &&
                !props.hiddenActions?.create
              }
            >
              <AddButton
                onClick={goToNewForm}
                type="button"
                iconOnly={true}
              />
            </When>
          </When>

          {/* Modo Criação */}
          <When is={!isEditMode && canCreate && isFormDirty}>
            <SaveButton
              type="submit"
              disabled={props.disabled?.save || props.isLoadingCreate || props.isLoadingForm}
              iconOnly={true}
              tooltip={props.isLoadingCreate || props.isLoadingForm ? 'Criando...' : 'Salvar'}
            />
          </When>
        </div>

      {/* Dialog de confirmação ao voltar com mudanças não salvas */}
      <ConfirmDialog
        open={showBackDialog}
        onOpenChange={setShowBackDialog}
        title="Descartar alterações?"
        description="Você tem alterações não salvas. Tem certeza que deseja voltar? As alterações serão perdidas."
        onConfirm={onBackConfirm}
        confirmLabel="Sim, descartar"
        cancelLabel="Cancelar"
        variant="destructive"
      />

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Excluir registro?"
        description="Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        isLoading={isDeleting || props.isLoadingDelete}
        variant="destructive"
      />
    </>
  );
});

FormActions.displayName = 'FormActions';

