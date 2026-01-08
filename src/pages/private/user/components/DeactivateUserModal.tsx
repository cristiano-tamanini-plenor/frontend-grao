import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DeactivateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  userName: string;
}

export function DeactivateUserModal({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: DeactivateUserModalProps) {
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleConfirm = async () => {
    setIsDeactivating(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
      console.error('Erro ao remover usuário:', error);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleClose = () => {
    if (!isDeactivating) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Remover Usuário da Empresa
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Você está prestes a remover o usuário <strong>{userName}</strong> desta empresa.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription className="mt-2">
            Ao confirmar esta ação:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>O usuário será removido desta empresa</li>
              <li>O usuário não terá mais acesso aos recursos desta empresa</li>
              <li>O usuário poderá ser convidado novamente para esta empresa no futuro</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeactivating}
            className="flex-1"
            size="lg"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeactivating}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            {isDeactivating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo...
              </>
            ) : (
              'Confirmar Remoção'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

