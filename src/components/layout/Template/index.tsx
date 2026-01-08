import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, X } from "lucide-react";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useCompany } from "@/pages/private/company/hooks/useCompany";
import { useSidebar } from "@/pages/private/company/hooks/useSidebar";

interface TemplateProps {
  children: ReactNode;
}

/**
 * Template component for private pages with sidebar layout.
 * Note: Requires SidebarProvider to be present in the component tree.
 * This is provided by the App.tsx root component.
 */
export default function Template({ children }: TemplateProps) {
  const { profile } = useAuth();
  const { currentCompany } = useCompany();
  const navigate = useNavigate();
  const [showPasswordAlert, setShowPasswordAlert] = useState(true);

  // Busca sidebar da empresa atual
  const { data: sidebarConfig = [], isLoading: isLoadingSidebar } = useSidebar(
    currentCompany?.id || null
  );

  return (
    <div id="template" className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />
      {profile?.force_password_change && showPasswordAlert && (
        <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Ação necessária:
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Por motivos de segurança, você precisa alterar sua senha.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50"
                  onClick={() => navigate('/perfil')}
                >
                  Alterar Senha
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 h-8 w-8 p-0"
                  onClick={() => setShowPasswordAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div id="page-content" className="flex flex-1 w-full min-h-0 overflow-hidden">
        <Sidebar config={sidebarConfig} />
        <SidebarInset className="flex-1 w-full flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-hidden">
            {children}
          </div>
        </SidebarInset>
      </div>
      <Footer />
    </div>
  );
}