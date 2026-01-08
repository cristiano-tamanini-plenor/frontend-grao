import { apiClient, tokenManager } from '@/lib/api/client';
import type { SignInCredentials, SignInResponse, SignUpData, Profile, User } from '../types';

export const authService = {
  /**
   * Faz login do usuário
   */
  async signIn({ email, password }: SignInCredentials): Promise<SignInResponse> {
    const response = await apiClient.post<SignInResponse>('/auth', {
      email,
      password,
    });

    // Salva os tokens
    tokenManager.setTokens(response.accessToken, response.refreshToken);

    return response;
  },

  /**
   * Registra novo usuário
   */
  async signUp({ email, password, name, role = 'MEMBER' }: SignUpData) {
    // TODO: Implementar quando a rota estiver disponível no backend
    throw new Error('SignUp não implementado ainda');
  },

  /**
   * Faz logout do usuário
   */
  async signOut() {
    // Limpa os tokens do localStorage
    tokenManager.clearTokens();
    // TODO: Chamar endpoint de logout no backend quando disponível
  },

  /**
   * Obtém a sessão atual (verifica se há token válido)
   */
  async getSession() {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) return null;

    // TODO: Validar token com backend se necessário
    return { accessToken };
  },

  /**
   * Obtém o usuário atual
   * TODO: Implementar endpoint no backend para obter usuário atual
   */
  async getCurrentUser(): Promise<User | null> {
    const accessToken = tokenManager.getAccessToken();
    if (!accessToken) return null;

    try {
      // TODO: Criar endpoint /auth/me no backend
      // const user = await apiClient.get<User>('/auth/me');
      // return user;
      
      // Por enquanto, retorna null e deixa o useAuth buscar de outra forma
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  /**
   * Altera a senha do usuário
   * TODO: Implementar quando a rota estiver disponível
   */
  async updatePassword(newPassword: string) {
    // TODO: Implementar endpoint no backend
    throw new Error('updatePassword não implementado ainda');
  },

  /**
   * Atualiza o perfil do usuário
   * TODO: Implementar quando a rota estiver disponível
   */
  async updateProfile(updates: Partial<Profile>) {
    // TODO: Implementar endpoint no backend
    throw new Error('updateProfile não implementado ainda');
  },

  /**
   * Registra ação no audit log
   * TODO: Implementar quando a rota estiver disponível
   */
  async logAudit(action: any, targetUserId?: string, metadata?: any) {
    // TODO: Implementar endpoint no backend
    console.log('Audit log:', { action, targetUserId, metadata });
  },
};
