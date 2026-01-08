/**
 * Formata telefone brasileiro para exibição com máscara
 * Exemplo: +5511912345678 -> (11) 91234-5678
 */
export function formatPhoneBR(phone: string | null): string {
  if (!phone) return '';
  
  // Remove tudo exceto números
  const numbers = phone.replace(/\D/g, '');
  
  // Remove código do país se presente (55)
  const localNumber = numbers.startsWith('55') ? numbers.slice(2) : numbers;
  
  // Formata: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (localNumber.length === 11) {
    return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`;
  } else if (localNumber.length === 10) {
    return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 6)}-${localNumber.slice(6)}`;
  }
  
  return phone;
}

/**
 * Converte telefone brasileiro para formato E.164
 * Exemplo: (11) 91234-5678 -> +5511912345678
 */
export function toE164(phone: string): string {
  if (!phone) return '';
  
  // Remove tudo exceto números
  const numbers = phone.replace(/\D/g, '');
  
  // Se já tem código do país, adiciona +
  if (numbers.startsWith('55')) {
    return `+${numbers}`;
  }
  
  // Adiciona código do Brasil
  return `+55${numbers}`;
}

/**
 * Aplica máscara brasileira enquanto digita
 * Exemplo: 11912345678 -> (11) 91234-5678
 */
export function applyPhoneMask(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Valida se o telefone brasileiro é válido
 */
export function isValidBRPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  
  // Deve ter 10 (fixo) ou 11 (celular) dígitos
  if (numbers.length !== 10 && numbers.length !== 11) {
    return false;
  }
  
  // DDD deve estar entre 11 e 99
  const ddd = parseInt(numbers.slice(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  return true;
}

/**
 * Converte telefone E.164 para formato brasileiro de exibição
 * Exemplo: +5511912345678 -> (11) 91234-5678
 */
export function fromE164ToDisplay(phone: string, countryCode: string = '55'): string {
  if (!phone) return '';
  
  // Remove tudo exceto números
  const numbers = phone.replace(/\D/g, '');
  
  // Remove código do país se presente
  let localNumber = numbers;
  if (numbers.startsWith(countryCode)) {
    localNumber = numbers.slice(countryCode.length);
  }
  
  // Formata brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (localNumber.length === 11) {
    return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 7)}-${localNumber.slice(7)}`;
  } else if (localNumber.length === 10) {
    return `(${localNumber.slice(0, 2)}) ${localNumber.slice(2, 6)}-${localNumber.slice(6)}`;
  }
  
  return localNumber;
}

/**
 * Converte telefone de exibição para formato E.164
 * Exemplo: (11) 91234-5678 -> +5511912345678
 */
export function fromDisplayToE164(phone: string, countryCode: string = '55'): string {
  if (!phone) return '';
  
  // Remove tudo exceto números
  const numbers = phone.replace(/\D/g, '');
  
  // Se já começa com código do país, só adiciona +
  if (numbers.startsWith(countryCode)) {
    return `+${numbers}`;
  }
  
  // Adiciona código do país
  return `+${countryCode}${numbers}`;
}

/**
 * Aplica máscara brasileira enquanto digita
 * Exemplo: 11912345678 -> (11) 91234-5678
 */
export function applyBRPhoneMask(value: string): string {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}
