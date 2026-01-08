import { LicenseInfo } from "@mui/x-license-pro"
import { registerLicense } from "@syncfusion/ej2-base";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

LicenseInfo.setLicenseKey(import.meta.env.VITE_MUI_LICENSE);
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE);

// Silenciar logs do Workbox
if (typeof window !== 'undefined') {
  // Função auxiliar para verificar se algum argumento contém "workbox"
  const hasWorkboxLog = (args: any[]): boolean => {
    return args.some(arg => {
      if (typeof arg === 'string') {
        return arg.toLowerCase().includes('workbox');
      }
      return false;
    });
  };

  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  // Interceptar console.log
  console.log = (...args: any[]) => {
    if (hasWorkboxLog(args)) {
      return; // Não exibir logs do Workbox
    }
    originalConsoleLog.apply(console, args);
  };
  
  // Interceptar console.info
  console.info = (...args: any[]) => {
    if (hasWorkboxLog(args)) {
      return; // Não exibir logs do Workbox
    }
    originalConsoleInfo.apply(console, args);
  };
  
  // Interceptar console.warn
  console.warn = (...args: any[]) => {
    if (hasWorkboxLog(args)) {
      return; // Não exibir avisos do Workbox
    }
    originalConsoleWarn.apply(console, args);
  };

  // Interceptar console.error (caso o Workbox use)
  console.error = (...args: any[]) => {
    // Filtrar avisos do Emotion sobre :first-child (são apenas avisos de desenvolvimento)
    const errorMessage = args[0];
    if (
      typeof errorMessage === 'string' &&
      (errorMessage.includes(':first-child') || 
       errorMessage.includes('pseudo class') ||
       errorMessage.includes('server-side rendering'))
    ) {
      return; // Não exibir avisos do Emotion sobre :first-child
    }
    originalConsoleError.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);
