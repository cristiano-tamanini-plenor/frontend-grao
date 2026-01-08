/**
 * API Client para comunicação com o backend NestJS
 * Gerencia tokens de autenticação e interceptors
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

// Storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Gerenciamento de tokens
 */
export const tokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  },
};

/**
 * Tipos de resposta da API
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

/**
 * Classe de erro customizada para erros da API
 */
export class ApiException extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public error?: string
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

/**
 * Cliente HTTP base
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Faz uma requisição HTTP
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const accessToken = tokenManager.getAccessToken();

    const headers: HeadersInit = {
      ...options.headers,
    };

    // Se não for FormData, adiciona Content-Type JSON
    // Se for FormData, o browser define automaticamente o Content-Type com boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Adiciona token de autenticação se disponível
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Se não houver conteúdo, retorna vazio
      const contentType = response.headers.get('content-type');
      const hasContent = contentType && contentType.includes('application/json');
      
      let data: any = null;
      if (hasContent) {
        data = await response.json();
      }

      // Se a resposta não for ok, lança erro
      if (!response.ok) {
        // Trata mensagem que pode ser string ou array
        let errorMessage: string;
        if (Array.isArray(data?.message)) {
          errorMessage = data.message.join(', ');
        } else if (typeof data?.message === 'string') {
          errorMessage = data.message;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        const error: ApiError = {
          message: errorMessage,
          statusCode: response.status,
          error: data?.error || response.statusText,
        };

        // Preserva a mensagem original (pode ser array) no objeto de erro
        const apiException = new ApiException(error.message, error.statusCode, error.error);
        // Adiciona a mensagem original para tratamento posterior
        (apiException as any).originalMessage = data?.message;
        (apiException as any).originalData = data;

        // Se for erro 401 (não autorizado), limpa tokens
        if (response.status === 401) {
          tokenManager.clearTokens();
          // Redireciona para login se estiver em uma rota privada
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        throw apiException;
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }

      // Erro de rede ou outro erro
      throw new ApiException(
        error instanceof Error ? error.message : 'Erro desconhecido na requisição'
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient(API_URL);


