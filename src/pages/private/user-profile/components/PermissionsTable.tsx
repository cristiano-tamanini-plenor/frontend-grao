import React, { useMemo, useCallback } from 'react';
import { ModulePermission, PermissionAction } from '../types';
import DataGrid from '@/components/DataGrid';
import { Checkbox } from '@/components/ui/checkbox';
import type { Column } from '@/components/DataGrid/types';

interface PermissionsTableProps {
  modules: ModulePermission[];
  onModuleVisibilityChange: (moduleId: string, visible: boolean) => void;
  onPermissionChange: (
    moduleId: string,
    cadastroId: string,
    action: PermissionAction,
    checked: boolean
  ) => void;
}

interface PermissionRow {
  id: string;
  moduleId: string;
  moduleName: string;
  isModule: boolean; // true se é uma linha de módulo, false se é cadastro
  cadastroId?: string;
  cadastroName?: string;
  cadastroType?: 'crud' | 'page';
  groupName?: string;
  visible?: boolean; // Apenas para módulos
  read?: boolean;
  create?: boolean;
  edit?: boolean;
  delete?: boolean;
}

export function PermissionsTable({ 
  modules, 
  onModuleVisibilityChange,
  onPermissionChange 
}: PermissionsTableProps) {
  // Função para selecionar/desselecionar todas as permissões de um módulo
  const handleModulePermissionToggle = useCallback((moduleId: string, action: PermissionAction, checked: boolean) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    // Aplicar a permissão a todos os cadastros do módulo
    module.cadastros.forEach((cadastro) => {
      // Para páginas, só pode ter read, então ignora create/edit/delete
      if (cadastro.type === 'page' && action !== 'read') {
        return;
      }
      onPermissionChange(moduleId, cadastro.id, action, checked);
    });
  }, [modules, onPermissionChange]);

  // Verificar se todas as permissões de um tipo estão selecionadas para um módulo
  const areAllPermissionsSelected = useCallback((moduleId: string, action: PermissionAction): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || module.cadastros.length === 0) return false;

    return module.cadastros.every((cadastro) => {
      // Para páginas, só verifica read
      if (cadastro.type === 'page' && action !== 'read') {
        return true; // Considera como "selecionado" já que não se aplica
      }
      return cadastro.permissions[action] === true;
    });
  }, [modules]);

  // Verificar se pelo menos uma permissão está selecionada (estado parcial)
  const hasAnyPermissionSelected = useCallback((moduleId: string, action: PermissionAction): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || module.cadastros.length === 0) return false;

    return module.cadastros.some((cadastro) => {
      if (cadastro.type === 'page' && action !== 'read') {
        return false;
      }
      return cadastro.permissions[action] === true;
    });
  }, [modules]);
  // Transformar dados hierárquicos em formato flat para o DataGrid
  const flatData = useMemo<PermissionRow[]>(() => {
    const rows: PermissionRow[] = [];
    
    modules.forEach((module) => {
      // Linha do módulo (visibilidade)
      rows.push({
        id: `module-${module.id}`,
        moduleId: module.id,
        moduleName: module.name,
        isModule: true,
        visible: module.visible,
      });

      // Linhas dos cadastros dentro do módulo
      module.cadastros.forEach((cadastro) => {
        rows.push({
          id: `cadastro-${module.id}-${cadastro.id}`,
          moduleId: module.id,
          moduleName: module.name,
          isModule: false,
          cadastroId: cadastro.id,
          cadastroName: cadastro.name,
          cadastroType: cadastro.type,
          groupName: cadastro.groupName,
          read: cadastro.permissions.read,
          create: cadastro.permissions.create,
          edit: cadastro.permissions.edit,
          delete: cadastro.permissions.delete,
        });
      });
    });
    
    return rows;
  }, [modules]);

  // Criar colunas do DataGrid
  const columns = useMemo<Column[]>(() => [
    {
      key: 'moduleName',
      header: 'Módulo',
      accessorKey: 'moduleName',
      width: 200,
      flex: true,
      freezeable: true,
      hideable: true,
      cell: (value: string, row: PermissionRow) => {
        if (row.isModule) {
          return (
            <div className="font-semibold flex items-center gap-2">
              <Checkbox
                checked={row.visible}
                onCheckedChange={(checked) =>
                  onModuleVisibilityChange(row.moduleId, checked === true)
                }
              />
              <span>{value}</span>
            </div>
          );
        }
        // Para cadastros, mostrar indentação e grupo se houver
        return (
          <div className="pl-8 flex items-center gap-2">
            {row.groupName && (
              <span className="text-xs text-muted-foreground">({row.groupName})</span>
            )}
            <span>{row.cadastroName}</span>
            {row.cadastroType === 'page' && (
              <span className="text-xs text-muted-foreground">(Página)</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'read',
      header: 'LER',
      accessorKey: 'read',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: boolean | undefined, row: PermissionRow) => {
        if (row.isModule) {
          // Para linhas de módulo, mostrar checkbox que seleciona todas as permissões
          const allSelected = areAllPermissionsSelected(row.moduleId, 'read');
          const someSelected = hasAnyPermissionSelected(row.moduleId, 'read');
          
          return (
            <div className="flex justify-center">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as any).indeterminate = someSelected && !allSelected;
                  }
                }}
                onCheckedChange={(checked) =>
                  handleModulePermissionToggle(row.moduleId, 'read', checked === true)
                }
                className="cursor-pointer"
              />
            </div>
          );
        }
        
        const isDisabled = row.cadastroType === 'page' ? false : false; // Sempre habilitado
        
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={value || false}
              disabled={isDisabled}
              onCheckedChange={(checked) =>
                onPermissionChange(row.moduleId, row.cadastroId!, 'read', checked === true)
              }
            />
          </div>
        );
      },
    },
    {
      key: 'create',
      header: 'CRIAR',
      accessorKey: 'create',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: boolean | undefined, row: PermissionRow) => {
        if (row.isModule) {
          const allSelected = areAllPermissionsSelected(row.moduleId, 'create');
          const someSelected = hasAnyPermissionSelected(row.moduleId, 'create');
          
          return (
            <div className="flex justify-center">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as any).indeterminate = someSelected && !allSelected;
                  }
                }}
                onCheckedChange={(checked) =>
                  handleModulePermissionToggle(row.moduleId, 'create', checked === true)
                }
                className="cursor-pointer"
              />
            </div>
          );
        }
        
        // Páginas não podem criar, apenas CRUD
        const isDisabled = row.cadastroType === 'page';
        
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={value || false}
              disabled={isDisabled}
              onCheckedChange={(checked) =>
                !isDisabled && onPermissionChange(row.moduleId, row.cadastroId!, 'create', checked === true)
              }
            />
          </div>
        );
      },
    },
    {
      key: 'edit',
      header: 'EDITAR',
      accessorKey: 'edit',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: boolean | undefined, row: PermissionRow) => {
        if (row.isModule) {
          const allSelected = areAllPermissionsSelected(row.moduleId, 'edit');
          const someSelected = hasAnyPermissionSelected(row.moduleId, 'edit');
          
          return (
            <div className="flex justify-center">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as any).indeterminate = someSelected && !allSelected;
                  }
                }}
                onCheckedChange={(checked) =>
                  handleModulePermissionToggle(row.moduleId, 'edit', checked === true)
                }
                className="cursor-pointer"
              />
            </div>
          );
        }
        
        // Páginas não podem editar, apenas CRUD
        const isDisabled = row.cadastroType === 'page';
        
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={value || false}
              disabled={isDisabled}
              onCheckedChange={(checked) =>
                !isDisabled && onPermissionChange(row.moduleId, row.cadastroId!, 'edit', checked === true)
              }
            />
          </div>
        );
      },
    },
    {
      key: 'delete',
      header: 'EXCLUIR',
      accessorKey: 'delete',
      width: 100,
      cellAlign: 'center' as const,
      headerAlign: 'center' as const,
      cell: (value: boolean | undefined, row: PermissionRow) => {
        if (row.isModule) {
          const allSelected = areAllPermissionsSelected(row.moduleId, 'delete');
          const someSelected = hasAnyPermissionSelected(row.moduleId, 'delete');
          
          return (
            <div className="flex justify-center">
              <Checkbox
                checked={allSelected}
                ref={(el) => {
                  if (el) {
                    (el as any).indeterminate = someSelected && !allSelected;
                  }
                }}
                onCheckedChange={(checked) =>
                  handleModulePermissionToggle(row.moduleId, 'delete', checked === true)
                }
                className="cursor-pointer"
              />
            </div>
          );
        }
        
        // Páginas não podem excluir, apenas CRUD
        const isDisabled = row.cadastroType === 'page';
        
        return (
          <div className="flex justify-center">
            <Checkbox
              checked={value || false}
              disabled={isDisabled}
              onCheckedChange={(checked) =>
                !isDisabled && onPermissionChange(row.moduleId, row.cadastroId!, 'delete', checked === true)
              }
            />
          </div>
        );
      },
    },
  ], [onModuleVisibilityChange, onPermissionChange, handleModulePermissionToggle, areAllPermissionsSelected, hasAnyPermissionSelected]);

  if (modules.length === 0 || flatData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum item selecionado
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full" style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
      <DataGrid
        id="permissions-grid"
        data={flatData}
        columns={columns}
        pagination={false}
        enableRowSelection={false}
        loading={false}
        emptyMessage="Nenhuma permissão encontrada"
        height="100%"
        searchable={true}
        exportable={false}
        columnConfigurable={false}
        enableRowGrouping={true}
        enableAggregation={false}
        configurable={false}
        rowGroupingModel={['moduleName']}
      />
    </div>
  );
}
