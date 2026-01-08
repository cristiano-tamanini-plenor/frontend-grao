import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<string | null>;
  userName: string;
}

export function ResetPasswordModal({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: ResetPasswordModalProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setIsResetting(true);
    try {
      const password = await onConfirm();
      if (password) {
        setNewPassword(password);
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopy = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword);
      toast({
        title: 'Senha copiada!',
        description: 'A senha foi copiada para a área de transferência.',
      });
    }
  };

  const handleClose = () => {
    setNewPassword(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Resetar Senha do Usuário
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {newPassword
              ? 'Nova senha gerada com sucesso. Copie e envie ao usuário.'
              : 'Uma nova senha aleatória será gerada para este usuário.'}
          </DialogDescription>
        </DialogHeader>

        {newPassword ? (
          // Success state - show password
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-4">
              <label className="text-sm font-medium mb-2 block">
                Nova Senha
              </label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-lg font-mono bg-background px-3 py-2 rounded border">
                  {newPassword}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  title="Copiar senha"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Copie esta senha e envie ao usuário. Ela não será mostrada novamente.
              </p>
            </div>

            <Button onClick={handleClose} className="w-full" size="lg">
              Fechar
            </Button>
          </div>
        ) : (
          // Confirmation state
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isResetting}
              className="flex-1"
              size="lg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isResetting}
              className="flex-1"
              size="lg"
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Nova Senha'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

