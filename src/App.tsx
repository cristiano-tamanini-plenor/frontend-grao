import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "@/modules/auth/hooks/useAuth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/theme";
import Template from "@/components/layout/Template";
import { AppRoutes } from "@/pages/router";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { CompanyProvider } from "./pages/private/company/hooks/useCompany";

const queryClient = new QueryClient();

// Public routes that don't need the Template
const PUBLIC_ROUTES = ["/login", "/splash"];

// Wrapper component to conditionally show Template only for authenticated routes
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Public routes don't need the Template
  if (isPublicRoute || !isAuthenticated) {
    return <AppRoutes key={location.pathname} />;
  }

  // Private routes use the Template
  // Add key based on location.pathname to force re-render when route changes
  // This fixes the issue where navigation updates the URL but doesn't update the UI in production
  return (
    <Template>
      <AppRoutes key={location.pathname} />
    </Template>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <CompanyProvider>
              <SidebarProvider>
                <AppContent />
              </SidebarProvider>
            </CompanyProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
