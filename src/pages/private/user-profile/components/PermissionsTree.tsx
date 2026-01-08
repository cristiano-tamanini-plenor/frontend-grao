import React, { useMemo, useState, useCallback } from 'react';
import { ModulePermission, PermissionAction } from '../types';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface PermissionsTreeProps {
  modules: ModulePermission[];
  onModuleVisibilityChange: (moduleId: string, visible: boolean) => void;
  onPermissionChange: (
    moduleId: string,
    cadastroId: string,
    action: PermissionAction,
    checked: boolean
  ) => void;
  onMultiplePermissionsChange?: (
    moduleId: string,
    updates: Array<{ cadastroId: string; action: PermissionAction; checked: boolean }>
  ) => void;
}

export function PermissionsTree({ 
  modules, 
  onModuleVisibilityChange,
  onPermissionChange,
  onMultiplePermissionsChange
}: PermissionsTreeProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map(m => m.id))
  );

  // Atualizar expandedModules quando modules mudar (apenas na montagem inicial)
  React.useEffect(() => {
    const moduleIds = modules.map(m => m.id);
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      // Adiciona novos módulos ao set expandido
      moduleIds.forEach(id => {
        if (!newSet.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  }, [modules.length]);

  // Função para selecionar/desselecionar todas as permissões de um módulo
  const handleModulePermissionToggle = (moduleId: string, action: PermissionAction, checked: boolean) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return;

    module.cadastros.forEach((cadastro) => {
      if (cadastro.type === 'page' && action !== 'read') {
        return;
      }
      onPermissionChange(moduleId, cadastro.id, action, checked);
    });
  };

  // Função para selecionar/desselecionar TODAS as permissões de todos os cadastros de um módulo
  const handleModuleAllPermissionsToggle = (moduleId: string, checked: boolean) => {
    // Usar modules da prop diretamente para garantir que estamos usando os dados mais recentes
    const currentModule = modules.find(m => m.id === moduleId);
    
    if (!currentModule || !currentModule.cadastros || currentModule.cadastros.length === 0) {
      return;
    }

    // Se temos a função otimizada, usamos ela para fazer tudo de uma vez
    if (onMultiplePermissionsChange) {
      const updates: Array<{ cadastroId: string; action: PermissionAction; checked: boolean }> = [];
      const actions: PermissionAction[] = ['read', 'create', 'edit', 'delete'];
      
      currentModule.cadastros.forEach((cadastro) => {
        // Para páginas, só pode ter read
        if (cadastro.type === 'page') {
          updates.push({ cadastroId: cadastro.id, action: 'read', checked });
        } else {
          // Para CRUD, todas as permissões
          actions.forEach(action => {
            updates.push({ cadastroId: cadastro.id, action, checked });
          });
        }
      });
      
      onMultiplePermissionsChange(moduleId, updates);
    } else {
      // Fallback: fazer uma por uma
      const actions: PermissionAction[] = ['read', 'create', 'edit', 'delete'];
      
      currentModule.cadastros.forEach((cadastro) => {
        // Para páginas, só pode ter read
        if (cadastro.type === 'page') {
          onPermissionChange(moduleId, cadastro.id, 'read', checked);
        } else {
          // Para CRUD, todas as permissões
          actions.forEach(action => {
            onPermissionChange(moduleId, cadastro.id, action, checked);
          });
        }
      });
    }
  };

  // Verificar se TODAS as permissões de TODOS os cadastros estão selecionadas
  const areAllModulePermissionsSelected = (moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || module.cadastros.length === 0) return false;

    return module.cadastros.every((cadastro) => {
      if (cadastro.type === 'page') {
        return cadastro.permissions.read === true;
      }
      return (
        cadastro.permissions.read === true &&
        cadastro.permissions.create === true &&
        cadastro.permissions.edit === true &&
        cadastro.permissions.delete === true
      );
    });
  };

  // Verificar se pelo menos uma permissão de algum cadastro está selecionada
  const hasAnyModulePermissionSelected = (moduleId: string): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || module.cadastros.length === 0) return false;

    return module.cadastros.some((cadastro) => {
      if (cadastro.type === 'page') {
        return cadastro.permissions.read === true;
      }
      return (
        cadastro.permissions.read === true ||
        cadastro.permissions.create === true ||
        cadastro.permissions.edit === true ||
        cadastro.permissions.delete === true
      );
    });
  };

  // Verificar se todas as permissões de um tipo estão selecionadas
  const areAllPermissionsSelected = (moduleId: string, action: PermissionAction): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || module.cadastros.length === 0) return false;

    return module.cadastros.every((cadastro) => {
      if (cadastro.type === 'page' && action !== 'read') {
        return true;
      }
      return cadastro.permissions[action] === true;
    });
  };

  // Verificar se pelo menos uma permissão está selecionada
  const hasAnyPermissionSelected = (moduleId: string, action: PermissionAction): boolean => {
    const module = modules.find(m => m.id === moduleId);
    if (!module || module.cadastros.length === 0) return false;

    return module.cadastros.some((cadastro) => {
      if (cadastro.type === 'page' && action !== 'read') {
        return false;
      }
      return cadastro.permissions[action] === true;
    });
  };

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  }, []);

  if (modules.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum item selecionado
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Módulo</TableHead>
            <TableHead className="w-[100px] text-center">LER</TableHead>
            <TableHead className="w-[100px] text-center">CRIAR</TableHead>
            <TableHead className="w-[100px] text-center">EDITAR</TableHead>
            <TableHead className="w-[100px] text-center">EXCLUIR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            
            return (
              <React.Fragment key={module.id}>
                {/* Linha do Módulo */}
                <TableRow>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-0 hover:bg-transparent cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModule(module.id);
                        }}
                        type="button"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      <Checkbox
                        checked={areAllModulePermissionsSelected(module.id)}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          
                          // Atualiza visibilidade e permissões juntas
                          // Primeiro atualiza a visibilidade
                          onModuleVisibilityChange(module.id, isChecked);
                          
                          // Usar o módulo atual diretamente para evitar problemas de timing
                          const currentModule = modules.find(m => m.id === module.id);
                          if (currentModule && currentModule.cadastros && currentModule.cadastros.length > 0) {
                            if (onMultiplePermissionsChange) {
                              const updates: Array<{ cadastroId: string; action: PermissionAction; checked: boolean }> = [];
                              const actions: PermissionAction[] = ['read', 'create', 'edit', 'delete'];
                              
                              currentModule.cadastros.forEach((cadastro) => {
                                if (cadastro.type === 'page') {
                                  updates.push({ cadastroId: cadastro.id, action: 'read', checked: isChecked });
                                } else {
                                  actions.forEach(action => {
                                    updates.push({ cadastroId: cadastro.id, action, checked: isChecked });
                                  });
                                }
                              });
                              
                              if (updates.length > 0) {
                                onMultiplePermissionsChange(module.id, updates);
                              }
                            } else {
                              // Fallback
                              const actions: PermissionAction[] = ['read', 'create', 'edit', 'delete'];
                              currentModule.cadastros.forEach((cadastro) => {
                                if (cadastro.type === 'page') {
                                  onPermissionChange(module.id, cadastro.id, 'read', isChecked);
                                } else {
                                  actions.forEach(action => {
                                    onPermissionChange(module.id, cadastro.id, action, isChecked);
                                  });
                                }
                              });
                            }
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        ref={(el) => {
                          if (el) {
                            const allSelected = areAllModulePermissionsSelected(module.id);
                            const someSelected = hasAnyModulePermissionSelected(module.id);
                            (el as any).indeterminate = someSelected && !allSelected;
                          }
                        }}
                      />
                      <span className="font-semibold">{module.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={areAllPermissionsSelected(module.id, 'read')}
                      ref={(el) => {
                        if (el) {
                          (el as any).indeterminate = 
                            hasAnyPermissionSelected(module.id, 'read') && 
                            !areAllPermissionsSelected(module.id, 'read');
                        }
                      }}
                      onCheckedChange={(checked) =>
                        handleModulePermissionToggle(module.id, 'read', checked === true)
                      }
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={areAllPermissionsSelected(module.id, 'create')}
                      ref={(el) => {
                        if (el) {
                          (el as any).indeterminate = 
                            hasAnyPermissionSelected(module.id, 'create') && 
                            !areAllPermissionsSelected(module.id, 'create');
                        }
                      }}
                      onCheckedChange={(checked) =>
                        handleModulePermissionToggle(module.id, 'create', checked === true)
                      }
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={areAllPermissionsSelected(module.id, 'edit')}
                      ref={(el) => {
                        if (el) {
                          (el as any).indeterminate = 
                            hasAnyPermissionSelected(module.id, 'edit') && 
                            !areAllPermissionsSelected(module.id, 'edit');
                        }
                      }}
                      onCheckedChange={(checked) =>
                        handleModulePermissionToggle(module.id, 'edit', checked === true)
                      }
                      className="cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={areAllPermissionsSelected(module.id, 'delete')}
                      ref={(el) => {
                        if (el) {
                          (el as any).indeterminate = 
                            hasAnyPermissionSelected(module.id, 'delete') && 
                            !areAllPermissionsSelected(module.id, 'delete');
                        }
                      }}
                      onCheckedChange={(checked) =>
                        handleModulePermissionToggle(module.id, 'delete', checked === true)
                      }
                      className="cursor-pointer"
                    />
                  </TableCell>
                </TableRow>

                {/* Linhas dos Cadastros - Apenas CRUD (páginas são gerenciadas em modal separado) */}
                {isExpanded && module.cadastros
                  .filter(cadastro => cadastro.type === 'crud')
                  .map((cadastro) => (
                  <TableRow key={cadastro.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 pl-8">
                        <span>{cadastro.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={cadastro.permissions.read || false}
                        onCheckedChange={(checked) =>
                          onPermissionChange(module.id, cadastro.id, 'read', checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={cadastro.permissions.create || false}
                        onCheckedChange={(checked) =>
                          onPermissionChange(module.id, cadastro.id, 'create', checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={cadastro.permissions.edit || false}
                        onCheckedChange={(checked) =>
                          onPermissionChange(module.id, cadastro.id, 'edit', checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={cadastro.permissions.delete || false}
                        onCheckedChange={(checked) =>
                          onPermissionChange(module.id, cadastro.id, 'delete', checked === true)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

