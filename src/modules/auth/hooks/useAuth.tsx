import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { tokenManager } from '@/lib/api/client';
import type { User, Profile, AppRole, UserType } from '../types';
import { can, type Permission } from '@/lib/rbac/permissions';
import { usersService } from '@/pages/private/user/services/users.service';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  requireAuth: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Converte type_user do backend para AppRole
 */
function mapUserTypeToRole(typeUser: UserType): AppRole {
  const mapping: Record<UserType, AppRole> = {
    owner: 'OWNER',
    member: 'MEMBER',
    member_limited: 'MEMBER_LIMITED',
    guest: 'GUEST',
    developer: 'DEVELOPER',
  };
  return mapping[typeUser] || 'MEMBER';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se há token salvo e tenta restaurar sessão
    const checkAuth = async () => {
      try {
        const session = await authService.getSession();
        
        if (session?.accessToken) {
          // Tenta buscar o usuário atual do backend
          try {
            const userData = await usersService.validateUser();
            setUser({
              id: Number(userData.id),
              email: userData.email,
              name: userData.name,
              type_user: userData.type_user,
            });
            setRole(mapUserTypeToRole(userData.type_user));
            
            // Criar profile com dados completos incluindo avatar_url
            setProfile({
              id: String(userData.id),
              email: userData.email,
              name: userData.name,
              avatar_url: userData.avatar_url || null,
              phone_e164: userData.phone_e164 || null,
            });
            
            // Atualiza localStorage com dados atualizados
            localStorage.setItem('currentUser', JSON.stringify({
              id: Number(userData.id),
              email: userData.email,
              name: userData.name,
              type_user: userData.type_user,
              avatar: userData.avatar_url || null,
            }));
          } catch (backendError) {
            // Se falhar ao buscar do backend, tenta usar localStorage como fallback
            console.warn('Error fetching user from backend, using localStorage:', backendError);
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
              try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setRole(mapUserTypeToRole(parsedUser.type_user));
                
                // Criar profile a partir do user salvo
                setProfile({
                  id: String(parsedUser.id),
                  email: parsedUser.email,
                  name: parsedUser.name,
                  avatar_url: parsedUser.avatar || null,
                });
              } catch (error) {
                console.error('Error parsing saved user:', error);
              }
            }
          }
        } else {
          // Sem token, limpa estado
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      } catch (error) {
        // Em caso de erro, limpa tudo
        setUser(null);
        setProfile(null);
        setRole(null);
        tokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await authService.signIn({ email, password });
      
      // Busca dados completos do usuário do backend para obter avatar_url
      let userData;
      try {
        userData = await usersService.validateUser();
      } catch (error) {
        console.warn('Error fetching user data after login, using signIn result:', error);
        // Se falhar, usa os dados do signIn
        userData = {
          id: String(result.user.id),
          email: result.user.email,
          name: result.user.name,
          type_user: result.user.type_user,
          avatar_url: null,
        };
      }
      
      // Salva o usuário no estado
      setUser(result.user);
      setRole(mapUserTypeToRole(result.user.type_user));
      
      // Cria profile com dados completos incluindo avatar_url
      const userProfile: Profile = {
        id: String(userData.id),
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url || null,
        phone_e164: userData.phone_e164 || null,
      };
      setProfile(userProfile);
      
      // Salva no localStorage para persistência com avatar
      localStorage.setItem('currentUser', JSON.stringify({
        ...result.user,
        avatar: userData.avatar_url || null,
      }));
      
      // Salva email para lembrar no próximo login
      localStorage.setItem('lastLoginEmail', result.user.email);
      
      navigate('/splash');
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    // Verificar se há preferência de salvar email (se não foi removido manualmente)
    const shouldSave = localStorage.getItem('lastLoginEmail') !== null;
    
    // Salvar email e avatar no localStorage antes de fazer logout apenas se já estavam salvos
    if (shouldSave && profile?.email) {
      localStorage.setItem('lastLoginEmail', profile.email);
    }
    if (shouldSave && profile?.avatar_url) {
      localStorage.setItem('lastLoginAvatar', profile.avatar_url);
    }
    
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setRole(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const requireAuth = () => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  };

  const refreshProfile = async () => {
    try {
      // Busca dados atualizados do backend
      const userData = await usersService.validateUser();
      
      // Atualiza o estado do usuário
      setUser({
        id: Number(userData.id),
        email: userData.email,
        name: userData.name,
        type_user: userData.type_user,
      });
      setRole(mapUserTypeToRole(userData.type_user));
      
      // Atualiza o profile com dados completos incluindo avatar_url
      setProfile({
        id: String(userData.id),
        email: userData.email,
        name: userData.name,
        avatar_url: userData.avatar_url || null,
        phone_e164: userData.phone_e164 || null,
      });
      
      // Atualiza localStorage com dados atualizados
      localStorage.setItem('currentUser', JSON.stringify({
        id: Number(userData.id),
        email: userData.email,
        name: userData.name,
        type_user: userData.type_user,
        avatar: userData.avatar_url || null,
      }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Em caso de erro, tenta usar localStorage como fallback
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setRole(mapUserTypeToRole(parsedUser.type_user));
          setProfile({
            id: String(parsedUser.id),
            email: parsedUser.email,
            name: parsedUser.name,
            avatar_url: parsedUser.avatar || null,
          });
        } catch (parseError) {
          console.error('Error parsing saved user:', parseError);
        }
      }
    }
  };

  const canPerform = (permission: Permission): boolean => {
    return can(role || undefined, permission);
  };

  const value = {
    user,
    profile,
    role,
    isLoading,
    isAuthenticated: !!user && !!tokenManager.getAccessToken(),
    can: canPerform,
    signIn,
    signOut,
    requireAuth,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
