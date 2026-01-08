import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import DataGrid from '@/components/DataGrid';
import { useMemo } from 'react';
import { useGerencialPlans } from './hooks/useGerencialPlan';
import type { GerencialPlan } from './types';
import { GerencialPlanType } from './types';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { cn } from '@/lib/utils';

export default function GerencialPlan() {
  const navigate = useNavigate();
  // Por enquanto, libera tudo (sem permissionamento)
  const canCreate = true;
  const canEdit = true;
  const { currentCompany } = useCompany();
  const companyIdNumber = currentCompany?.id ? Number(currentCompany.id) : undefined;

  const { data: plans = [], isLoading } = useGerencialPlans(companyIdNumber);

  const columns = useMemo(() => {
    return [
      {
        key: 'description',
        header: 'Descrição',
        accessorKey: 'description',
        minWidth: 300,
        flex: true,
        cell: (_: any, row: GerencialPlan) => {
          // Negrito quando level é primary ou secondary, ou quando type é result
          const isBold = 
            (row.level === 'primary' || row.level === 'secondary') ||
            row.type === GerencialPlanType.RESULT;
          return (
            <span className={cn("text-sm", isBold && 'font-bold')}>
              {row.description || '—'}
            </span>
          );
        },
      },
    ];
  }, []);

  const handleRowDoubleClick = (row: any, id: any) => {
    if (canEdit) {
      navigate(`/plano-gerencial/form?id=${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader
          icon={FileText}
          title="Plano Gerencial"
          canCreate={canCreate}
          addButtonRoute="/plano-gerencial/form"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <DataGrid
          id="gerencial-plans-grid"
          data={plans}
          columns={columns}
          pagination={false}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhuma linha do plano gerencial encontrada. Clique em 'Adicionar' para criar a primeira linha."
          height="100%"
          searchable={true}
          exportable={true}
          columnConfigurable={true}
          onRowDoubleClick={handleRowDoubleClick}
        />
      </div>
    </div>
  );
}

