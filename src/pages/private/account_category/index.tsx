import { useNavigate } from 'react-router-dom';
import { FolderTree, Download, Upload } from 'lucide-react';
import { ListHeader } from '@/components/ListHeader';
import { usePermission } from '@/hooks/usePermission';
import DataGrid from '@/components/DataGrid';
import { useMemo, useRef } from 'react';
import { useAccountCategories, useExportAccountCategories, useImportAccountCategories } from './hooks/useAccountCategory';
import type { AccountCategory } from './types';
import { AccountCategoryLevel } from './types';
import { Badge } from '@/components/ui/badge';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AccountCategory() {
  const navigate = useNavigate();
  const { canCreate, canEdit } = usePermission('account-categories');
  const { currentCompany } = useCompany();
  const companyIdNumber = currentCompany?.id ? Number(currentCompany.id) : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [], isLoading } = useAccountCategories(companyIdNumber);
  const { exportCategories, isExporting } = useExportAccountCategories();
  const { importCategories, isImporting } = useImportAccountCategories();

  const hasCategories = categories.length > 0;

  const handleExport = async () => {
    if (!companyIdNumber) {
      toast.error('Nenhuma empresa selecionada');
      return;
    }
    await exportCategories(companyIdNumber);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!companyIdNumber) {
      toast.error('Nenhuma empresa selecionada');
      return;
    }

    try {
      await importCategories(companyIdNumber, file);
    } catch (error) {
      // Erro já foi tratado no hook
    } finally {
      // Limpa o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'structure',
        header: 'Estrutura',
        accessorKey: 'structure',
        width: 150,
        cell: (_: any, row: AccountCategory) => {
          const isBold = row.level === AccountCategoryLevel.PRIMARY || row.level === AccountCategoryLevel.SECONDARY;
          return (
            <span className={`text-sm font-mono ${isBold ? 'font-bold' : ''}`}>
              {row.structure || '—'}
            </span>
          );
        },
      },
      {
        key: 'description',
        header: 'Descrição',
        accessorKey: 'description',
        minWidth: 400,
        flex: true,
        cell: (_: any, row: AccountCategory) => {
          const isBold = row.level === AccountCategoryLevel.PRIMARY || row.level === AccountCategoryLevel.SECONDARY;
          return (
            <span className={`text-sm ${isBold ? 'font-bold' : ''}`}>
              {row.description || '—'}
            </span>
          );
        },
      },
      {
        key: 'category_marvee',
        header: 'Categorias Marvee',
        accessorKey: 'category_marvee',
        minWidth: 300,
        flex: true,
        cell: (_: any, row: AccountCategory) => {
          if (!row.category_marvee || !Array.isArray(row.category_marvee) || row.category_marvee.length === 0) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          
          // Mostra todas as categorias associadas separadas por vírgula
          const labels = row.category_marvee
            .map((cat) => {
              const category = cat.category || '';
              const description = cat.description || '';
              if (category && description) {
                return `${category} - ${description}`;
              }
              return category || description || '';
            })
            .filter((label) => label !== '');
          
          if (labels.length === 0) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          
          return (
            <span className="text-sm">
              {labels.join(', ')}
            </span>
          );
        },
      },
      {
        key: 'status',
        header: 'Status',
        accessorKey: 'status',
        width: 100,
        cellAlign: 'center' as const,
        headerAlign: 'center' as const,
        cell: (_: any, row: AccountCategory) => (
          <div className="flex justify-center items-center w-full">
            <Badge variant={row.status ? 'default' : 'secondary'}>
              {row.status ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
        ),
      },
    ];
    return cols;
  }, []);

  const handleRowDoubleClick = (row: any, id: any) => {
    if (canEdit) {
      navigate(`/contas-gerenciais/form?id=${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-hidden">
      <div className="flex-shrink-0">
        <ListHeader
          icon={FolderTree}
          title="Categorias de Conta"
          canCreate={canCreate}
          addButtonRoute="/contas-gerenciais/form"
        >
          {/* Botão de Exportação - só aparece quando há categorias */}
          {hasCategories && !isLoading && (
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting || !companyIdNumber}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>
          )}
          
          {/* Botão de Importação - só aparece se não houver categorias */}
          {!hasCategories && !isLoading && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={handleImportClick}
                disabled={isImporting || !companyIdNumber}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importando...' : 'Importar'}
              </Button>
            </>
          )}
        </ListHeader>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <DataGrid
          id="account-categories-grid"
          data={categories}
          columns={columns}
          pagination={true}
          pageSize={20}
          enableRowSelection={false}
          loading={isLoading}
          emptyMessage="Nenhuma categoria de conta encontrada"
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

