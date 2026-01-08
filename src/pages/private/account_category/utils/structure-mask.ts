/**
 * Aplica máscara na estrutura baseada no nível
 * Primary: xx (2 dígitos)
 * Secondary: xx.xx (4 dígitos)
 * Tertiary: xx.xx.xx (6 dígitos)
 */
export function applyStructureMask(value: string, level: 'primary' | 'secondary' | 'tertiary'): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  switch (level) {
    case 'primary':
      // Máscara: xx (máximo 2 dígitos)
      if (numbers.length <= 2) {
        return numbers;
      }
      return numbers.slice(0, 2);
      
    case 'secondary':
      // Máscara: xx.xx (máximo 4 dígitos)
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      }
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}`;
      
    case 'tertiary':
      // Máscara: xx.xx.xx (máximo 6 dígitos)
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 4) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4)}`;
      }
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 6)}`;
      
    default:
      return numbers;
  }
}

/**
 * Formata número com zero à esquerda se necessário
 * Exemplo: 4 -> 04, 12 -> 12
 */
export function formatWithLeadingZero(num: number): string {
  return num.toString().padStart(2, '0');
}

