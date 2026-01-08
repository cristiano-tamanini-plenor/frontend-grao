import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form } from '@/components/ui/form';
import { InputSelect } from '@/components/input/InputSelect';

import { useToast } from '@/hooks/use-toast';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import { formatCNPJ } from '@/lib/utils/cnpj';
import { UserWithRole } from '../types';
import { Company } from '@/pages/private/company/types';
import { companiesService } from '@/pages/private/company/services/companies.service';
import { userCompaniesService } from '../services/user-companies.service';
import { userProfilesService } from '@/pages/private/user-profile/services/user-profiles.service';
import { useQuery } from '@tanstack/react-query';

const addUserCompanySchema = z.object({
  company_id: z.string().min(1, 'Selecione uma empresa'),
  user_profile_id: z.string().optional(),
});

type AddUserCompanyFormData = z.infer<typeof addUserCompanySchema>;

interface AddUserCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserWithRole | null;
  existingCompanyIds: string[];
  onSuccess: () => void;
}

export function AddUserCompanyModal({
  open,
  onOpenChange,
  user,
  existingCompanyIds,
  onSuccess,
}: AddUserCompanyModalProps) {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comboOpen, setComboOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const form = useForm<AddUserCompanyFormData>({
    resolver: zodResolver(addUserCompanySchema),
    defaultValues: {
      company_id: '',
      user_profile_id: '',
    },
  });
  
  const selectedCompanyId = form.watch('company_id');
  
  // Buscar perfis da empresa selecionada
  const { data: userProfiles = [], isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['user-profiles', selectedCompanyId],
    queryFn: () => {
      if (!selectedCompanyId) return Promise.resolve([]);
      return userProfilesService.getProfilesByCompany(selectedCompanyId);
    },
    enabled: !!selectedCompanyId,
  });
  
  const userProfileOptions = userProfiles.map((profile) => ({
    value: profile.id,
    label: profile.name,
  }));

  useEffect(() => {
    if (open) {
      loadCompanies();
      form.reset({ company_id: '', user_profile_id: '' });
    }
  }, [open, form]);

  // Resetar perfil quando a empresa mudar (mas não na primeira renderização)
  const prevCompanyIdRef = useRef<string>('');
  useEffect(() => {
    if (prevCompanyIdRef.current && prevCompanyIdRef.current !== selectedCompanyId) {
      form.setValue('user_profile_id', '');
    }
    prevCompanyIdRef.current = selectedCompanyId || '';
  }, [selectedCompanyId, form]);

  // Permitir scroll com mouse wheel
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !comboOpen) return;

    const handleWheel = (e: WheelEvent) => {
      e.stopPropagation();
      // Permitir o scroll nativo
      scrollElement.scrollTop += e.deltaY;
    };

    scrollElement.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollElement.removeEventListener('wheel', handleWheel);
    };
  }, [comboOpen]);

  const loadCompanies = async () => {
    try {
      setIsLoading(true);
      const allCompanies = await companiesService.listAllCompanies();
      // Filter out companies already associated
      const availableCompanies = allCompanies.filter(
        (company) => !existingCompanyIds.includes(company.id)
      );
      setCompanies(availableCompanies);
    } catch (error) {
      logErrorDetails('AddUserCompanyModal.loadCompanies', error);
      toast({
        title: 'Erro ao carregar empresas',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: AddUserCompanyFormData) => {
    if (!user) return;

    try {
      await userCompaniesService.addUserCompany(user.id, data.company_id, data.user_profile_id);
      toast({
        title: 'Empresa associada',
        description: 'A empresa foi associada ao usuário com sucesso.',
      });
      onSuccess();
    } catch (error) {
      logErrorDetails('AddUserCompanyModal.handleSubmit', error);
      toast({
        title: 'Erro ao associar empresa',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    }
  };

  const selectedCompany = companies.find((c) => c.id === form.watch('company_id'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="max-w-md w-full mx-4 overflow-visible">
        <DialogHeader>
          <DialogTitle>Associar Nova Empresa</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 min-w-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando empresas...</p>
              </div>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Não há empresas disponíveis para associação
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Empresa</label>
                  <Popover open={comboOpen} onOpenChange={setComboOpen} modal={false}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboOpen}
                        className="w-full justify-between min-w-0 overflow-hidden"
                      >
                        {selectedCompany ? (
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <Avatar className="h-6 w-6 shrink-0">
                              <AvatarImage src={selectedCompany.avatar_url || undefined} />
                              <AvatarFallback>
                                {selectedCompany.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-left">{selectedCompany.name}</span>
                          </div>
                        ) : (
                          <span className="text-left">Selecione uma empresa...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-[--radix-popover-trigger-width] max-w-[--radix-popover-content-available-width] p-0 z-[100]" 
                      align="start"
                      side="bottom"
                      sideOffset={4}
                      onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                      <Command className="max-h-none">
                        <CommandInput placeholder="Buscar empresa..." className="h-9" />
                        <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                        <div
                          ref={scrollRef}
                          className="max-h-64 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
                          style={{ 
                            pointerEvents: 'auto',
                            touchAction: 'pan-y',
                            overscrollBehavior: 'contain'
                          }}
                        >
                        <CommandGroup>
                          {companies.map((company) => (
                            <CommandItem
                              key={company.id}
                              value={company.name}
                              onSelect={() => {
                                form.setValue('company_id', company.id);
                                setComboOpen(false);
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4 flex-shrink-0',
                                  form.watch('company_id') === company.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
                                <AvatarImage src={company.avatar_url || undefined} />
                                <AvatarFallback>
                                  {company.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{company.name}</div>
                                {company.cnpj && (
                                  <div className="text-xs text-muted-foreground">
                                    {formatCNPJ(company.cnpj)}
                                  </div>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        </div>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  {!selectedCompanyId ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Perfil de Usuário</label>
                      <div className="text-sm text-muted-foreground">
                        Selecione uma empresa primeiro para escolher o perfil
                      </div>
                    </div>
                  ) : isLoadingProfiles ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Perfil de Usuário</label>
                      <div className="text-sm text-muted-foreground">Carregando perfis...</div>
                    </div>
                  ) : userProfileOptions.length > 0 ? (
                    <InputSelect
                      control={form.control}
                      name="user_profile_id"
                      label="Perfil de Usuário"
                      placeholder="Selecione o perfil (opcional)"
                      description="Selecione o perfil para esta empresa (opcional)"
                      options={userProfileOptions}
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Perfil de Usuário</label>
                      <div className="text-sm text-muted-foreground">
                        Nenhum perfil de usuário cadastrado para esta empresa.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="shrink-0"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.watch('company_id') || form.formState.isSubmitting}
                    className="shrink-0"
                  >
                    {form.formState.isSubmitting ? 'Associando...' : 'Associar'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

