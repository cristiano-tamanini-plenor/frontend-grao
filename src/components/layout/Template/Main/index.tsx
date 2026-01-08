import { ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";

interface MainProps {
  children: ReactNode;
  className?: string;
}

/**
 * Main content wrapper component.
 * Provides a structured layout with optional header and footer.
 */
export default function Main({ 
  children, 
  className = "" 
}: MainProps) {
  return (
    <div id="main" className={`flex flex-col h-full ${className}`}>
      <div className="flex flex-col flex-1 overflow-hidden bg-background">
        {children}
      </div>
      <Footer />  
    </div>
  );
}