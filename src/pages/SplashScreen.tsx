import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logomarca from '@/components/components/Logomarca';
import { useCompany } from '@/pages/private/company/hooks/useCompany';
import { useSidebar } from '@/pages/private/company/hooks/useSidebar';
import { useAuth } from '@/modules/auth/hooks/useAuth';

const MENSAGENS_SPLASH = [
  { texto: "Estamos aqui para apoiar o empreendedor brasileiro", autor: "Marvee" },
  { texto: "Dinheiro não aceita desaforo.", autor: "Marvee" },
  { texto: "Seja leve com as pessoas e pesado com os problemas.", autor: "Marvee" },
  { texto: "Assuma a responsabilidade ao invés de procurar culpados.", autor: "Marvee" },
  { texto: "Transforme todo problema em uma melhoria nos processos.", autor: "Marvee" },
  { texto: "Não seja medíocre, pois a média é uma merda.", autor: "Marvee" },
  { texto: "Dados comem feeling no café da manhã.", autor: "Marvee" },
  { texto: "Não se pergunta o que o Google responde.", autor: "Marvee" },
  { texto: "Detalhes importam.", autor: "Marvee" },
  { texto: "Trabalhar dá trabalho.", autor: "Marvee" }
];

const getMensagemAleatoria = (): { texto: string; autor: string } => {
  const STORAGE_KEY = 'tsa_ultima_mensagem_splash';
  const ultimaMensagem = localStorage.getItem(STORAGE_KEY);
  
  const mensagensDisponiveis = MENSAGENS_SPLASH.filter(
    (msg) => msg.texto !== ultimaMensagem
  );
  
  const pool = mensagensDisponiveis.length > 0 
    ? mensagensDisponiveis 
    : MENSAGENS_SPLASH;
  
  const mensagemSelecionada = pool[Math.floor(Math.random() * pool.length)];
  localStorage.setItem(STORAGE_KEY, mensagemSelecionada.texto);
  
  return mensagemSelecionada;
};

export default function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { currentCompany } = useCompany();
  const [mensagem, setMensagem] = useState<{ texto: string; autor: string } | null>(null);
  const navigatedRef = useRef(false);

  // Buscar sidebar da empresa atual
  const { data: sidebarConfig, isLoading: isLoadingSidebar, isError } = useSidebar(
    currentCompany?.id || null
  );

  useEffect(() => {
    setMensagem(getMensagemAleatoria());

    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Se não houver empresa selecionada, aguardar um pouco e redirecionar
    if (!currentCompany) {
      const timer = setTimeout(() => {
        if (!navigatedRef.current) {
          navigate('/home');
          navigatedRef.current = true;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    // Timer mínimo de 5 segundos
    const minTimer = setTimeout(() => {
      if (!navigatedRef.current) {
        navigate('/home');
        navigatedRef.current = true;
      }
    }, 5000);

    // Se a sidebar já carregou (com sucesso ou erro), aguardar pelo menos 2 segundos e redirecionar
    if (!isLoadingSidebar) {
      const quickTimer = setTimeout(() => {
        if (!navigatedRef.current) {
          navigate('/home');
          navigatedRef.current = true;
        }
      }, 2000);
      
      return () => {
        clearTimeout(minTimer);
        clearTimeout(quickTimer);
      };
    }

    return () => clearTimeout(minTimer);
  }, [navigate, isAuthenticated, currentCompany, isLoadingSidebar]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-8 animate-fade-in max-w-2xl px-6 w-full">
        <Logomarca 
          alt="Grão Logo" 
          className="w-64 h-auto mx-auto animate-pulse"
        />
        <div className="space-y-3">
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-muted-foreground text-sm">
            Carregando suas informações...
          </p>
        </div>
        
        {mensagem && (
          <div className="space-y-2 animate-fade-in pt-6 border-t border-border">
            <p className="text-lg text-foreground italic font-medium">
              "{mensagem.texto}"
            </p>
            <p className="text-sm text-muted-foreground">
              — {mensagem.autor}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
