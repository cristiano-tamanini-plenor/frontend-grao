import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DeleteCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  companyName: string;
}

export function DeleteCompanyModal({
  open,
  onOpenChange,
  onConfirm,
  companyName,
}: DeleteCompanyModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component
      console.error('Erro ao excluir empresa:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Excluir Empresa
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Você está prestes a excluir a empresa <strong>{companyName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção!</AlertTitle>
          <AlertDescription className="mt-2">
            Ao confirmar esta ação:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>A empresa será inativada e não aparecerá mais nas listas do sistema</li>
              <li>Esta ação não pode ser desfeita</li>
              <li>Os dados da empresa permanecerão no banco de dados, mas não estarão mais visíveis</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            className="flex-1"
            size="lg"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isDeleting}
            variant="destructive"
            className="flex-1"
            size="lg"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Confirmar Exclusão'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

