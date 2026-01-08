import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useCompany } from '@/pages/private/company/hooks/useCompany';

interface UsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUserIds: string[];
  onUserToggle: (userId: string, checked: boolean) => void;
}

export function UsersModal({ open, onOpenChange, selectedUserIds, onUserToggle }: UsersModalProps) {
  const { currentCompany } = useCompany();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-for-profile', currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];

      // TODO: Replace with API call: GET /companies/:companyId/users
      const response = await apiClient.get<any[]>(`/companies/${currentCompany.id}/users`);

      return (response || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
      }));
    },
    enabled: open && !!currentCompany?.id,
  });

  const activeUsers = users.filter(user => user.is_active);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários do Perfil
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Carregando usuários...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (activeUsers.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários do Perfil
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            Nenhum usuário disponível
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
            <Users className="h-5 w-5" />
            Usuários do Perfil
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="w-[50px]">Avatar</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeUsers.map((user) => {
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  
                  const isSelected = selectedUserIds.includes(user.id);

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => onUserToggle(user.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

