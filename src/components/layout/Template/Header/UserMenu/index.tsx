import { Settings, HelpCircle, LogOut, Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useTheme, type ThemePreference } from "@/theme/useTheme";
import { getRoleLabel } from "@/lib/rbac/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserMenu() {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();
  const { preference: currentTheme, setTheme } = useTheme();

  const handleThemeChange = async (theme: ThemePreference) => {
    setTheme(theme);
    
    // TODO: Save theme preference to database via API
    // Theme preference is now only stored locally
  };

  const userInitials = profile?.name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'US';

  const getThemeIcon = () => {
    if (currentTheme === 'LIGHT') return <Sun className="h-4 w-4" />;
    if (currentTheme === 'DARK') return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-accent/70 hover:bg-accent transition-colors cursor-pointer group">
          <Avatar className="h-6 w-6">
            <AvatarImage src={`${import.meta.env.VITE_API_URL}/${profile?.avatar_url}` || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-2 w-2 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`${import.meta.env.VITE_API_URL}/${profile?.avatar_url}` || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{profile?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{profile?.email}</span>
              {role && (
                <span className="text-xs text-muted-foreground/80 truncate font-medium">
                  {getRoleLabel(role)}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/perfil')}>
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon()}
            <span className="ml-2">Tema</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup 
              value={currentTheme} 
              onValueChange={(value) => handleThemeChange(value as ThemePreference)}
            >
              <DropdownMenuRadioItem value="LIGHT">
                <Sun className="mr-2 h-4 w-4" />
                Claro
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="DARK">
                <Moon className="mr-2 h-4 w-4" />
                Escuro
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="SYSTEM">
                <Monitor className="mr-2 h-4 w-4" />
                Sistema
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onClick={() => window.open('https://suporte.tsa.com.br', '_blank')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          Suporte
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

