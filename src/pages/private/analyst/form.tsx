import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Analyst } from './types';
import { AnalystFormSchema, analystFormSchema } from './schemas/analyst.schemas';
import { analystsService } from './services/analysts.service';
import { useAnalyst, useCreateAnalyst, useUpdateAnalyst } from './hooks/useAnalyst';
import { format } from 'date-fns';
import { AutoCompleteUser, AutoCompleteCostCenter } from '@/components/input/AutoComplete';

interface AnalystFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analyst: Analyst | null;
  onSuccess: () => void;
}

export function AnalystFormModal({ open, onOpenChange, analyst, onSuccess }: AnalystFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: analystData, isLoading: isLoadingAnalystData } = useAnalyst(analyst?.id);
  const createMutation = useCreateAnalyst();
  const updateMutation = useUpdateAnalyst();

  const form = useForm<AnalystFormSchema>({
    resolver: zodResolver(analystFormSchema),
    defaultValues: {
      status: true,
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = form;

  // Carregar dados do analista quando o modal abrir
  useEffect(() => {
    if (open && analystData) {
      reset({
        avatar: analystData.avatar,
        status: analystData.status ?? true,
        role: analystData.role,
        sector: analystData.sector,
        start_date: analystData.start_date ? format(new Date(analystData.start_date), 'yyyy-MM-dd') : '',
        end_date: analystData.end_date ? format(new Date(analystData.end_date), 'yyyy-MM-dd') : null,
        description: analystData.description || null,
        user_id: analystData.user_id ? String(analystData.user_id) : '',
        marvee_cost_center_id: analystData.marvee_cost_center_id ?? null,
      });
    } else if (open && !analyst) {
      reset({
        avatar: null,
        status: true,
        role: '',
        sector: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: null,
        description: null,
        user_id: '',
        marvee_cost_center_id: null,
      });
    }
  }, [open, analystData, analyst, reset]);

  const onSubmit = async (data: AnalystFormSchema) => {
    setIsSubmitting(true);
    try {
      if (analyst) {
        await updateMutation.mutateAsync({ id: analyst.id, data });
        toast({
          title: 'Analista atualizado',
          description: 'As informações foram atualizadas com sucesso.',
        });
      } else {
        await createMutation.mutateAsync(data);
        toast({
          title: 'Analista criado',
          description: 'O analista foi cadastrado com sucesso.',
        });
      }
      onSuccess();
    } catch (error) {
      logErrorDetails('AnalystFormModal.onSubmit', error);
      toast({
        title: analyst ? 'Erro ao atualizar' : 'Erro ao criar analista',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            {analyst ? 'Editar Analista' : 'Novo Analista'}
          </DialogTitle>
          <DialogDescription>
            {analyst
              ? 'Atualize as informações do analista abaixo. Campos marcados com * são obrigatórios.'
              : 'Preencha os dados do analista abaixo. Campos marcados com * são obrigatórios.'
            }
          </DialogDescription>
        </DialogHeader>

        {isLoadingAnalystData && analyst ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando dados do analista...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Usuário */}
              <AutoCompleteUser
                control={control}
                name="user_id"
                label="Usuário"
                placeholder="Selecione um usuário para vincular ao analista..."
                description="Vincule este analista a um usuário do sistema"
                required
              />

              {/* Centro de Custo Marvee */}
              <AutoCompleteCostCenter
                control={control}
                name="marvee_cost_center_id"
                label="Centro de Custo Marvee"
                placeholder="Selecione um centro de custo..."
                description="Vincule este analista a um centro de custo da base Marvee"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cargo */}
                <FormField
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Analista Comercial"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Setor */}
                <FormField
                  control={control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Vendas"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data de Início */}
                <FormField
                  control={control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Data de início do analista
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data de Término */}
                <FormField
                  control={control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Término</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={isSubmitting}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Data de término (opcional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descrição */}
              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descrição adicional do analista (opcional)"
                        disabled={isSubmitting}
                        value={field.value || ''}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-0.5">
                      <FormLabel htmlFor="status">Status</FormLabel>
                      <FormDescription>
                        {field.value ? 'Analista ativo' : 'Analista inativo'}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        id="status"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Ações */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>{analyst ? 'Atualizar' : 'Criar'}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

