import { calculatePasswordStrength, getPasswordStrengthLabel } from '@/lib/utils/password';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = calculatePasswordStrength(password);
  const label = getPasswordStrengthLabel(strength);
  
  const getBarColor = (index: number) => {
    if (index >= strength) return 'bg-muted';
    if (strength <= 1) return 'bg-destructive';
    if (strength === 2) return 'bg-warning';
    return 'bg-success';
  };

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-colors',
              getBarColor(index)
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Força da senha: <span className="font-medium">{label}</span>
      </p>
    </div>
  );
}
