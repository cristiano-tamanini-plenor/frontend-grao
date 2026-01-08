import { cn } from '@/lib/utils';

interface StackProps {
  children: React.ReactNode;
  className?: string;
}

export const Stack = ({ children, className }: StackProps) => {
  return (
    <div className={cn("flex flex-col gap-6 p-6 h-full overflow-hidden min-h-0", className)}>
      {children}
    </div>
  );
};