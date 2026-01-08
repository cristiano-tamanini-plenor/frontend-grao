import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-background to-muted p-6">
      <div className="mx-auto w-full max-w-2xl text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-3xl font-semibold text-foreground">Página não encontrada</h2>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" size="lg">
            <Link to="/home">
              <Home className="mr-2 h-5 w-5" />
              Ir para o início
            </Link>
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
