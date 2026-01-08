/**
 * Utility to convert technical errors into user-friendly messages
 * Prevents information leakage while maintaining good UX
 */

type ErrorCode = string;

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // PostgreSQL error codes
  '23505': 'Este registro já existe no sistema.',
  '23503': 'Operação não permitida: há dependências associadas.',
  '23514': 'Os dados fornecidos não são válidos.',
  '42P01': 'Recurso não encontrado.',
  
  // API/Auth error codes
  'PGRST116': 'Registro não encontrado.',
  'invalid_grant': 'Credenciais inválidas.',
  'invalid_credentials': 'Email ou senha incorretos.',
  'email_not_confirmed': 'Por favor, confirme seu email primeiro.',
  'user_already_exists': 'Já existe uma conta com este email.',
  'weak_password': 'A senha precisa ser mais forte.',
  'over_email_send_rate_limit': 'Muitas tentativas. Aguarde alguns minutos.',
  
  // Network/API errors
  'network_error': 'Erro de conexão. Verifique sua internet.',
  'timeout': 'A operação demorou muito. Tente novamente.',
};

/**
 * Converts a technical error into a user-friendly message
 * @param error - The error object from API or other sources
 * @returns A safe, user-friendly error message
 */
export function getSafeErrorMessage(error: any): string {
  // Extract error code from various error formats
  const code = error?.code || error?.error_code || error?.statusCode?.toString();
  
  // Check if we have a mapped message
  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }
  
  // Check for originalMessage (from ApiException)
  const originalMessage = error?.originalMessage || error?.message;
  
  // Handle both string and array messages
  if (Array.isArray(originalMessage) && originalMessage.length > 0) {
    return originalMessage[0];
  }
  
  if (typeof originalMessage === 'string' && originalMessage) {
    const message = originalMessage.toLowerCase();
    
    if (message.includes('jwt') || message.includes('token')) {
      return 'Sua sessão expirou. Por favor, faça login novamente.';
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'Você não tem permissão para realizar esta operação.';
    }
    
    if (message.includes('duplicate') || message.includes('already exists')) {
      return 'Este registro já existe no sistema.';
    }
    
    // Return the original message if it's user-friendly
    return originalMessage;
  }
  
  // Default generic message - never expose technical details
  return 'Ocorreu um erro. Por favor, tente novamente.';
}

/**
 * Logs detailed error information for debugging (only in development)
 * @param context - Context where the error occurred
 * @param error - The error object
 */
export function logErrorDetails(context: string, error: any): void {
  if (import.meta.env.DEV) {
    console.error(`[${context}] Detailed error:`, error);
  }
}
