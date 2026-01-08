import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'react-router-dom';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { signInSchema } from '@/lib/validators/auth.schemas';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { getSafeErrorMessage, logErrorDetails } from '@/lib/utils/error-messages';
import logomarcaDark from '@/assets/logomarcaEscura.svg';

type SignInFormData = {
  email: string;
  password: string;
};

export function LoginForm() {
  const { signIn, profile } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveEmail, setSaveEmail] = useState(true); // Por padrão, salvar email
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [lastLoginEmail, setLastLoginEmail] = useState<string | null>(null);
  const [lastLoginAvatar, setLastLoginAvatar] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const errorMessage = location.state?.errorMessage;
    if (errorMessage) {
      setNavigationError(errorMessage);
    }
  }, [location]);

  // Carregar email e avatar do localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedEmail = localStorage.getItem('lastLoginEmail');
    const savedAvatar = localStorage.getItem('lastLoginAvatar');
    
    if (savedEmail) {
      setLastLoginEmail(savedEmail);
      setValue('email', savedEmail);
    }
    
    if (savedAvatar) {
      // Aceitar diferentes formatos de avatar:
      // 1. Base64 (data:image/...)
      // 2. URL completa (http://... ou https://...)
      // 3. Caminho relativo (/uploads/...)
      const isBase64 = savedAvatar.startsWith('data:image/');
      const isFullUrl = savedAvatar.startsWith('http://') || savedAvatar.startsWith('https://');
      const isRelativePath = savedAvatar.startsWith('/');
      
      if (isBase64 || isFullUrl || isRelativePath) {
        setLastLoginAvatar(savedAvatar);
      } else {
        console.warn('Formato de avatar não reconhecido:', savedAvatar);
      }
    }
  }, [setValue]);

  // Gerar iniciais a partir do email
  const getInitialsFromEmail = (email: string | null): string => {
    if (!email) return 'US';
    const parts = email.split('@')[0];
    return parts.slice(0, 2).toUpperCase();
  };

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      await signIn(data.email, data.password);
      
      // Salvar email apenas se o checkbox estiver marcado
      // O avatar será salvo no signOut se houver preferência
      if (saveEmail) {
        localStorage.setItem('lastLoginEmail', data.email);
        // Avatar será atualizado no próximo signOut se o usuário tiver avatar
      } else {
        // Remover dados salvos se o checkbox não estiver marcado
        localStorage.removeItem('lastLoginEmail');
        localStorage.removeItem('lastLoginAvatar');
      }
      
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      logErrorDetails('LoginForm.submit', error);
      toast.error(getSafeErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Logomarca */}
      <div className="flex justify-center">
        <img 
          src={logomarcaDark} 
          alt="Grão Logo" 
          className="w-36 h-auto"
        />
      </div>

      <Card className="w-full">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold">Entrar</CardTitle>
          <CardDescription className="text-sm">
            {lastLoginEmail ? 'Digite sua senha para continuar' : 'Digite seu email e senha para acessar o sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {navigationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{navigationError}</AlertDescription>
            </Alert>
          )}
          
          {/* Avatar e email do último login */}
          {lastLoginEmail && (
            <div className="mb-4 flex flex-col items-center gap-2">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={
                    lastLoginAvatar 
                      ? (lastLoginAvatar.startsWith('data:') || lastLoginAvatar.startsWith('http://') || lastLoginAvatar.startsWith('https://'))
                        ? lastLoginAvatar 
                        : `${import.meta.env.VITE_API_URL}${lastLoginAvatar}`
                      : undefined
                  } 
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                  {getInitialsFromEmail(lastLoginEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{lastLoginEmail}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Continue com sua senha</p>
              </div>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="text-xs h-auto p-0"
                onClick={() => {
                  setLastLoginEmail(null);
                  setLastLoginAvatar(null);
                  setValue('email', '');
                  localStorage.removeItem('lastLoginEmail');
                  localStorage.removeItem('lastLoginAvatar');
                }}
                disabled={isLoading}
              >
                Entrar com outra conta
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Campo de email - oculto quando há lastLoginEmail, mas sempre registrado no formulário */}
            {!lastLoginEmail ? (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            ) : (
              <input type="hidden" {...register('email')} />
            )}

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register('password')}
                disabled={isLoading}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? "Ocultar senha" : "Mostrar senha"}
                </span>
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Checkbox para salvar email - apenas quando não há email salvo */}
          {!lastLoginEmail && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveEmail"
                checked={saveEmail}
                onCheckedChange={(checked) => setSaveEmail(checked === true)}
                disabled={isLoading}
              />
              <Label
                htmlFor="saveEmail"
                className="text-sm font-normal cursor-pointer"
              >
                Salvar email para próximo login
              </Label>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
