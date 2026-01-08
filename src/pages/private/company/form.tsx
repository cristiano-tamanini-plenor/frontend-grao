import { useEffect, useState, useMemo, Fragment } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InfoDialog } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, FileCheck, AlertCircle, Shield, Download, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import { Switch } from '@/components/ui/switch';
import { applyCNPJMask, cleanCNPJ } from '@/lib/utils/cnpj';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Company } from './types';
import { CompanyFormData, companyFormSchema } from './schemas/company.schemas';
import { companiesService } from './services/companies.service';
import { Badge } from '@/components/ui/badge';
import { AutoCompletePlanos, AutoCompleteCustomers, AutoCompleteCustomerUnassociated } from '@/components/input/AutoComplete';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { CompanyAvatarUpload } from './components/CompanyAvatarUpload';
import { customersService as marveeCustomersService } from '@/pages/private/@marvee/customer/services/customers.service';
import { customersService } from '@/pages/private/customer/services/customers.service';
import { useCompany } from './hooks/useCompany';
import { cn } from '@/lib/utils';

interface CompanyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  onSuccess: () => void;
}

export function CompanyFormModal({ open, onOpenChange, company, onSuccess }: CompanyFormModalProps) {
  const { toast } = useToast();
  const { role, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Reset step quando o modal abre
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
    }
  }, [open]);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  
  // Determina se deve mostrar o campo de plano
  // Verifica tanto pelo role quanto pelo type_user diretamente (fallback)
  // Apenas OWNER e DEVELOPER podem ver o campo
  const canSeePlanField = useMemo(() => {
    const hasRole = role === 'OWNER' || role === 'DEVELOPER';
    const hasTypeUser = user?.type_user === 'owner' || user?.type_user === 'developer';
    const result = hasRole || hasTypeUser;
    
    return result;
  }, [role, user]);
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null); // Base64 para criação
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateFileName, setCertificateFileName] = useState<string>('');
  const [alterCertificate, setAlterCertificate] = useState(false);
  const [fullCompanyData, setFullCompanyData] = useState<Company | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  
  // Total de steps - apenas para criação
  const totalSteps = 5; // Em criação: 5 steps (com seleção de cliente e avatar)
  // Em edição: sem steps, todos os campos em uma única tela

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      is_active: true,
      marvee_customer_id: null,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, dirtyFields },
  } = form;

  const isActive = watch('is_active');
  const customerId = watch('customer_id');
  const marveeCustomerId = watch('marvee_customer_id');
  const { currentCompany } = useCompany();

  // Quando selecionar um cliente, buscar os dados e preencher automaticamente
  useEffect(() => {
    if (customerId && !company) {
      setIsLoadingCustomer(true);
      customersService.getCustomerById(customerId)
        .then((customer) => {
          // Preencher campos automaticamente com dados do cliente
          if (customer) {
            // Buscar o cliente Marvee correspondente pelo guid_marvee
            if (customer.guid_marvee && currentCompany?.id) {
              // Buscar na lista de clientes Marvee
              marveeCustomersService.listCustomers(currentCompany.id, { page: 1, pageSize: 1000 })
                .then((marveeResponse) => {
                  const marveeCustomers = Array.isArray(marveeResponse) ? marveeResponse : marveeResponse.data || [];
                  const marveeCustomer = marveeCustomers.find(c => c.guid === customer.guid_marvee);
                  
                  if (marveeCustomer) {
                    // Preencher campos com dados do cliente Marvee
                    if (marveeCustomer.cnpjcpf) {
                      const maskedCnpj = applyCNPJMask(marveeCustomer.cnpjcpf.replace(/\D/g, ''));
                      setValue('cnpj', maskedCnpj, { shouldValidate: true });
                    }
                    if (marveeCustomer.name) {
                      setValue('name', marveeCustomer.name, { shouldValidate: true });
                    }
                    if (marveeCustomer.fantasy_name) {
                      setValue('system_nickname', marveeCustomer.fantasy_name, { shouldValidate: true });
                    }
                    // Armazenar o ID do cliente Marvee
                    if (marveeCustomer.id) {
                      setValue('marvee_customer_id', marveeCustomer.id, { shouldValidate: true });
                    }
                  } else {
                    // Se não encontrar na Marvee, usar dados do cliente local
                    if (customer.name) {
                      setValue('name', customer.name, { shouldValidate: true });
                    }
                    if (customer.fantasy_name) {
                      setValue('system_nickname', customer.fantasy_name, { shouldValidate: true });
                    }
                  }
                })
                .catch((error) => {
                  console.error('Erro ao buscar dados do cliente Marvee:', error);
                  // Se falhar, usar dados do cliente local
                  if (customer.name) {
                    setValue('name', customer.name, { shouldValidate: true });
                  }
                  if (customer.fantasy_name) {
                    setValue('system_nickname', customer.fantasy_name, { shouldValidate: true });
                  }
                })
                .finally(() => {
                  setIsLoadingCustomer(false);
                });
            } else {
              // Se não tiver guid_marvee ou currentCompany, usar apenas dados do cliente local
              if (customer.name) {
                setValue('name', customer.name, { shouldValidate: true });
              }
              if (customer.fantasy_name) {
                setValue('system_nickname', customer.fantasy_name, { shouldValidate: true });
              }
              setIsLoadingCustomer(false);
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
          setIsLoadingCustomer(false);
        });
    }
  }, [customerId, company, currentCompany?.id, setValue, toast]);

  // Reset step quando modal abrir/fechar
  useEffect(() => {
    if (open) {
      setCurrentStep(company ? 1 : 1); // Se for edição, começa no step 1, senão no step 1 (seleção de cliente)
    } else {
      setCurrentStep(1);
    }
  }, [open, company]);

  // Buscar dados completos da empresa quando o modal abrir e houver uma empresa
  useEffect(() => {
    if (open && company?.id) {
      setIsLoadingCompany(true);
      companiesService.getCompanyById(company.id)
        .then((fullData) => {
          setFullCompanyData(fullData);
        })
        .catch((error) => {
          console.error('Erro ao buscar dados completos da empresa:', error);
          // Se falhar, usa os dados parciais que já temos
          setFullCompanyData(company);
        })
        .finally(() => {
          setIsLoadingCompany(false);
        });
    } else {
      setFullCompanyData(company);
    }
  }, [open, company?.id]);

  useEffect(() => {
    // Usa fullCompanyData se disponível, senão usa company
    const companyToUse = fullCompanyData || company;
    
    if (companyToUse) {
      reset({
        cnpj: companyToUse.cnpj || '',
        name: companyToUse.name,
        system_nickname: companyToUse.system_nickname || '',
        legal_representative: companyToUse.legal_representative || '',
        legal_email: companyToUse.legal_email || '',
        legal_phone: companyToUse.legal_phone || '',
        client_id: companyToUse.client_id || '',
        client_secret: companyToUse.client_secret || '',
        is_active: companyToUse.is_active,
        plan_id: companyToUse.plan_id || null,
        customer_id: companyToUse.customer_id || undefined,
        alter_certificate: false,
        certificate: undefined,
        certificate_password: '',
      });
      setAvatarUrl(companyToUse.avatar_url);
      setAlterCertificate(false);
    } else {
      reset({
        cnpj: '',
        name: '',
        system_nickname: '',
        legal_representative: '',
        legal_email: '',
        legal_phone: '',
        client_id: '',
        client_secret: '',
        is_active: true,
        plan_id: null,
        customer_id: undefined,
        alter_certificate: false,
        certificate: undefined,
        certificate_password: '',
      });
      setAvatarUrl(null);
      setAvatarBase64(null); // Limpa base64 ao criar nova
      setAlterCertificate(false);
    }
    setCertificateFile(null);
    setCertificateFileName('');
  }, [fullCompanyData, company, reset, open]);

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar extensão .pfx
      if (!file.name.toLowerCase().endsWith('.pfx')) {
        toast({
          title: 'Arquivo inválido',
          description: 'Apenas arquivos .pfx são aceitos',
          variant: 'destructive',
        });
        return;
      }
      setCertificateFile(file);
      setCertificateFileName(file.name);
      setValue('certificate', file);
      if (!company || alterCertificate) {
        setValue('alter_certificate', true);
      }
    }
  };

  // Extrai o nome do arquivo do certificate_path
  const getCertificateFileName = (certificatePath: string | null | undefined): string => {
    if (!certificatePath) return 'certificado.pfx';
    const fileName = certificatePath.split('/').pop() || '';
    // Remove o prefixo "company-{id}-certificate-" se existir
    const cleanFileName = fileName.replace(/^company-\d+-certificate-/, '');
    return cleanFileName || 'certificado.pfx';
  };

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    try {
      const companyToUpdate = fullCompanyData || company;
      
      if (companyToUpdate) {
        // Update - converte strings vazias para undefined/null conforme necessário
        const updateData: any = {
          name: data.name,
          system_nickname: data.system_nickname || null,
          is_active: data.is_active,
        };

        // Adiciona campos opcionais apenas se tiverem valor
        if (data.legal_representative && data.legal_representative.trim()) {
          updateData.legal_representative = data.legal_representative;
        } else {
          updateData.legal_representative = null;
        }

        if (data.legal_email && data.legal_email.trim()) {
          updateData.legal_email = data.legal_email;
        } else {
          updateData.legal_email = null;
        }

        if (data.legal_phone && data.legal_phone.trim()) {
          updateData.legal_phone = data.legal_phone;
        } else {
          updateData.legal_phone = null;
        }

        if (data.client_id && data.client_id.trim()) {
          updateData.client_id = data.client_id;
        } else {
          updateData.client_id = null;
        }

        if (data.client_secret && data.client_secret.trim()) {
          updateData.client_secret = data.client_secret;
        } else {
          updateData.client_secret = null;
        }

        // avatar_url não é enviado na atualização - o avatar é gerenciado separadamente

        if (data.cnpj && data.cnpj.trim()) {
          updateData.cnpj = cleanCNPJ(data.cnpj);
        } else {
          updateData.cnpj = null;
        }

        if (data.plan_id) {
          updateData.plan_id = data.plan_id;
        } else {
          updateData.plan_id = null;
        }

        if (data.customer_id) {
          updateData.customer_id = data.customer_id;
        } else {
          updateData.customer_id = null;
        }

        // Se houver certificado para atualizar
        if (alterCertificate && certificateFile && data.certificate_password) {
          updateData.alter_certificate = true;
          updateData.certificate = certificateFile;
          updateData.certificate_password = data.certificate_password;
        }

        const updatedCompany = await companiesService.updateCompany(companyToUpdate.id, updateData);
        setFullCompanyData(updatedCompany);

        // Em edição, sempre finaliza após atualizar
        toast({
          title: 'Empresa atualizada',
          description: 'As informações foram atualizadas com sucesso.',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        // Create
        const createData: any = {
          name: data.name,
          system_nickname: data.system_nickname,
          legal_representative: data.legal_representative || undefined,
          legal_email: data.legal_email || undefined,
          legal_phone: data.legal_phone || undefined,
          client_id: data.client_id || undefined,
          client_secret: data.client_secret || undefined,
          cnpj: data.cnpj ? cleanCNPJ(data.cnpj) : undefined,
          plan_id: data.plan_id || undefined,
          customer_id: data.customer_id,
          // Envia avatar como base64 se disponível (conforme documentação)
          avatar: avatarBase64 || undefined,
        };

        // Se houver certificado
        if (certificateFile && data.certificate_password) {
          createData.certificate = certificateFile;
          createData.certificate_password = data.certificate_password;
        }

        const newCompany = await companiesService.createCompany(createData);
        setFullCompanyData(newCompany);

        // Avança para o último step (avatar)
        setCurrentStep(totalSteps);
        toast({
          title: 'Empresa criada',
          description: 'A empresa foi criada com sucesso. Agora você pode adicionar o logo.',
        });
      }
    } catch (error) {
      logErrorDetails('CompanyFormModal.onSubmit', error);
      toast({
        title: company ? 'Erro ao atualizar' : 'Erro ao criar empresa',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Footer com botões de navegação e ação
  const footer = (
    <div className="flex justify-between gap-2 w-full">
      <div className="flex gap-2">
        {/* Botão Anterior - apenas na criação */}
        {!company && currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
      <div className="flex gap-2">
        {/* Modo Edição: apenas botão Atualizar */}
        {company ? (
          <Button type="submit" form="company-form" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              'Atualizar'
            )}
          </Button>
        ) : (
          /* Modo Criação: navegação entre steps */
          <>
            {/* Botão Próximo - aparece até o penúltimo step */}
            {currentStep < totalSteps - 1 && (
              <Button
                type="button"
                onClick={() => {
                  // Validar campos do step atual antes de avançar
                  const stepFields: Record<number, (keyof CompanyFormData)[]> = {
                    1: ['marvee_customer_id'],
                    2: ['cnpj', 'name', 'system_nickname'],
                    3: [],
                    4: [],
                    5: [],
                  };
                  const fieldsToValidate = stepFields[currentStep] || [];
                  
                  // Trigger validation apenas dos campos do step atual
                  form.trigger(fieldsToValidate as any).then((isValid) => {
                    if (isValid) {
                      setCurrentStep(currentStep + 1);
                    }
                  });
                }}
                disabled={isSubmitting}
              >
                Próximo
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {/* Botão Criar - aparece no penúltimo step (step 4) */}
            {currentStep === totalSteps - 1 && (
              <Button type="submit" form="company-form" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar'
                )}
              </Button>
            )}
            {/* Botão Finalizar - aparece no último step (avatar) */}
            {currentStep === totalSteps && (
              <Button
                type="button"
                onClick={() => {
                  onSuccess();
                  onOpenChange(false);
                }}
              >
                Finalizar
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <InfoDialog
      open={open}
      onOpenChange={onOpenChange}
      title={company ? 'Editar Empresa' : 'Nova Empresa'}
      description={
        company 
          ? 'Atualize as informações da empresa abaixo. Campos marcados com * são obrigatórios.'
          : 'Preencha os dados da empresa abaixo. Campos marcados com * são obrigatórios.'
      }
      width="800px"
      footer={footer}
    >
      {isLoadingCompany && company ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando dados da empresa...</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="company-form">
            {/* Indicador de Steps - apenas para criação */}
            {!company && (
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-2 w-full max-w-md">
                  {[1, 2, 3, 4, 5].map((step, index) => {
                    const isActive = currentStep === step;
                    const isCompleted = currentStep > step;
                    const isLast = index === 4;
                    
                    return (
                      <Fragment key={step}>
                        <div className="flex items-center">
                          <div
                            className={cn(
                              'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors shrink-0',
                              isActive && 'border-primary bg-primary text-primary-foreground',
                              isCompleted && 'border-primary bg-primary text-primary-foreground',
                              !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-semibold">{step}</span>
                            )}
                          </div>
                        </div>
                        {!isLast && (
                          <div
                            className={cn(
                              'h-0.5 flex-1 min-w-[40px]',
                              isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                            )}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 1: Seleção de Cliente (apenas em criação) */}
            {!company && currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Selecionar Cliente</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecione um cliente não associado a nenhuma empresa para preencher automaticamente os dados da empresa.
                  </p>
                </div>
                <AutoCompleteCustomerUnassociated
                  control={control}
                  name="customer_id"
                  label="Cliente"
                  placeholder="Selecione um cliente não associado..."
                  description="Ao selecionar um cliente, os campos CNPJ, Nome e Apelido Sistema serão preenchidos automaticamente"
                  required
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
            {(company || currentStep === 2) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
                  <p className="text-sm text-muted-foreground">
                    Preencha as informações básicas da empresa.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CNPJ */}
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    {...register('cnpj')}
                    placeholder="00.000.000/0000-00"
                    disabled={isSubmitting}
                    onChange={(e) => {
                      const masked = applyCNPJMask(e.target.value);
                      setValue('cnpj', masked);
                    }}
                    maxLength={18}
                  />
                  <p className="text-xs text-muted-foreground">Apenas números</p>
                  {errors.cnpj && (
                    <p className="text-sm text-destructive">{errors.cnpj.message}</p>
                  )}
                </div>

                {/* Apelido Sistema */}
                <div className="space-y-2">
                  <Label htmlFor="system_nickname">Apelido Sistema *</Label>
                  <Input
                    id="system_nickname"
                    {...register('system_nickname')}
                    placeholder="Ex: Emp01"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome curto que aparecerá no seletor da sidebar
                  </p>
                  {errors.system_nickname && (
                    <p className="text-sm text-destructive">{errors.system_nickname.message}</p>
                  )}
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Empresa *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ex: Empresa LTDA"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

                {/* Plano - Apenas para OWNER e DEVELOPER */}
                {canSeePlanField && (
                  <AutoCompletePlanos
                    control={control}
                    name="plan_id"
                    label="Plano"
                    placeholder="Selecione um plano"
                    description="Plano associado à empresa"
                  />
                )}

                {/* Cliente */}
                <AutoCompleteCustomers
                  control={control}
                  name="customer_id"
                  label="Cliente"
                  placeholder="Selecione um cliente..."
                  description="Cliente associado à empresa"
                  disabled={company ? !dirtyFields.customer_id && !!customerId : false}
                />
              </div>
            )}

            {/* Responsável Legal e Credenciais - sempre visível na edição, step 3 na criação */}
            {(company || currentStep === 3) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Responsável Legal e Credenciais</h3>
                  <p className="text-sm text-muted-foreground">
                    Preencha as informações do responsável legal e credenciais de API.
                  </p>
                </div>

                {/* Informações do Responsável Legal */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Responsável Legal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Responsável Legal */}
                <div className="space-y-2">
                  <Label htmlFor="legal_representative">Nome Completo</Label>
                  <Input
                    id="legal_representative"
                    {...register('legal_representative')}
                    placeholder="Nome completo"
                    disabled={isSubmitting}
                  />
                  {errors.legal_representative && (
                    <p className="text-sm text-destructive">{errors.legal_representative.message}</p>
                  )}
                </div>

                {/* Celular Responsável */}
                <div className="space-y-2">
                  <Label htmlFor="legal_phone">Celular</Label>
                  <Input
                    id="legal_phone"
                    type="tel"
                    {...register('legal_phone')}
                    placeholder="+5547999999999"
                    disabled={isSubmitting}
                  />
                  {errors.legal_phone && (
                    <p className="text-sm text-destructive">{errors.legal_phone.message}</p>
                  )}
                </div>
              </div>

              {/* Email Responsável */}
              <div className="space-y-2">
                <Label htmlFor="legal_email">E-mail</Label>
                <Input
                  id="legal_email"
                  type="email"
                  {...register('legal_email')}
                  placeholder="email@empresa.com"
                  disabled={isSubmitting}
                />
                {errors.legal_email && (
                  <p className="text-sm text-destructive">{errors.legal_email.message}</p>
                )}
              </div>
                </div>

                {/* Credenciais de API */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">Credenciais de API</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Client ID */}
                    <div className="space-y-2">
                      <Label htmlFor="client_id">Client ID</Label>
                      <Input
                        id="client_id"
                        {...register('client_id')}
                        placeholder="client_id_123"
                        disabled={isSubmitting}
                      />
                      {errors.client_id && (
                        <p className="text-sm text-destructive">{errors.client_id.message}</p>
                      )}
                    </div>

                    {/* Client Secret */}
                    <div className="space-y-2">
                      <Label htmlFor="client_secret">Client Secret</Label>
                      <Input
                        id="client_secret"
                        type="password"
                        {...register('client_secret')}
                        placeholder="••••••••••••"
                        disabled={isSubmitting}
                      />
                      {errors.client_secret && (
                        <p className="text-sm text-destructive">{errors.client_secret.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Certificado Digital (apenas em criação) */}
            {!company && currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Certificado Digital</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure o certificado digital da empresa.
                  </p>
                </div>

                {/* Certificado Digital */}
                <div className="space-y-4">
                  {/* Informações do certificado existente (apenas em edição) */}
              {(fullCompanyData || company) && ((fullCompanyData || company)?.certificate_imported || (fullCompanyData || company)?.certificate_path) && !alterCertificate && (
                <div className="p-6 border rounded-lg bg-card space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {getCertificateFileName((fullCompanyData || company)?.certificate_path)}
                          </span>
                          {(fullCompanyData || company)?.certificate_path && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              title="Download do certificado"
                              onClick={() => {
                                // TODO: Implementar download do certificado quando a rota estiver disponível
                                toast({
                                  title: 'Download',
                                  description: 'Funcionalidade de download em desenvolvimento',
                                });
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        {(fullCompanyData || company)?.certificate_validity && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-muted-foreground">
                              Vence em: {new Date((fullCompanyData || company)!.certificate_validity!).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950"
                      onClick={() => {
                        setAlterCertificate(true);
                        setCertificateFile(null);
                        setCertificateFileName('');
                        setValue('certificate', undefined);
                        setValue('certificate_password', '');
                      }}
                      disabled={isSubmitting}
                    >
                      Alterar Certificado
                    </Button>
                  </div>
                </div>
              )}

              {/* Campos de certificado (criação ou alteração) */}
              {(!company || alterCertificate) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificate">Arquivo do Certificado (.pfx)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pfx"
                        onChange={handleCertificateChange}
                        className="hidden"
                        id="certificate-upload"
                        disabled={isSubmitting}
                      />
                      <Label htmlFor="certificate-upload" className="cursor-pointer flex-1">
                        <Button type="button" variant="outline" size="sm" asChild className="w-full">
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {certificateFileName || 'Selecionar arquivo .pfx'}
                          </span>
                        </Button>
                      </Label>
                    </div>
                    {certificateFileName && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FileCheck className="h-3 w-3" />
                        {certificateFileName}
                      </p>
                    )}
                    {errors.certificate && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.certificate.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Apenas arquivos .pfx são aceitos. Tamanho máximo: 10MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificate_password">Senha do Certificado</Label>
                    <Input
                      id="certificate_password"
                      type="password"
                      {...register('certificate_password')}
                      placeholder="Digite a senha do certificado"
                      disabled={isSubmitting}
                    />
                    {errors.certificate_password && (
                      <p className="text-sm text-destructive">{errors.certificate_password.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      A senha será criptografada antes de ser armazenada
                    </p>
                  </div>

                  {company && alterCertificate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setAlterCertificate(false);
                        setCertificateFile(null);
                        setCertificateFileName('');
                        setValue('certificate', undefined);
                        setValue('certificate_password', '');
                        setValue('alter_certificate', false);
                      }}
                      disabled={isSubmitting}
                    >
                      Cancelar alteração
                    </Button>
                  )}
                </div>
              )}

              {/* Mensagem quando não há certificado (apenas em edição) */}
              {(fullCompanyData || company) && !(fullCompanyData || company)?.certificate_imported && !(fullCompanyData || company)?.certificate_path && !alterCertificate && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhum certificado digital importado
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAlterCertificate(true)}
                    disabled={isSubmitting}
                  >
                    Importar Certificado
                  </Button>
                </div>
              )}
                </div>
              </div>
            )}

            {/* Avatar - na edição só aparece se tiver customer_id, step 5 na criação */}
            {((company && customerId) || currentStep === 5) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Logo da Empresa</h3>
                  <p className="text-sm text-muted-foreground">
                    {company ? 'Atualize o logo da empresa ou saia do formulário.' : 'Adicione o logo da empresa ou saia do formulário.'}
                  </p>
                </div>
                
                {/* Avatar Upload */}
                <div className="pb-4">
                  <CompanyAvatarUpload
                    currentAvatarUrl={avatarUrl}
                    companyId={fullCompanyData?.id || company?.id || null}
                    companyName={fullCompanyData?.name || company?.name || watch('name') || 'EM'}
                    onAvatarChange={(urlOrBase64) => {
                      // Se for base64 (data:image/...), armazena para criação
                      // Se for URL (string sem data:), armazena para edição
                      if (urlOrBase64?.startsWith('data:')) {
                        setAvatarBase64(urlOrBase64);
                      } else {
                        setAvatarUrl(urlOrBase64);
                        // Não seta avatar_url no form - não é enviado para API
                      }
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            {/* Status - sempre visível na edição */}
            {company && (
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? 'Empresa ativa' : 'Empresa inativa'}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                  disabled={isSubmitting}
                />
              </div>
            )}

          </form>
        </Form>
      )}
    </InfoDialog>
  );
}

