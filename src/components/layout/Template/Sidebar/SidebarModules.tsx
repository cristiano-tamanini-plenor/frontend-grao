import { Settings } from "lucide-react";
import { SidebarConfig, SidebarIcon } from "./types";
import { getIconComponent } from "./iconMap";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CompanySelector } from "./CompanySelector";

interface SidebarModulesProps {
  config: SidebarConfig;
  selectedModuleId: number | string | null;
  onModuleSelect: (moduleId: number | string) => void;
}

/**
 * Verifica se um ícone é do tipo PNG (tem URL)
 */
function isPngIcon(icon: SidebarIcon | undefined): boolean {
  return typeof icon === 'object' && icon !== null && 'url' in icon && !!icon.url;
}

export default function SidebarModules({
  config,
  selectedModuleId,
  onModuleSelect,
}: SidebarModulesProps) {
  // SidebarModules sempre fica visível, apenas mostra ícones
  return (
    <aside id="sidebar-modules" className="relative w-[60px] h-screen flex flex-col border-r border-sidebar-border transition-all duration-300" style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}>
      {/* Company Selector */}
      <div
        className="flex items-center justify-center"
        style={{ height: "var(--header-height, 64px)" }}
      >
        <CompanySelector />
      </div>

      {/* Module Icons */}
      <nav className="flex-1 flex flex-col items-center justify-start gap-2 pt-3 pb-2 overflow-y-auto">
        {config.map((module) => {
          const Icon = getIconComponent(module.icon);
          const isSelected = selectedModuleId === module.id;
          const isPng = isPngIcon(module.icon);

          return (
            <TooltipProvider key={module.id} delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onModuleSelect(module.id)}
                    className={cn(
                      "block size-10 grid place-items-center rounded-lg overflow-hidden leading-none transition-all duration-200 flex-shrink-0",
                      isPng && "p-px", // Padding apenas para PNG
                      isSelected
                        ? "bg-primary/15 text-primary"
                        : "text-primary/60 hover:bg-primary/10 hover:text-primary"
                    )}
                    aria-label={module.description}
                  >
                    <Icon className={cn(isPng ? "h-32 w-32" : "h-5 w-5")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
                  {module.description}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col items-center gap-1 pt-2 pb-2 border-t border-sidebar-separator/30">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="block size-12 grid place-items-center rounded-lg text-primary/60 hover:bg-primary/10 hover:text-primary transition-all duration-200 flex-shrink-0">
                <Settings className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
              Configurações
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
