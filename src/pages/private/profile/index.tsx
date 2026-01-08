import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PageContent } from '@/components/layout/PageContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordStrengthMeter } from '@/modules/auth/components/PasswordStrengthMeter';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { profileService, buildAvatarUrl } from './services/profile.service';
import { changePasswordSchema } from '@/lib/validators/auth.schemas';
import { ProfileAvatarUpload } from './components/ProfileAvatarUpload';

export default function Profile() {
  const { isAuthenticated, isLoading: authLoading, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação usando schema
    const validationResult = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setIsChangingPassword(true);

    try {
      // Atualiza o perfil com a nova senha
      await profileService.updateProfile({
        name: profile.name,
        email: profile.email,
        currentPassword,
        newPassword,
        confirmPassword,
      });
      
      // Atualizar o perfil no contexto
      await refreshProfile();

      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirecionar para home se estava sendo forçado a alterar senha
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('forcePasswordChange') === 'true') {
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      // Trata mensagens de erro do backend
      let errorMessage = 'Erro ao alterar senha';
      if (error.message) {
        if (Array.isArray(error.message)) {
          errorMessage = error.message.join(', ');
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <PageContent className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
              <p className="text-muted-foreground mt-2">
                Gerencie suas informações pessoais e preferências
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Foto de Perfil</CardTitle>
                  <CardDescription>
                    Atualize sua foto de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileAvatarUpload
                    currentAvatarUrl={buildAvatarUrl(profile.avatar_url)}
                    userName={profile.name}
                    userEmail={profile.email}
                    onAvatarChange={async () => {
                      await refreshProfile();
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                  <CardDescription>
                    Seus dados cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={profile.name} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile.email} disabled />
                  </div>
                  {profile.phone_e164 && (
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input value={profile.phone_e164} disabled />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  <div>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                      Atualize sua senha de acesso
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Senha Atual</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Digite sua senha atual"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nova Senha</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Senha</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                        required
                      />
                    </div>
                  </div>

                  {newPassword && (
                    <div className="space-y-2">
                      <Label>Força da Senha</Label>
                      <PasswordStrengthMeter password={newPassword} />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </form>
              </CardContent>
            </Card>
    </PageContent>
  );
}
