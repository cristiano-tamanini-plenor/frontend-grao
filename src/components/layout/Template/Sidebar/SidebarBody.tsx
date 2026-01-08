import { useState, useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { SidebarConfig, SidebarModule, SidebarIcon } from "./types";
import { getIconComponent } from "./iconMap";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Verifica se um ícone é do tipo PNG (tem URL)
 */
function isPngIcon(icon: SidebarIcon | undefined): boolean {
  return typeof icon === 'object' && icon !== null && 'url' in icon && !!icon.url;
}

interface SidebarBodyProps {
  config: SidebarConfig;
  selectedModuleId: number | string | null;
  onClose: () => void;
}

const EXPANDED_GROUPS_STORAGE_KEY = "sidebar-expanded-groups";

const loadExpandedGroups = (moduleId: number | string | null): Set<string> => {
  if (!moduleId) return new Set();
  try {
    const stored = localStorage.getItem(`${EXPANDED_GROUPS_STORAGE_KEY}-${moduleId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Set(Array.isArray(parsed) ? parsed : []);
    }
  } catch (error) {
    console.error("Error loading expanded groups from localStorage:", error);
  }
  return new Set();
};

const saveExpandedGroups = (moduleId: number | string | null, groups: Set<string>) => {
  if (!moduleId) return;
  try {
    const groupsArray = Array.from(groups);
    localStorage.setItem(
      `${EXPANDED_GROUPS_STORAGE_KEY}-${moduleId}`,
      JSON.stringify(groupsArray)
    );
  } catch (error) {
    console.error("Error saving expanded groups to localStorage:", error);
  }
};

export default function SidebarBody({ config, selectedModuleId, onClose }: SidebarBodyProps) {
  const location = useLocation();
  
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    return loadExpandedGroups(selectedModuleId);
  });
  
  // Force update when location changes - this ensures the component re-renders in production
  // This is important because in production, sometimes useLocation() doesn't trigger re-renders immediately
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    // Force re-render when location changes - this fixes the issue where navigation
    // updates the URL but doesn't update the UI in production environments
    setForceUpdate((prev) => prev + 1);
  }, [location.pathname, location.search, location.hash]);

  // Carregar grupos expandidos quando o módulo mudar
  useEffect(() => {
    if (selectedModuleId) {
      setExpandedGroups(loadExpandedGroups(selectedModuleId));
    }
  }, [selectedModuleId]);

  // Salvar grupos expandidos sempre que houver mudanças
  useEffect(() => {
    if (selectedModuleId) {
      saveExpandedGroups(selectedModuleId, expandedGroups);
    }
  }, [expandedGroups, selectedModuleId]);

  // Compute selected module before any early returns so hooks stay consistent
  const selectedModule = config.find((m) => m.id === selectedModuleId);

  // Auto-expand groups that have active children (must be declared before any return)
  useEffect(() => {
    if (!selectedModule) return;

    const groupsWithActiveChildren = new Set<string>();

    selectedModule.features.forEach((feature) => {
      if (feature.type === "group" && feature.features) {
        const hasActiveChild = feature.features.some((f) => {
          if (!f.route) return false;
          const normalizedRoute = f.route.startsWith("/") ? f.route : `/${f.route}`;
          return (
            location.pathname === normalizedRoute ||
            location.pathname.startsWith(`${normalizedRoute}/`)
          );
        });

        if (hasActiveChild) {
          groupsWithActiveChildren.add(feature.name);
        }
      }
    });

    if (groupsWithActiveChildren.size > 0) {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        groupsWithActiveChildren.forEach((name) => next.add(name));
        return next;
      });
    }
  }, [selectedModule, location.pathname]);

  if (!selectedModuleId) {
    return null;
  }

  if (!selectedModule) {
    return null;
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  const isRouteActive = (route: string | null, itemName?: string) => {
    if (!route) return false;
    
    // Force re-evaluation when location changes
    const currentPathname = location.pathname;
    
    // Normalize route: remove leading slash if present, then add it back for comparison
    const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
    
    // Exact match - most important
    if (currentPathname === normalizedRoute) {
      return true;
    }
    
    // Prefix match - only if no exact match exists
    if (currentPathname.startsWith(`${normalizedRoute}/`)) {
      // Verificar se há algum outro item com a rota exata que corresponde melhor
      if (selectedModule) {
        const exactMatchItem = selectedModule.features.find((f) => {
          if (f.type === "page" || f.type === "crud") {
            const normalized = f.route?.startsWith("/") ? f.route : `/${f.route}`;
            return currentPathname === normalized && f.name !== itemName;
          }
          // Verificar também em grupos
          if (f.type === "group" && f.features) {
            return f.features.some((subF) => {
              const normalized = subF.route?.startsWith("/") ? subF.route : `/${subF.route}`;
              return currentPathname === normalized && subF.name !== itemName;
            });
          }
          return false;
        });
        
        // Se encontrou um match exato diferente, não marca este como ativo
        if (exactMatchItem) return false;
      }
      return true;
    }
    
    return false;
  };

  return (
    <aside 
      id="sidebar-body" 
      key={`sidebar-body-${selectedModuleId}-${location.pathname}-${forceUpdate}`}
      className="w-[240px] h-screen flex flex-col border-r border-sidebar-border transition-all duration-300 ease-in-out" 
      style={{ backgroundColor: 'hsl(var(--sidebar-bg))' }}
    >
      {/* Header */}
      <div
        className="flex items-center px-4 border-b border-gray-200 dark:border-white/10"
        style={{ height: "64px" }}
      >
        <div className="flex items-center gap-3 flex-1">
          {(() => {
            const ModuleIcon = getIconComponent(selectedModule.icon);
            const isPng = isPngIcon(selectedModule.icon);
            return (
              <div className={cn("h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center", isPng && "p-px")}>
                <ModuleIcon className={cn("h-4 w-4", "text-primary")} />
              </div>
            );
          })()}
          <h2 className="font-bold text-lg text-sidebar-foreground">{selectedModule.description}</h2>
        </div>
      </div>

      {/* Content */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2" key={`nav-${location.pathname}-${forceUpdate}`}>
        {selectedModule.features.map((feature, index) => {
          if (feature.type === "page" || feature.type === "crud") {
            // Direct page or crud link
            const Icon = getIconComponent(feature.icon);
            const isActive = isRouteActive(feature.route, feature.name);
            const isPng = isPngIcon(feature.icon);

            return (
              <NavLink
                key={`${feature.name}-${index}-${location.pathname}-${forceUpdate}`}
                to={feature.route ? (feature.route.startsWith("/") ? feature.route : `/${feature.route}`) : "#"}
                end={true} // Match exato - previne match de prefixo quando a rota é exata
                className={({ isActive: navIsActive }) => {
                  // Use both isActive from our function and navIsActive from NavLink
                  const active = isActive || navIsActive;
                  return cn(
                    "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out",
                    active
                      ? "bg-sidebar-item-hover/15 text-sidebar-item-hover font-semibold border-l-2 border-sidebar-item-hover"
                      : "text-sidebar-foreground hover:bg-sidebar-item-hover/10 hover:text-sidebar-item-hover border-l-2 border-transparent"
                  );
                }}
              >
                <div className={cn("flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110", isPng ? "h-[17px] w-[17px]" : "h-4 w-4")}>
                  <Icon className={isPng ? "h-[17px] w-[17px]" : "h-4 w-4"} />
                </div>
                <span className="text-sm">{feature.description}</span>
              </NavLink>
            );
          }

          if (feature.type === "group") {
            // Group with expandable items
            const Icon = getIconComponent(feature.icon);
            const isExpanded = expandedGroups.has(feature.name);
            const isPng = isPngIcon(feature.icon);
            // Recalculate hasActiveChild on every render to ensure it updates when location changes
            // Note: forceUpdate is included in the key below to ensure recalculation
            const hasActiveChild = feature.features?.some((f) => isRouteActive(f.route)) || false;

            return (
              <div key={`${feature.name}-${index}`} className="space-y-1">
                <button
                  onClick={() => toggleGroup(feature.name)}
                  className={cn(
                    "w-full group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out",
                    hasActiveChild
                      ? "bg-sidebar-item-hover/15 text-sidebar-item-hover font-semibold"
                      : "text-sidebar-foreground hover:bg-sidebar-item-hover/10 hover:text-sidebar-item-hover"
                  )}
                >
                  <div className={cn("flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110", isPng ? "h-[17px] w-[17px]" : "h-4 w-4")}>
                    <Icon id="icon" className={isPng ? "h-[17px] w-[17px]" : "h-4 w-4"} />
                  </div>
                  <span className="text-sm flex-1 text-left">{feature.description}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && feature.features && (
                  <div className="ml-4 space-y-1 border-l-2 border-sidebar-separator/20 pl-1.5">
                    {feature.features.map((subFeature, subIndex) => {
                      const SubIcon = getIconComponent(subFeature.icon);
                      const isSubActive = isRouteActive(subFeature.route);
                      const isSubPng = isPngIcon(subFeature.icon);

                      return (
                        <NavLink
                          key={`${subFeature.name}-${subIndex}-${location.pathname}-${forceUpdate}`}
                          to={subFeature.route ? (subFeature.route.startsWith("/") ? subFeature.route : `/${subFeature.route}`) : "#"}
                          className={({ isActive: navIsActive }) => {
                            const active = isSubActive || navIsActive;
                            return cn(
                              "group relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out",
                              active
                                ? "bg-sidebar-item-hover/15 text-sidebar-item-hover font-semibold"
                                : "text-sidebar-foreground hover:bg-sidebar-item-hover/10 hover:text-sidebar-item-hover"
                            );
                          }}
                        >
                          <div className={cn("flex-shrink-0 flex items-center justify-center transition-transform duration-200 group-hover:scale-110", isSubPng ? "h-[17px] w-[17px]" : "h-4 w-4")}>
                            <SubIcon id="sub-icon" className={isSubPng ? "h-[17px] w-[17px]" : "h-4 w-4"} />
                          </div>
                          <span className="text-sm">{subFeature.description}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}
      </nav>
    </aside>
  );
}
