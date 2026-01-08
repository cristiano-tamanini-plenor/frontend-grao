/**
 * Gera uma senha temporária aleatória segura
 */
export function generateTemporaryPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Garante que tenha pelo menos um de cada tipo
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Preenche o resto
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Embaralha
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Calcula a força da senha (0-4)
 * 0: Muito fraca, 1: Fraca, 2: Média, 3: Forte, 4: Muito forte
 */
export function calculatePasswordStrength(password: string): number {
  if (!password) return 0;
  
  let strength = 0;
  
  // Comprimento
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Complexidade
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  return Math.min(4, strength);
}

/**
 * Retorna label da força da senha
 */
export function getPasswordStrengthLabel(strength: number): string {
  const labels = ['Muito fraca', 'Fraca', 'Média', 'Forte', 'Muito forte'];
  return labels[strength] || labels[0];
}

/**
 * Retorna cor da força da senha
 */
export function getPasswordStrengthColor(strength: number): string {
  const colors = ['destructive', 'destructive', 'warning', 'success', 'success'];
  return colors[strength] || colors[0];
}
