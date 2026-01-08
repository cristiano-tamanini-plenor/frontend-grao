import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Customer } from './types';
import { CustomerFormSchema, customerFormSchema } from './schemas/customer.schemas';
import { AutoCompleteAnalyst, AutoCompleteMCustomers } from '@/components/input/AutoComplete';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { cn } from '@/lib/utils';
import { useCustomer, useCreateCustomer, useUpdateCustomer } from './hooks/useCustomer';
import { customersService as marveeCustomersService } from '@/pages/private/@marvee/customer/services/customers.service';
import { format } from 'date-fns';
import { CustomerAvatarUpload } from './components/CustomerAvatarUpload';

// Função para formatar valor monetário para exibição
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Função para parsear valor monetário do input
const parseCurrency = (value: string): number | null => {
  if (!value) return null;
  // Remove símbolos de moeda e espaços
  let cleaned = value.replace(/[R$\s]/g, '').trim();
  if (!cleaned) return null;
  
  // Se tem vírgula, assume formato brasileiro (vírgula como decimal)
  // Remove pontos (milhares) e substitui vírgula por ponto
  if (cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

interface CustomerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSuccess: () => void;
}

export function CustomerFormModal({ open, onOpenChange, customer, onSuccess }: CustomerFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null); // Base64 para criação

  const form = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      status: true,
      fee: null,
    },
  });

  const {
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
    trigger,
  } = form;

  const marveeCustomerId = watch('marvee_id');
  const { currentCompany } = useCompany();
  const { data: customerData, isLoading: isLoadingCustomerData } = useCustomer(customer?.id);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();

  // Quando selecionar um cliente Marvee, buscar os dados e preencher automaticamente
  useEffect(() => {
    if (marveeCustomerId && !customer && currentCompany?.id) {
      setIsLoadingCustomer(true);
      // Buscar o cliente na lista de clientes Marvee
      marveeCustomersService.listCustomers(currentCompany.id, { page: 1, pageSize: 1000 })
        .then((response) => {
          const customers = Array.isArray(response) ? response : response.data || [];
          const customer = customers.find(c => c.id === marveeCustomerId);
          
          if (customer) {
            // Preencher campos automaticamente
            if (customer.guid) {
              setValue('guid_marvee', customer.guid, { shouldValidate: true });
            }
            if (customer.id) {
              setValue('marvee_id', customer.id, { shouldValidate: true });
            }
            if (customer.name) {
              setValue('name', customer.name, { shouldValidate: true });
            }
            if (customer.fantasy_name) {
              setValue('fantasy_name', customer.fantasy_name, { shouldValidate: true });
            }
          }
        })
        .catch((error) => {
          console.error('Erro ao buscar dados do cliente:', error);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar os dados do cliente selecionado',
            variant: 'destructive',
          });
        })
        .finally(() => {
          setIsLoadingCustomer(false);
        });
    }
  }, [marveeCustomerId, customer, currentCompany?.id, setValue, toast]);

  // Reset step quando modal abrir/fechar (apenas para criação)
  useEffect(() => {
    if (open && !customer) {
      setCurrentStep(1);
    }
  }, [open, customer]);

  // Carregar dados do cliente quando o modal abrir
  useEffect(() => {
    if (open && customerData) {
      reset({
        name: customerData.name,
        fantasy_name: customerData.fantasy_name,
        guid_marvee: customerData.guid_marvee,
        marvee_id: customerData.marvee_id,
        date_initial: customerData.date_initial ? format(new Date(customerData.date_initial), 'yyyy-MM-dd') : '',
        date_final: customerData.date_final ? format(new Date(customerData.date_final), 'yyyy-MM-dd') : null,
        status: customerData.status ?? true,
        analyst_id: customerData.analyst_id ?? 1,
        fee: customerData.fee ?? null,
      });
      setAvatarUrl(customerData.avatar);
    } else if (open && !customer) {
      reset({
        name: '',
        fantasy_name: '',
        guid_marvee: '',
        marvee_id: null,
        date_initial: format(new Date(), 'yyyy-MM-dd'),
        date_final: null,
        status: true,
        analyst_id: 1,
        fee: null,
      });
      setAvatarUrl(null);
      setAvatarBase64(null);
    }
  }, [open, customerData, customer, reset]);

  const steps = useMemo(() => {
    // Steps apenas para criação
    if (!customer) {
      return [
        { id: 'marvee-customer', title: 'Cliente Marvee' },
        { id: 'basic-info', title: 'Informações Básicas' },
        { id: 'dates', title: 'Datas e Status' },
      ];
    }
    return [];
  }, [customer]);
  
  const totalSteps = steps.length;

  const handleNextStep = async () => {
    // Validate current step before moving to next
    let isValid = false;
    if (currentStep === (customer ? 1 : 2)) { // Basic Info step
      isValid = await trigger(['name', 'fantasy_name', 'guid_marvee', 'analyst_id']);
    } else if (currentStep === 1 && !customer) { // Marvee Customer selection step
      isValid = await trigger('marvee_id');
    } else if (currentStep === (customer ? 2 : 3)) { // Dates step
      isValid = await trigger('date_initial');
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: 'Erro de validação',
        description: 'Por favor, preencha todos os campos obrigatórios antes de continuar.',
        variant: 'destructive',
      });
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: CustomerFormSchema) => {
    setIsSubmitting(true);
    try {
      // Garante que fee seja sempre null ou number, nunca undefined
      const formData = {
        ...data,
        fee: data.fee ?? null,
      };

      if (customer) {
        await updateMutation.mutateAsync({ id: customer.id, data: formData });
        toast({
          title: 'Cliente atualizado',
          description: 'As informações foram atualizadas com sucesso.',
        });
      } else {
        await createMutation.mutateAsync(formData);
        toast({
          title: 'Cliente criado',
          description: 'O cliente foi cadastrado com sucesso.',
        });
      }
      onSuccess();
    } catch (error) {
      logErrorDetails('CustomerFormModal.onSubmit', error);
      toast({
        title: customer ? 'Erro ao atualizar' : 'Erro ao criar cliente',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {customer ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {customer
              ? 'Atualize as informações do cliente abaixo. Campos marcados com * são obrigatórios.'
              : 'Preencha os dados do cliente abaixo. Campos marcados com * são obrigatórios.'
            }
          </DialogDescription>
        </DialogHeader>

        {isLoadingCustomerData && customer ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando dados do cliente...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step Indicators - apenas para criação */}
              {!customer && steps.length > 0 && (
                <div className="flex justify-between items-center mb-6">
                  {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = currentStep === stepNumber;
                    const isCompleted = currentStep > stepNumber;
                    return (
                      <div key={step.id} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={cn(
                              'flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors',
                              isActive && 'border-primary bg-primary text-primary-foreground',
                              isCompleted && 'border-primary bg-primary text-primary-foreground',
                              !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <span className="text-sm font-semibold">{stepNumber}</span>
                            )}
                          </div>
                          <span className="text-xs mt-1 text-center">{step.title}</span>
                        </div>
                        {stepNumber < totalSteps && (
                          <div
                            className={cn(
                              'h-0.5 flex-1 mx-2',
                              isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 1: Seleção de Cliente Marvee (apenas em criação) */}
              {!customer && currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Selecionar Cliente Marvee</h3>
                    <p className="text-sm text-muted-foreground">
                      Selecione um cliente da base Marvee para preencher automaticamente os dados do cliente.
                    </p>
                  </div>
                  <FormField
                    control={control}
                    name="marvee_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente Marvee *</FormLabel>
                        <FormControl>
                          <AutoCompleteMCustomers
                            control={control}
                            name="marvee_id"
                            label=""
                            placeholder="Busque por nome ou CPF/CNPJ..."
                            description="Ao selecionar um cliente, os campos serão preenchidos automaticamente"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {isLoadingCustomer && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Carregando dados do cliente...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Informações Básicas - sempre visível na edição, step 2 na criação */}
              {(customer || currentStep === 2) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Informações Básicas</h3>
                    <p className="text-sm text-muted-foreground">
                      Preencha as informações básicas do cliente.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nome do cliente"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Nome Fantasia */}
                    <FormField
                      control={control}
                      name="fantasy_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Fantasia *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Nome fantasia"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* GUID Marvee */}
                    <FormField
                      control={control}
                      name="guid_marvee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>GUID Marvee *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="GUID único do cliente na Marvee"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            GUID único do cliente na plataforma Marvee
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ID Marvee */}
                    <FormField
                      control={control}
                      name="marvee_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Marvee</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="ID numérico do cliente na Marvee"
                              disabled={isSubmitting}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>
                            ID numérico do cliente na plataforma Marvee (opcional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Analista */}
                  <AutoCompleteAnalyst
                    control={control}
                    name="analyst_id"
                    label="Analista"
                    placeholder="Selecione um analista..."
                    description="Analista responsável pelo cliente"
                    required
                  />
                </div>
              )}

              {/* Avatar - sempre visível na edição, após informações básicas */}
              {customer && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Avatar</h3>
                    <p className="text-sm text-muted-foreground">
                      Atualize o avatar do cliente.
                    </p>
                  </div>
                  
                  <div className="pb-4">
                    <CustomerAvatarUpload
                      currentAvatarUrl={avatarUrl}
                      customerId={customer?.id || null}
                      customerName={watch('name') || watch('fantasy_name') || 'CL'}
                      onAvatarChange={(urlOrBase64) => {
                        // Se for base64 (data:image/...), armazena para criação
                        // Se for URL (string sem data:), armazena para edição
                        if (urlOrBase64?.startsWith('data:')) {
                          setAvatarBase64(urlOrBase64);
                        } else {
                          setAvatarUrl(urlOrBase64);
                        }
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Datas e Status - sempre visível na edição, step 3 na criação */}
              {(customer || currentStep === 3) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Datas e Status</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure as datas do contrato e o status do cliente.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Data Inicial */}
                    <FormField
                      control={control}
                      name="date_initial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Inicial *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            Data inicial do contrato/relacionamento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Data Final */}
                    <FormField
                      control={control}
                      name="date_final"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Final</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              disabled={isSubmitting}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription>
                            Data final do contrato/relacionamento (opcional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* FEE */}
                  <FormField
                    control={control}
                    name="fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>FEE</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="0,00"
                            disabled={isSubmitting}
                            value={field.value !== null && field.value !== undefined ? formatCurrency(field.value) : ''}
                            onChange={(e) => {
                              const parsed = parseCurrency(e.target.value);
                              // Garante que sempre seja null ou number, nunca undefined
                              field.onChange(parsed === null ? null : parsed);
                            }}
                            onBlur={field.onBlur}
                          />
                        </FormControl>
                        <FormDescription>
                          Valor da taxa/fee do cliente
                        </FormDescription>
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
                            {field.value ? 'Cliente ativo' : 'Cliente inativo'}
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
                </div>
              )}

              {/* Ações de navegação entre steps e submit */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                {!customer && currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={isSubmitting}
                  >
                    Anterior
                  </Button>
                )}
                {!customer && currentStep < totalSteps ? (
                  <Button type="button" onClick={handleNextStep} disabled={isSubmitting}>
                    Próximo
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>{customer ? 'Atualizar' : 'Criar'}</>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

