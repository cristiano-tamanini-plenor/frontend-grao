import { useQuery } from '@tanstack/react-query';
import { planStructureService, PlanStructure } from '../services/plan-structure.service';
import { filterPlanStructureByPermissions } from '../services/filtered-plan-structure.service';
import { useUserProfilePermissions } from '@/hooks/useUserProfilePermissions';

export const usePlanStructure = (companyId: string | null) => {
  const { permissions, isOwner } = useUserProfilePermissions();
  
  const { data: rawPlanStructure, ...queryResult } = useQuery<PlanStructure | null>({
    queryKey: ['plan-structure', companyId],
    queryFn: () => {
      if (!companyId) return Promise.resolve(null);
      return planStructureService.getPlanStructureByCompany(companyId);
    },
    enabled: !!companyId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filtrar a estrutura do plano baseado nas permissões do usuário
  const filteredPlanStructure = filterPlanStructureByPermissions(
    rawPlanStructure,
    permissions,
    isOwner
  );

  return {
    ...queryResult,
    data: filteredPlanStructure,
  };
};
