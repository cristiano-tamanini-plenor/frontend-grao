import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar as UISidebar } from "@/components/ui/sidebar";
import SidebarModules from "./SidebarModules";
import SidebarBody from "./SidebarBody";
import { SidebarConfig } from "./types";
import { cn } from "@/lib/utils";

// Export types for external use
export type { 
  SidebarConfig, 
  SidebarModule, 
  SidebarFeature, 
  SidebarItemType,
  ApiPlanoItemResponse,
  ApiModule,
  ApiCadastro
} from "./types";

interface SidebarProps {
  config: SidebarConfig;
}

const STORAGE_KEY = "sidebar-state";

interface SidebarState {
  selectedModuleId: number | string | null;
  isBodyVisible: boolean;
}

const loadSidebarState = (): SidebarState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        selectedModuleId: parsed.selectedModuleId ?? null,
        isBodyVisible: parsed.isBodyVisible ?? false,
      };
    }
  } catch (error) {
    console.error("Error loading sidebar state from localStorage:", error);
  }
  return {
    selectedModuleId: null,
    isBodyVisible: false,
  };
};

const saveSidebarState = (state: SidebarState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving sidebar state to localStorage:", error);
  }
};

export default function Sidebar({ config }: SidebarProps) {
  const location = useLocation();
  const isSplashScreen = location.pathname === "/splash";
  
  const [selectedModuleId, setSelectedModuleId] = useState<number | string | null>(() => {
    return loadSidebarState().selectedModuleId;
  });
  const [isBodyVisible, setIsBodyVisible] = useState<boolean>(() => {
    return loadSidebarState().isBodyVisible;
  });
  
  // Force re-render when location changes to ensure sidebar updates in production
  // This helps with the issue where navigation updates the URL but doesn't update the UI
  useEffect(() => {
    // This effect ensures the component reacts to location changes
    // The dependency on location.pathname will trigger a re-render
  }, [location.pathname]);

  // Selecionar automaticamente o primeiro módulo quando a configuração carregar
  useEffect(() => {
    if (config.length === 0) return;
    
    // Verificar se o módulo selecionado ainda existe na configuração
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const moduleExists = selectedModuleId !== null && config.some((m) => m.id === selectedModuleId);
    
    // Se não há módulo selecionado OU o módulo selecionado não existe mais
    if (!moduleExists) {
      const firstModule = config[0];
      setSelectedModuleId(firstModule.id);
      setIsBodyVisible(true);
    }
    // Executa quando a configuração mudar (selectedModuleId não está nas deps para evitar loop)
  }, [config]);

  // Salvar estado no localStorage sempre que houver mudanças
  useEffect(() => {
    saveSidebarState({
      selectedModuleId,
      isBodyVisible,
    });
  }, [selectedModuleId, isBodyVisible]);

  const handleModuleSelect = (moduleId: number | string) => {
    // If the same module is clicked, toggle the body visibility
    if (selectedModuleId === moduleId) {
      if (isBodyVisible) {
        // Se está aberto, fecha
        setIsBodyVisible(false);
      } else {
        // Se está fechado, abre
        setIsBodyVisible(true);
      }
    } else {
      // Select new module and show body
      setSelectedModuleId(moduleId);
      setIsBodyVisible(true);
    }
  };

  const handleToggleCollapse = () => {
    // Toggle apenas a visibilidade do SidebarBody
    // Mantém o selectedModuleId para que o botão continue visível
    setIsBodyVisible((prev) => !prev);
  };

  const handleCloseBody = () => {
    // Apenas fecha o body, mantém o módulo selecionado para que o toggle continue visível
    setIsBodyVisible(false);
  };

  return (
    <div id="sidebar" className="relative flex flex-row h-full">
      <SidebarModules
        config={config}
        selectedModuleId={selectedModuleId}
        onModuleSelect={handleModuleSelect}
      />
      
      {/* Toggle button - aparece sempre que há um módulo selecionado, exceto na SplashScreen */}
      {selectedModuleId !== null && !isSplashScreen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCollapse();
          }}
          className="absolute left-[51px] top-[calc(var(--header-height,64px)-10px)] h-[18px] w-[18px] rounded-full grid place-items-center bg-background shadow-lg ring-2 ring-border hover:bg-primary hover:text-primary-foreground hover:ring-primary transition-all duration-300 z-40"
          aria-label={!isBodyVisible ? "Abrir detalhes do módulo" : "Fechar detalhes do módulo"}
          title={!isBodyVisible ? "Abrir detalhes do módulo" : "Fechar detalhes do módulo"}
        >
          <svg
            className={cn(
              "h-3.5 w-3.5 transition-transform duration-300",
              !isBodyVisible ? "rotate-180" : ""
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}
      
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isBodyVisible && selectedModuleId && !isSplashScreen
            ? "w-[240px] opacity-100"
            : "w-0 opacity-0"
        )}
      >
        {isBodyVisible && selectedModuleId && !isSplashScreen && (
          <UISidebar variant="inset" collapsible="none" className="border-0 bg-transparent">
            <SidebarBody
            config={config}
            selectedModuleId={selectedModuleId}
            onClose={handleCloseBody}
            />
          </UISidebar>
          
        )}
      </div>
    </div>
  );
}

