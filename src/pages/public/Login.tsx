import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { LoginForm } from '@/modules/auth/components/LoginForm';
import { MessagesCarousel } from '@/components/components/MessagesCarousel';
import loginBackground from '@/assets/login-background.jpg';
import { applyThemeToElement } from '@/theme';

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const formContainerRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);

  // Aplicar tema dark apenas no lado esquerdo e light no formulário
  // NÃO alterar o tema globalmente - deixar o ThemeProvider gerenciar
  useEffect(() => {
    // Aplicar tema dark apenas no lado esquerdo
    if (leftSideRef.current) {
      applyThemeToElement(leftSideRef.current, 'dark');
    }
    
    // Aplicar tema light apenas no container do formulário
    if (formContainerRef.current) {
      applyThemeToElement(formContainerRef.current, 'light');
    }
  }, []);

  // Redireciona para splash apenas se já estiver autenticado ao carregar a página
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/splash', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen w-full flex">
      {/* Lado esquerdo - Imagem */}
      <div 
        ref={leftSideRef}
        className="hidden lg:flex lg:w-2/3 relative dark"
        style={{
          backgroundImage: `url(${loginBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay escuro para melhor legibilidade */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Conteúdo do lado esquerdo */}
        <div className="relative z-10 w-full flex flex-col justify-between p-8 md:p-12">
          {/* Logo Marvee no topo */}
          <div className="flex items-center"/>
          
          {/* Card de mensagens na parte inferior */}
          <div className="flex justify-start">
            <MessagesCarousel />
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário (área menor) - Tema Light */}
      <div 
        ref={formContainerRef}
        className="w-full lg:w-1/3 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-background"
      >
        <div className="w-full max-w-md space-y-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
