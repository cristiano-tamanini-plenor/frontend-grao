import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InfoDialog } from '@/components/Dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import { Switch } from '@/components/ui/switch';
import { Form } from '@/components/ui/form';
import { EmailConfigFormData, emailConfigFormSchema } from '../schemas/email-config.schemas';
import { emailConfigService, type CompanyEmailConfig } from '../services/email-config.service';

interface EmailConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string | number;
}

export function EmailConfigModal({ open, onOpenChange, companyId }: EmailConfigModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [existingConfig, setExistingConfig] = useState<CompanyEmailConfig | null>(null);

  const form = useForm<EmailConfigFormData>({
    resolver: zodResolver(emailConfigFormSchema),
    defaultValues: {
      smtp_host: '',
      smtp_port: 587,
      smtp_user: '',
      smtp_password: '',
      smtp_from_email: '',
      smtp_from_name: '',
      imap_host: '',
      imap_port: 993,
      is_active: true,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const isActive = watch('is_active');

  // Carrega configuração existente quando o modal abre
  useEffect(() => {
    if (open && companyId) {
      loadEmailConfig();
    } else {
      setExistingConfig(null);
      reset({
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_password: '',
        smtp_from_email: '',
        smtp_from_name: '',
        imap_host: '',
        imap_port: 993,
        is_active: true,
      });
    }
  }, [open, companyId]);

  const loadEmailConfig = async () => {
    setIsLoading(true);
    try {
      const config = await emailConfigService.getEmailConfig(companyId);
      setExistingConfig(config);
      reset({
        smtp_host: config.smtp_host,
        smtp_port: config.smtp_port,
        smtp_user: config.smtp_user,
        smtp_password: config.smtp_password,
        smtp_from_email: config.smtp_from_email,
        smtp_from_name: config.smtp_from_name,
        imap_host: config.imap_host,
        imap_port: config.imap_port,
        is_active: config.is_active,
      });
    } catch (error: any) {
      // Se for 404, não há configuração ainda - isso é ok
      if (error.statusCode === 404) {
        setExistingConfig(null);
        reset({
          smtp_host: '',
          smtp_port: 587,
          smtp_user: '',
          smtp_password: '',
          smtp_from_email: '',
          smtp_from_name: '',
          imap_host: '',
          imap_port: 993,
          is_active: true,
        });
      } else {
        logErrorDetails('EmailConfigModal.loadEmailConfig', error);
        toast({
          title: 'Erro ao carregar configuração',
          description: getSafeErrorMessage(error),
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EmailConfigFormData) => {
    setIsSubmitting(true);
    try {
      if (existingConfig) {
        // Update
        await emailConfigService.updateEmailConfig(companyId, {
          smtp_host: data.smtp_host,
          smtp_port: data.smtp_port,
          smtp_user: data.smtp_user,
          smtp_password: data.smtp_password,
          smtp_from_email: data.smtp_from_email,
          smtp_from_name: data.smtp_from_name,
          imap_host: data.imap_host,
          imap_port: data.imap_port,
          is_active: data.is_active,
        });

        toast({
          title: 'Configuração atualizada',
          description: 'As configurações de email foram atualizadas com sucesso.',
        });
      } else {
        // Create
        await emailConfigService.createEmailConfig(companyId, {
          smtp_host: data.smtp_host,
          smtp_port: data.smtp_port,
          smtp_user: data.smtp_user,
          smtp_password: data.smtp_password,
          smtp_from_email: data.smtp_from_email,
          smtp_from_name: data.smtp_from_name,
          imap_host: data.imap_host,
          imap_port: data.imap_port,
          is_active: data.is_active,
        });

        toast({
          title: 'Configuração criada',
          description: 'As configurações de email foram criadas com sucesso.',
        });
      }

      onOpenChange(false);
    } catch (error) {
      logErrorDetails('EmailConfigModal.onSubmit', error);
      toast({
        title: existingConfig ? 'Erro ao atualizar' : 'Erro ao criar configuração',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => onOpenChange(false)}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button 
        type="submit" 
        form="email-config-form"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Salvando...
          </>
        ) : (
          <>{existingConfig ? 'Atualizar' : 'Criar'}</>
        )}
      </Button>
    </>
  );

  return (
    <InfoDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configurações de Email"
      icon={Mail}
      width="900px"
      footer={footer}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="email-config-form">
              {/* Credenciais */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Credenciais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome de usuário */}
                  <div className="space-y-2">
                    <Label htmlFor="smtp_user">Nome de usuário *</Label>
                    <Input
                      id="smtp_user"
                      type="email"
                      {...register('smtp_user')}
                      placeholder="usuario@exemplo.com"
                      disabled={isSubmitting}
                    />
                    {errors.smtp_user && (
                      <p className="text-sm text-destructive">{errors.smtp_user.message}</p>
                    )}
                  </div>

                  {/* Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="smtp_password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="smtp_password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('smtp_password')}
                        placeholder="••••••••••••"
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.smtp_password && (
                      <p className="text-sm text-destructive">{errors.smtp_password.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Servidor de Entrada (IMAP) */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Servidor de Entrada (IMAP)</h3>
                <div className="space-y-4">
                  {/* Servidor e Porta lado a lado */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Host IMAP */}
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="imap_host">Servidor *</Label>
                      <Input
                        id="imap_host"
                        {...register('imap_host')}
                        placeholder="imap.gmail.com"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ex: imap.gmail.com, imap.outlook.com
                      </p>
                      {errors.imap_host && (
                        <p className="text-sm text-destructive">{errors.imap_host.message}</p>
                      )}
                    </div>

                    {/* Porta IMAP */}
                    <div className="space-y-2 w-full md:w-32">
                      <Label htmlFor="imap_port">Porta *</Label>
                      <Input
                        id="imap_port"
                        type="number"
                        {...register('imap_port', { valueAsNumber: true })}
                        placeholder="993"
                        disabled={isSubmitting}
                        min={1}
                        max={65535}
                      />
                      {errors.imap_port && (
                        <p className="text-sm text-destructive">{errors.imap_port.message}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Portas comuns: 993 (SSL), 143 (TLS)
                  </p>
                </div>
              </div>

              {/* Servidor de Saída (SMTP) */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="text-sm font-semibold text-foreground">Servidor de Saída (SMTP)</h3>
                <div className="space-y-4">
                  {/* Servidor e Porta lado a lado */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Host SMTP */}
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="smtp_host">Servidor *</Label>
                      <Input
                        id="smtp_host"
                        {...register('smtp_host')}
                        placeholder="smtp.gmail.com"
                        disabled={isSubmitting}
                      />
                      <p className="text-xs text-muted-foreground">
                        Ex: smtp.gmail.com, smtp.outlook.com
                      </p>
                      {errors.smtp_host && (
                        <p className="text-sm text-destructive">{errors.smtp_host.message}</p>
                      )}
                    </div>

                    {/* Porta SMTP */}
                    <div className="space-y-2 w-full md:w-32">
                      <Label htmlFor="smtp_port">Porta *</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        {...register('smtp_port', { valueAsNumber: true })}
                        placeholder="587"
                        disabled={isSubmitting}
                        min={1}
                        max={65535}
                      />
                      {errors.smtp_port && (
                        <p className="text-sm text-destructive">{errors.smtp_port.message}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Portas comuns: 587 (TLS), 465 (SSL)
                  </p>
                </div>
              </div>

              {/* Informações do Remetente */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">Informações do Remetente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email Remetente */}
                  <div className="space-y-2">
                    <Label htmlFor="smtp_from_email">Email Remetente *</Label>
                    <Input
                      id="smtp_from_email"
                      type="email"
                      {...register('smtp_from_email')}
                      placeholder="noreply@empresa.com"
                      disabled={isSubmitting}
                    />
                    {errors.smtp_from_email && (
                      <p className="text-sm text-destructive">{errors.smtp_from_email.message}</p>
                    )}
                  </div>

                  {/* Nome Remetente */}
                  <div className="space-y-2">
                    <Label htmlFor="smtp_from_name">Nome Remetente *</Label>
                    <Input
                      id="smtp_from_name"
                      {...register('smtp_from_name')}
                      placeholder="Nome da Empresa"
                      disabled={isSubmitting}
                    />
                    {errors.smtp_from_name && (
                      <p className="text-sm text-destructive">{errors.smtp_from_name.message}</p>
                    )}
                  </div>
                </div>
              </div>

            {/* Status */}
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Status</Label>
                <p className="text-sm text-muted-foreground">
                  {isActive ? 'Configuração ativa' : 'Configuração inativa'}
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
                disabled={isSubmitting}
              />
            </div>
          </form>
        </Form>
      )}
    </InfoDialog>
  );
}

