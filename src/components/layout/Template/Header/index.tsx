import { ReactNode } from "react";
import Logomarca from "@/components/components/Logomarca";
import UserMenu from "./UserMenu";
import { useCompany } from "@/pages/private/company/hooks/useCompany";
import { formatCNPJ } from "@/lib/utils/cnpj";

interface HeaderProps {
  children?: ReactNode;
  className?: string;
}

/**
 * Header component for page layouts.
 * This is a basic header wrapper that can be extended.
 */
export default function Header({ children, className = "" }: HeaderProps) {
  const { currentCompany } = useCompany();

  const formatCompanyInfo = () => {
    if (!currentCompany) return null;

    const parts: string[] = [];
    
    if (currentCompany.cnpj) {
      parts.push(formatCNPJ(currentCompany.cnpj));
    }
    
    if (currentCompany.name) {
      parts.push(currentCompany.name);
    }
    
    if (currentCompany.system_nickname) {
      parts.push(currentCompany.system_nickname);
    }

    return parts.length > 0 ? parts.join(" - ") : null;
  };

  const companyInfo = formatCompanyInfo();

  return (
    <header 
      className={`h-10 w-full ${className} border-b`}
      style={{ backgroundColor: 'hsl(var(--header-bg-color))' }}
    >
      {children || (
        <div className="flex items-center justify-between h-full px-3">
          <div className="flex items-center justify-center">
            <Logomarca className="h-8 w-8" alt="TSA Logo" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            {companyInfo && (
              <span className="text-sm font-light">
                {companyInfo}
              </span>
            )}
          </div>
          <UserMenu />
        </div>
      )}
    </header>
  );
}