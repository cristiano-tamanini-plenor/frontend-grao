import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ModulePermission } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';

interface PagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modules: ModulePermission[];
  onPermissionChange: (
    moduleId: string,
    cadastroId: string,
    action: 'read',
    checked: boolean
  ) => void;
}

export function PagesModal({ 
  open, 
  onOpenChange, 
  modules,
  onPermissionChange 
}: PagesModalProps) {
  // Coletar todas as páginas de todos os módulos
  const pages = useMemo(() => {
    const allPages: Array<{
      id: string;
      moduleId: string;
      moduleName: string;
      name: string;
      read: boolean;
    }> = [];

    modules.forEach(module => {
      module.cadastros
        .filter(cadastro => cadastro.type === 'page')
        .forEach(cadastro => {
          allPages.push({
            id: cadastro.id,
            moduleId: module.id,
            moduleName: module.name,
            name: cadastro.name,
            read: cadastro.permissions.read || false,
          });
        });
    });

    return allPages;
  }, [modules]);

  if (pages.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Permissões de Páginas
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma página encontrada
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Permissões de Páginas ({pages.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Página</TableHead>
                  <TableHead className="text-center w-[120px]">Visualização</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">
                      {page.moduleName}
                    </TableCell>
                    <TableCell>
                      {page.name}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={page.read}
                        onCheckedChange={(checked) =>
                          onPermissionChange(page.moduleId, page.id, 'read', checked === true)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

