import { PageContent } from '@/components/layout/PageContent';
import { ListHeader } from '@/components/ListHeader';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { AutoCompleteAnalyst } from '@/components/input/AutoComplete';
import MDFaturamentoMensal from './md-faturamento-mensal';
import MDFluxoGerencial from './md-fluxo-gerencial';
import MDNPSMensal from './md-nps-mensal';
import MDCards from './md-cards';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analystsService } from '@/pages/private/analyst/services/analysts.service';

interface DashboardFilters {
  analyst_id: string | null;
}

export default function MyDashboard() {
  const { role, user } = useAuth();
  const [analystId, setAnalystId] = useState<number | null>(null);
  const hasInitialized = useRef(false);

  // Busca todos os analistas
  const { data: analysts = [] } = useQuery({
    queryKey: ['analysts-autocomplete'],
    queryFn: () => analystsService.listAnalysts(),
  });
  
  // Mostra o filtro de analista apenas para MEMBER (admin) e DEVELOPER
  const canFilterByAnalyst = role === 'MEMBER' || role === 'DEVELOPER';
  
  // Encontra o analista associado ao usuário atual
  const currentUserAnalyst = useMemo(() => {
    if (!user?.id) return null;
    return analysts.find(analyst => analyst.user_id === user.id) || null;
  }, [analysts, user?.id]);
  
  const form = useForm<DashboardFilters>({
    defaultValues: {
      analyst_id: null,
    },
  });
  
  // Observa mudanças no campo analyst_id do form
  const watchedAnalystId = useWatch({
    control: form.control,
    name: 'analyst_id',
  });
  
  // Inicializa o analystId quando os analistas carregam (só uma vez)
  useEffect(() => {
    // Se já foi inicializado, não faz nada
    if (hasInitialized.current) return;
    
    // Se os analistas ainda não carregaram, espera
    if (analysts.length === 0) return;
    
    // Se o usuário pode filtrar e tem um analista associado, usa esse
    if (currentUserAnalyst && canFilterByAnalyst) {
      const analystIdStr = String(currentUserAnalyst.id);
      form.setValue('analyst_id', analystIdStr, { shouldValidate: true });
      hasInitialized.current = true;
      return;
    } 
    
    // Se o usuário não pode filtrar OU não tem analista associado, pega o primeiro da lista
    // (fallback para quando pode filtrar mas não tem analista associado)
    if (!canFilterByAnalyst || !currentUserAnalyst) {
      const firstAnalyst = analysts[0];
      if (firstAnalyst) {
        if (canFilterByAnalyst) {
          // Se pode filtrar, atualiza o form também
          form.setValue('analyst_id', String(firstAnalyst.id), { shouldValidate: true });
        } else {
          // Se não pode filtrar, atualiza diretamente o estado
          setAnalystId(Number(firstAnalyst.id));
        }
        hasInitialized.current = true;
      }
    }
  }, [currentUserAnalyst, canFilterByAnalyst, analysts, form]);
  
  // Conecta o AutoCompleteAnalyst com o estado analystId (tem prioridade sobre a inicialização)
  useEffect(() => {
    if (watchedAnalystId !== undefined && watchedAnalystId !== null) {
      setAnalystId(Number(watchedAnalystId));
      hasInitialized.current = true; // Marca como inicializado quando o usuário seleciona manualmente
    }
  }, [watchedAnalystId]);

  return (
    <PageContent>
      <div className="p-3 space-y-3 w-full h-full overflow-y-auto">
        {/* Header */}
        <ListHeader 
          icon={LayoutDashboard} 
          title={`Meu Dashboard`}
          canCreate={false}
        >
          {canFilterByAnalyst && (
            <div className="w-[320px]">
              <FormProvider {...form}>
                <AutoCompleteAnalyst
                  control={form.control}
                  name="analyst_id"
                  label=""
                  placeholder="Filtrar por analista..."
                  required={false}
                />
              </FormProvider>
            </div>
          )}
        </ListHeader>

        {/* Cards de Métricas */}
        <MDCards analystId={analystId} />

      {/* Gráfico de Faturamento Mensal */}
      <MDFaturamentoMensal analystId={analystId} />

      {/* Gráfico de Fluxo Gerencial */}
      <MDFluxoGerencial />

      {/* Gráfico de NPS Mensal */}
      <MDNPSMensal />
      </div>
    </PageContent>
  );
}
