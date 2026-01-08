import React from 'react';
import { User } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';

interface UsersTabProps {
  users: User[];
  selectedUserIds: string[];
  onUserToggle: (userId: string, checked: boolean) => void;
}

export function UsersTab({ users, selectedUserIds, onUserToggle }: UsersTabProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum usuário disponível
      </div>
    );
  }

  return (
    <div className="border rounded-md flex-1 min-h-0 overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
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
          {users.map((user) => {
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
                    <AvatarImage src={user.avatar_url} />
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
  );
}

