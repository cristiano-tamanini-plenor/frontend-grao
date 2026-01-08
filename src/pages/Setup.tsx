import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';

export default function Setup() {
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasOwner, setHasOwner] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkForOwner();
  }, []);

  const checkForOwner = async () => {
    try {
      // TODO: Replace with API call: GET /auth/setup/check
      const response = await apiClient.get<{ hasOwner: boolean }>('/auth/setup/check');
      
      if (response.hasOwner) {
        setHasOwner(true);
        toast({
          title: 'Sistema já configurado',
          description: 'Um proprietário já existe no sistema.',
        });
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      logErrorDetails('Setup.checkForOwner', error);
    } finally {
      setIsChecking(false);
    }
  };

  const createOwner = async () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha nome, email e senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      // TODO: Replace with API call: POST /auth/setup/owner
      await apiClient.post('/auth/setup/owner', {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone_e164: formData.phone,
        role: 'OWNER',
      });

      toast({
        title: 'Proprietário criado com sucesso!',
        description: 'Você pode fazer login agora.',
      });

      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      logErrorDetails('Setup.createOwner', error);
      toast({
        title: 'Erro ao criar proprietário',
        description: getSafeErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (hasOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sistema Configurado</CardTitle>
            <CardDescription>
              O sistema já possui um proprietário configurado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Redirecionando para login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuração Inicial</CardTitle>
          <CardDescription>
            Criar usuário proprietário do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+5547999999999"
              />
            </div>
          </div>

          <Button
            onClick={createOwner}
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Proprietário'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
