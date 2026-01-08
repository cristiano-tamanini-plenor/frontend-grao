/**
 * Remove non-numeric characters from CNPJ
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Format CNPJ string to XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cleanCNPJ(cnpj);
  
  if (cleaned.length !== 14) {
    return cnpj;
  }
  
  return cleaned.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Validate CNPJ format (14 digits)
 */
export function isValidCNPJFormat(cnpj: string): boolean {
  const cleaned = cleanCNPJ(cnpj);
  return cleaned.length === 14 && /^\d+$/.test(cleaned);
}

/**
 * Apply CNPJ mask while typing
 */
export function applyCNPJMask(value: string): string {
  const cleaned = cleanCNPJ(value);
  
  if (cleaned.length <= 2) {
    return cleaned;
  }
  if (cleaned.length <= 5) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  }
  if (cleaned.length <= 8) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
  }
  if (cleaned.length <= 12) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
  }
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
}
