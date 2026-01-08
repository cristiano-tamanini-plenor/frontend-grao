import { lazyImport } from "@/utils/lazyImport";

/**
 * Application routes configuration with lazy loading
 * Each route defines its path and the component to load
 */
export const appRoutes = {
  // Public routes
  "/login": {
    component: lazyImport(() => import("@/pages/public/Login")),
  },
  
  // Private routes
  "/home": {
    component: lazyImport(() => import("@/pages/private/home")),
  },
  "/setup": {
    component: lazyImport(() => import("@/pages/Setup")),
  },
  "/usuarios-app": {
    component: lazyImport(() => import("@/pages/private/user")),
  },
  "/usuarios-app/form": {
    component: lazyImport(() => import("@/pages/private/user/form")),
  },
  "/empresas": {
    component: lazyImport(() => import("@/pages/private/company")),
  },
  "/extrato": {
    component: lazyImport(() => import("@/pages/private/extrato")),
  },
  "/dashboard-fechamento": {
    component: lazyImport(() => import("@/pages/private/dashboard-fechamento")),
  },
  "/perfil": {
    component: lazyImport(() => import("@/pages/private/profile")),
  },
  "/splash": {
    component: lazyImport(() => import("@/pages/SplashScreen")),
  },
  "/modulos": {
    component: lazyImport(() => import("@/pages/private/module")),
  },
  "/modulos/form": {
    component: lazyImport(() => import("@/pages/private/module/form")),
  },
  "/cadastros": {
    component: lazyImport(() => import("@/pages/private/cadastro")),
  },
  "/cadastros/form": {
    component: lazyImport(() => import("@/pages/private/cadastro/form")),
  },
  "/planos": {
    component: lazyImport(() => import("@/pages/private/plan")),
  },
  "/planos/form": {
    component: lazyImport(() => import("@/pages/private/plan/form")),
  },
  "/cadastros/empresas": {
    component: lazyImport(() => import("@/pages/private/company")),
  },
  "/perfis-de-usuario": {
    component: lazyImport(() => import("@/pages/private/user-profile")),
  },
  "/usuarios": {
    component: lazyImport(() => import("@/pages/private/company-users")),
  },
  "/meu-dashboard": {
    component: lazyImport(() => import("@/pages/private/my-dashboard")) 
  },
  "/projetos": {
    component: lazyImport(() => import("@/pages/private/project")),
  },
  "/projetos/form": {
    component: lazyImport(() => import("@/pages/private/project/form")),
  },
  "/rodoflip/importacao-fretes": {
    component: lazyImport(() => import("@/pages/private/rodoflip/importacao-fretes")),
  },
  "/asaas-assinaturas": {
    component: lazyImport(() => import("@/pages/private/@assas/subscriptions")),
  },
  "/asaas-clientes": {
    component: lazyImport(() => import("@/pages/private/@assas/customers")),
  },
  "/contas-gerenciais": {
    component: lazyImport(() => import("@/pages/private/account_category")),
  },
  "/contas-gerenciais/form": {
    component: lazyImport(() => import("@/pages/private/account_category/form")),
  },
  "/plano-gerencial": {
    component: lazyImport(() => import("@/pages/private/gerencial_plan")),
  },
  "/plano-gerencial/form": {
    component: lazyImport(() => import("@/pages/private/gerencial_plan/form")),
  },
  "/clientes": {
    component: lazyImport(() => import("@/pages/private/customer")),
  },
  "/analistas": {
    component: lazyImport(() => import("@/pages/private/analyst")),
  },
  "/marvee-centros-de-custo": {
    component: lazyImport(() => import("@/pages/private/@marvee/cost_center")),
  },
  "/marvee-categorias": {
    component: lazyImport(() => import("@/pages/private/@marvee/category")),
  },
  "/emails/caixa-de-entrada": {
    component: lazyImport(() => import("@/pages/private/@mails/inbox")),
  },
} as const;

