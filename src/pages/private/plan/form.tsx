import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { SaveButton, CancelButton, DeleteButton } from '@/components/crud/ActionButtons';
import { Form } from '@/components/ui/form';
import { InputText, InputCheck, InputSelect } from '@/components/input';
import { AutoCompleteModules } from '@/components/input/AutoComplete';
import { AutoCompleteIcon } from '@/components/input/AutoComplete/AutoCompleteIcon';
import { InputInteger } from '@/components/input/InputText/InputInteger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { planoFormSchema, planoModuloSchema, planoGrupoSchema, planoItemSchema, type PlanoFormSchema, type PlanoModuloSchema, type PlanoGrupoSchema, type PlanoItemSchema } from './schemas/plano.schemas';
import { 
  usePlano, 
  useCreatePlano, 
  useUpdatePlano, 
  useDeletePlano,
  usePlanoModulos,
  useCreatePlanoModulo,
  useDeletePlanoModulo,
  usePlanoGrupos,
  useCreatePlanoGrupo,
  useDeletePlanoGrupo,
  usePlanoItens,
  useCreatePlanoItem,
  useDeletePlanoItem,
} from './hooks/usePlans';
import { useModules } from '@/pages/private/module/hooks/useModule';
import { useCadastros } from '@/pages/private/cadastro/hooks/useCadastro';
import { useIcons } from '@/pages/private/icons/hooks/useIcon';
import { plansService } from './services/plans.service';

// Component for rendering each plano modulo with its grupos and cadastros
function PlanoModuloCard({ 
  planoModulo, 
  onDeleteModule, 
  onAddGrupo, 
  onAddCadastro,
  onDeleteGrupo,
  onDeleteCadastro,
  deleteMutation,
  modules = []
}: { 
  planoModulo: any; 
  onDeleteModule: (id: string) => void; 
  onAddGrupo: () => void;
  onAddCadastro: () => void;
  onDeleteGrupo: (grupoId: string, planoModuloId: string) => void;
  onDeleteCadastro: (itemId: string, planoModuloId: string) => void;
  deleteMutation: any;
  modules?: any[];
}) {
  const { data: grupos = [] } = usePlanoGrupos(planoModulo.id);
  const { data: itens = [] } = usePlanoItens(planoModulo.id);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          <CardTitle className="text-base">
            {planoModulo.modules?.name || 
             (modules.find(m => m.id === planoModulo.module_id)?.name) || 
             `Módulo ID: ${planoModulo.module_id}`}
          </CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDeleteModule(planoModulo.id)}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Ordem: {planoModulo.order_index}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onAddGrupo}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Grupo
              </Button>
              <Button variant="outline" size="sm" onClick={onAddCadastro}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cadastro
              </Button>
            </div>
          </div>

          {/* Grupos */}
          {grupos.length > 0 && (
            <div className="space-y-2 mt-4 pl-4 border-l-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Grupos</h4>
              {grupos.map((grupo: any) => (
                <Card key={grupo.id} className="bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">{grupo.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteGrupo(grupo.id, planoModulo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardHeader>
                  {grupo.description && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">{grupo.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Cadastros */}
          {itens.length > 0 && (
            <div className="space-y-2 mt-4 pl-4 border-l-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Cadastros</h4>
              {itens.map((item: any) => (
                <Card key={item.id} className="bg-muted/50">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-sm">
                        {item.cadastros?.name || 'Cadastro'}
                      </CardTitle>
                      {item.grupo_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Grupo: {grupos.find((g: any) => g.id === item.grupo_id)?.name || 'N/A'}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteCadastro(item.id, planoModulo.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlanoForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [isAddModuleDialogOpen, setIsAddModuleDialogOpen] = useState(false);
  const [isAddGrupoDialogOpen, setIsAddGrupoDialogOpen] = useState(false);
  const [isAddCadastroDialogOpen, setIsAddCadastroDialogOpen] = useState(false);
  const [selectedPlanoModuloId, setSelectedPlanoModuloId] = useState<string | null>(null);

  const { data: plano, isLoading } = usePlano(id || undefined);
  const { data: planoModulos = [] } = usePlanoModulos(id || '');
  const { data: modules = [], isLoading: isLoadingModules } = useModules();
  const { data: cadastros = [] } = useCadastros();
  const { data: icons = [] } = useIcons({ status: 'true' });
  const createMutation = useCreatePlano();
  const updateMutation = useUpdatePlano();
  const deleteMutation = useDeletePlano();
  const createPlanoModuloMutation = useCreatePlanoModulo();
  const deletePlanoModuloMutation = useDeletePlanoModulo();
  const createPlanoGrupoMutation = useCreatePlanoGrupo();
  const deletePlanoGrupoMutation = useDeletePlanoGrupo();
  const createPlanoItemMutation = useCreatePlanoItem();
  const deletePlanoItemMutation = useDeletePlanoItem();

  const form = useForm<PlanoFormSchema>({
    resolver: zodResolver(planoFormSchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
    },
  });

  const moduleForm = useForm<PlanoModuloSchema>({
    resolver: zodResolver(planoModuloSchema),
    defaultValues: {
      module_id: '',
      order_index: 0,
      active: true,
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddModuleDialogOpen) {
      moduleForm.reset({
        module_id: '',
        order_index: 0,
        active: true,
      });
    }
  }, [isAddModuleDialogOpen, moduleForm]);

  const grupoForm = useForm<PlanoGrupoSchema>({
    resolver: zodResolver(planoGrupoSchema),
    defaultValues: {
      name: '',
      description: '',
      icon_id: null,
      order_index: 0,
      active: true,
    },
  });

  const cadastroForm = useForm<PlanoItemSchema>({
    resolver: zodResolver(planoItemSchema),
    defaultValues: {
      cadastro_id: '',
      grupo_id: null,
      order_index: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (plano) {
      form.reset({
        name: plano.name,
        description: plano.description || '',
        active: plano.active,
      });
    }
  }, [plano, form]);

  const onSubmit = async (data: PlanoFormSchema) => {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        const result = await createMutation.mutateAsync(data);
        navigate(`/planos/form?id=${result.id}`);
        return;
      }
    } catch (error) {
      console.error('Error saving plano:', error);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/planos');
    } catch (error) {
      console.error('Error deleting plano:', error);
    }
  };

  const handleCancel = () => {
    navigate('/planos');
  };

  const handleAddModule = async (data: PlanoModuloSchema) => {
    if (!id) return;
    
    try {
      // Get the next order_index if not specified or 0
      const nextOrderIndex = planoModulos.length > 0 
        ? Math.max(...planoModulos.map((pm: any) => pm.order_index || 0)) + 1
        : 0;

      // Use provided order_index if > 0, otherwise use next available
      const orderIndex = data.order_index && data.order_index > 0 
        ? data.order_index 
        : nextOrderIndex;

      await createPlanoModuloMutation.mutateAsync({
        plano_id: id,
        module_id: data.module_id,
        order_index: orderIndex,
        active: data.active,
      });
      
      moduleForm.reset();
      setIsAddModuleDialogOpen(false);
    } catch (error) {
      console.error('Error adding module:', error);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!id) return;
    
    try {
      await deletePlanoModuloMutation.mutateAsync({ id: moduleId, planoId: id });
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  // IDs dos módulos já adicionados ao plano (para excluir do autocomplete)
  const addedModuleIds = useMemo(() => {
    return planoModulos
      .map((pm: any) => {
        // Pega o module_id (já vem como string do mapeamento) ou o id do módulo relacionado
        const moduleId = pm.module_id || pm.modules?.id;
        // Normaliza para string para garantir comparação correta
        return moduleId ? String(moduleId) : null;
      })
      .filter(Boolean) as string[];
  }, [planoModulos]);

  const cadastroOptions = cadastros.map((cadastro) => ({
    value: cadastro.id,
    label: cadastro.name,
    code: cadastro.code,
  }));

  const handleAddGrupoClick = (planoModuloId: string) => {
    setSelectedPlanoModuloId(planoModuloId);
    grupoForm.reset({
      name: '',
      description: '',
      icon_id: null,
      order_index: 0,
      active: true,
    });
    setIsAddGrupoDialogOpen(true);
  };

  const handleAddGrupo = async (data: PlanoGrupoSchema) => {
    if (!selectedPlanoModuloId) return;
    
    try {
      // Busca o nome do ícone pelo ID
      const iconName = data.icon_id 
        ? icons.find(icon => Number(icon.id) === data.icon_id)?.name || null
        : null;
      
      await createPlanoGrupoMutation.mutateAsync({
        plano_modulo_id: selectedPlanoModuloId,
        name: data.name,
        description: data.description || null,
        icon_id: data.icon_id || null,
        iconName: iconName,
        order_index: data.order_index || 0,
        active: data.active,
      });
      
      grupoForm.reset();
      setIsAddGrupoDialogOpen(false);
      setSelectedPlanoModuloId(null);
    } catch (error) {
      console.error('Error adding grupo:', error);
    }
  };

  const handleAddCadastroClick = (planoModuloId: string) => {
    setSelectedPlanoModuloId(planoModuloId);
    cadastroForm.reset({
      cadastro_id: '',
      grupo_id: null,
      order_index: 0,
      active: true,
    });
    setIsAddCadastroDialogOpen(true);
  };

  const handleAddCadastro = async (data: PlanoItemSchema) => {
    if (!selectedPlanoModuloId) return;
    
    try {
      // Buscar o cadastro selecionado para obter a rota
      const selectedCadastro = cadastros.find(c => c.id === data.cadastro_id);
      if (!selectedCadastro) {
        cadastroForm.setError('cadastro_id', { 
          type: 'manual', 
          message: 'Cadastro não encontrado' 
        });
        return;
      }

      // Validar rota duplicada apenas se o cadastro tiver uma rota definida
      // A validação principal será feita no backend, mas fazemos uma validação preventiva aqui
      if (selectedCadastro.route) {
        // Buscar itens existentes do módulo para validação preventiva
        const existingItems = await plansService.listPlanItems(selectedPlanoModuloId);
        
        // Verificar se já existe um item com a mesma rota no mesmo módulo
        const duplicateItem = existingItems.find((item) => {
          const cadastro = item.cadastros;
          if (!cadastro) return false;
          
          // Comparar rotas normalizadas (remover trailing slash e espaços)
          const existingRoute = cadastro?.route?.trim().replace(/\/$/, '') || null;
          const newRoute = selectedCadastro.route.trim().replace(/\/$/, '') || null;
          
          // Só considerar duplicata se ambas as rotas existirem e forem iguais
          return existingRoute && 
                 newRoute && 
                 existingRoute === newRoute && 
                 item.cadastro_id !== data.cadastro_id;
        });

        if (duplicateItem) {
          const duplicateCadastro = duplicateItem.cadastros;
          
          cadastroForm.setError('cadastro_id', {
            type: 'manual',
            message: `Já existe um cadastro com a mesma rota neste módulo: "${duplicateCadastro?.name || 'Cadastro desconhecido'}"`
          });
          return;
        }
      }

      // Ensure grupo_id is null if not provided or is empty string
      const grupoId = data.grupo_id && data.grupo_id !== '' ? data.grupo_id : null;
      
      await createPlanoItemMutation.mutateAsync({
        plano_modulo_id: selectedPlanoModuloId,
        grupo_id: grupoId,
        cadastro_id: data.cadastro_id,
        order_index: data.order_index || 0,
        active: data.active,
      });
      
      cadastroForm.reset();
      setIsAddCadastroDialogOpen(false);
      setSelectedPlanoModuloId(null);
    } catch (error: any) {
      console.error('Error adding cadastro:', error);
      
      // Se o erro for de rota duplicada do backend, mostrar mensagem específica
      if (error?.statusCode === 409 || error?.message?.includes('rota') || error?.message?.includes('duplicat')) {
        cadastroForm.setError('cadastro_id', {
          type: 'manual',
          message: error.message || 'Já existe um cadastro com a mesma rota neste módulo'
        });
      } else {
        cadastroForm.setError('cadastro_id', {
          type: 'manual',
          message: error?.message || 'Erro ao adicionar cadastro. Tente novamente.'
        });
      }
    }
  };

  const handleDeleteGrupo = async (grupoId: string, planoModuloId: string) => {
    try {
      await deletePlanoGrupoMutation.mutateAsync({ id: grupoId, planoModuloId });
    } catch (error) {
      console.error('Error deleting grupo:', error);
    }
  };

  const handleDeleteCadastro = async (itemId: string, planoModuloId: string) => {
    try {
      await deletePlanoItemMutation.mutateAsync({ id: itemId, planoModuloId });
    } catch (error) {
      console.error('Error deleting cadastro:', error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={id ? 'Editar Plano' : 'Novo Plano'}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-6xl">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputText
                      control={form.control}
                      name="name"
                      label="Nome do Plano"
                      placeholder="Ex: Plano Básico"
                      required
                    />

                    <InputCheck
                      control={form.control}
                      name="active"
                      label="Ativo"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <InputText
                      control={form.control}
                      name="description"
                      label="Descrição"
                      placeholder="Descrição do plano"
                    />
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <CancelButton
                      type="button"
                      onClick={handleCancel}
                    />
                    
                    {id && (
                      <DeleteButton
                        type="button"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                      />
                    )}
                    
                    <SaveButton
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Modules Configuration */}
          {id && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Módulos do Plano</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => setIsAddModuleDialogOpen(true)}
                  disabled={isLoadingModules || (modules.length > 0 && addedModuleIds.length >= modules.length)}
                  title={
                    isLoadingModules 
                      ? 'Carregando módulos...' 
                      : modules.length === 0 
                        ? 'Não há módulos cadastrados no sistema' 
                        : addedModuleIds.length >= modules.length
                          ? 'Todos os módulos já foram adicionados ao plano' 
                          : 'Adicionar módulo ao plano'
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Módulo
                </Button>
              </CardHeader>
              <CardContent>
                {planoModulos.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum módulo adicionado. Clique em "Adicionar Módulo" para começar.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {planoModulos.map((pm: any) => (
                      <PlanoModuloCard
                        key={pm.id}
                        planoModulo={pm}
                        onDeleteModule={handleDeleteModule}
                        onAddGrupo={() => handleAddGrupoClick(pm.id)}
                        onAddCadastro={() => handleAddCadastroClick(pm.id)}
                        onDeleteGrupo={handleDeleteGrupo}
                        onDeleteCadastro={handleDeleteCadastro}
                        deleteMutation={deletePlanoModuloMutation}
                        modules={modules}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Module Dialog */}
      <Dialog 
        open={isAddModuleDialogOpen} 
        onOpenChange={(open) => {
          setIsAddModuleDialogOpen(open);
          if (!open) {
            // Reset form when dialog closes
            moduleForm.reset({
              module_id: '',
              order_index: 0,
              active: true,
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Módulo ao Plano</DialogTitle>
            <DialogDescription>
              Selecione um módulo para adicionar ao plano.
            </DialogDescription>
          </DialogHeader>
          <Form {...moduleForm}>
            <form onSubmit={moduleForm.handleSubmit(handleAddModule)} className="space-y-4">
              <AutoCompleteModules
                control={moduleForm.control}
                name="module_id"
                label="Módulo"
                placeholder="Selecione um módulo"
                required
                excludeIds={addedModuleIds}
              />

              <InputInteger
                control={moduleForm.control}
                name="order_index"
                label="Ordem"
                placeholder="0"
                min={0}
              />

              <InputCheck
                control={moduleForm.control}
                name="active"
                label="Ativo"
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModuleDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <SaveButton
                  type="submit"
                  disabled={createPlanoModuloMutation.isPending}
                />
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Grupo Dialog */}
      <Dialog open={isAddGrupoDialogOpen} onOpenChange={setIsAddGrupoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Grupo ao Módulo</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo grupo.
            </DialogDescription>
          </DialogHeader>
          <Form {...grupoForm}>
            <form onSubmit={grupoForm.handleSubmit(handleAddGrupo)} className="space-y-4">
              <InputText
                control={grupoForm.control}
                name="name"
                label="Nome do Grupo"
                placeholder="Ex: Grupo de Cadastros"
                required
              />

              <InputText
                control={grupoForm.control}
                name="description"
                label="Descrição"
                placeholder="Descrição do grupo"
              />

              <AutoCompleteIcon
                control={grupoForm.control}
                name="icon_id"
                label="Ícone"
                placeholder="Selecione um ícone"
              />

              <InputInteger
                control={grupoForm.control}
                name="order_index"
                label="Ordem"
                placeholder="0"
                min={0}
              />

              <InputCheck
                control={grupoForm.control}
                name="active"
                label="Ativo"
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddGrupoDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <SaveButton
                  type="submit"
                  disabled={createPlanoGrupoMutation.isPending}
                />
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Cadastro Dialog */}
      <AddCadastroDialog
        open={isAddCadastroDialogOpen}
        onOpenChange={setIsAddCadastroDialogOpen}
        planoModuloId={selectedPlanoModuloId}
        cadastroForm={cadastroForm}
        cadastroOptions={cadastroOptions}
        onAddCadastro={handleAddCadastro}
        createMutation={createPlanoItemMutation}
      />
    </div>
  );
}

// Component for Add Cadastro Dialog with grupo selection
function AddCadastroDialog({
  open,
  onOpenChange,
  planoModuloId,
  cadastroForm,
  cadastroOptions,
  onAddCadastro,
  createMutation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planoModuloId: string | null;
  cadastroForm: any;
  cadastroOptions: Array<{ value: string; label: string; code: string }>;
  onAddCadastro: (data: PlanoItemSchema) => void;
  createMutation: any;
}) {
  const { data: grupos = [] } = usePlanoGrupos(planoModuloId || '');
  
  const gruposOptions = grupos.map((g: any) => ({
    value: g.id,
    label: g.name,
    code: g.name,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Cadastro ao Módulo</DialogTitle>
          <DialogDescription>
            Selecione um cadastro para adicionar ao módulo.
          </DialogDescription>
        </DialogHeader>
        <Form {...cadastroForm}>
          <form onSubmit={cadastroForm.handleSubmit(onAddCadastro)} className="space-y-4">
            <InputSelect
              control={cadastroForm.control}
              name="cadastro_id"
              label="Cadastro"
              placeholder="Selecione um cadastro"
              required
              options={cadastroOptions}
            />

            {gruposOptions.length > 0 ? (
              <InputSelect
                control={cadastroForm.control}
                name="grupo_id"
                label="Grupo (Opcional)"
                placeholder="Selecione um grupo"
                options={gruposOptions}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum grupo disponível. Adicione um grupo ao módulo primeiro.
              </p>
            )}

            <InputInteger
              control={cadastroForm.control}
              name="order_index"
              label="Ordem"
              placeholder="0"
              min={0}
            />

            <InputCheck
              control={cadastroForm.control}
              name="active"
              label="Ativo"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <SaveButton
                type="submit"
                disabled={createMutation.isPending}
              />
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
