import { User, ChevronRight, Moon, Sun, Monitor, LogOut, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
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
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme, type ThemePreference } from '@/theme/useTheme';

interface UserMenuProps {
  isCollapsed?: boolean;
  variant?: 'default' | 'collapsed';
}

export function UserMenu({ isCollapsed, variant = 'default' }: UserMenuProps) {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { preference: currentTheme, setTheme } = useTheme();

  // Initialize theme from user profile
  useEffect(() => {
    if (profile?.theme_preference) {
      setTheme(profile.theme_preference as ThemePreference);
    }
  }, [profile, setTheme]);

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
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ease-in-out hover:bg-sidebar-accent w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
              <div className="relative">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                {profile?.force_password_change && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-sidebar cursor-help">
                          <AlertCircle className="h-3 w-3 text-white" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-semibold text-red-500 mb-1">Ação necessária!</p>
                        <p className="text-xs">Por motivos de segurança, você precisa alterar sua senha. Acesse seu perfil para atualizar.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium text-sidebar-foreground truncate w-full text-left">
                      {profile?.name}
                    </span>
                    <span className="text-xs text-sidebar-section-label truncate w-full text-left">
                      {profile?.email}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-sidebar-section-label flex-shrink-0" />
                </>
              )}
            </DropdownMenuTrigger>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
              <div className="text-sm font-medium">{profile?.name}</div>
              <div className="text-xs opacity-70">{profile?.email}</div>
              {profile?.force_password_change && (
                <div className="text-xs text-red-400 mt-2 font-semibold">
                  ⚠️ Alterar senha necessária
                </div>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent 
        align={variant === "collapsed" ? "start" : "end"}
        side={variant === "collapsed" ? "right" : "bottom"}
        sideOffset={variant === "collapsed" ? 8 : 0}
        className="w-64"
      >
        {profile?.force_password_change && (
          <>
            <div className="px-2 py-2 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 mx-2 mt-2 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">Ação necessária</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    Altere sua senha por motivos de segurança
                  </p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{profile?.name}</span>
              <span className="text-xs text-muted-foreground truncate">{profile?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate('/perfil')}>
          <User className="mr-2 h-4 w-4" />
          <span className="flex-1">Perfil</span>
          {profile?.force_password_change && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            {getThemeIcon()}
            <span className="ml-2">Tema</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={currentTheme} onValueChange={(value) => handleThemeChange(value as ThemePreference)}>
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
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sair da Conta
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
