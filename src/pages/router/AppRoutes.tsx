import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { appRoutes } from "./routes";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import NotFound from "@/pages/NotFound";
import CompanyUsers from "../private/company-users";
import MyDashboard from "../private/my-dashboard";
import Icons from "../private/icons";
import IconForm from "../private/icons/form";
import Charges from "../private/@assas/charges";
import Subscriptions from "../private/@assas/subscriptions";
import Customers from "../private/@assas/customers";
import Sales from "../private/@marvee/sales";
import Purchases from "../private/@marvee/purcharse";
import Extract from "../private/@marvee/extract";
import MarveeCustomers from "../private/@marvee/customer";
import CostCenters from "../private/@marvee/cost_center";
import Categories from "../private/@marvee/category";
import Conciliation from "../private/@assas/conciliation";
import AsaasHome from "../private/@assas/home";
import Inbox from "../private/@mails/inbox";

// Loading component
const LoadingFallback = () => (
  <div className="flex min-h-screen w-screen items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingFallback />;
  }
  
  return <Navigate to={isAuthenticated ? "/splash" : "/login"} replace />;
};

export function AppRoutes() {
  const LoginComponent = appRoutes["/login"].component;
  const HomeComponent = appRoutes["/home"].component;
  const SetupComponent = appRoutes["/setup"].component;
  const UsersComponent = appRoutes["/usuarios-app"].component;
  const UserFormComponent = appRoutes["/usuarios-app/form"].component;
  const CompaniesComponent = appRoutes["/empresas"].component;
  const ExtratoComponent = appRoutes["/extrato"].component;
  const DashboardComponent = appRoutes["/dashboard-fechamento"].component;
  const ProfileComponent = appRoutes["/perfil"].component;
  const SplashComponent = appRoutes["/splash"].component;
  const ModuleComponent = appRoutes["/modulos"].component;
  const ModuleFormComponent = appRoutes["/modulos/form"].component;
  const CadastroComponent = appRoutes["/cadastros"].component;
  const CadastroFormComponent = appRoutes["/cadastros/form"].component;
  const PlanoComponent = appRoutes["/planos"].component;
  const PlanoFormComponent = appRoutes["/planos/form"].component;
  const UserProfileComponent = appRoutes["/perfis-de-usuario"].component;
  const ProjectsComponent = appRoutes["/projetos"].component;
  const ProjectFormComponent = appRoutes["/projetos/form"].component;
  const FreightImportsComponent = appRoutes["/rodoflip/importacao-fretes"].component;
  const AccountCategoriesComponent = appRoutes["/contas-gerenciais"].component;
  const AccountCategoryFormComponent = appRoutes["/contas-gerenciais/form"].component;
  const GerencialPlanComponent = appRoutes["/plano-gerencial"].component;
  const GerencialPlanFormComponent = appRoutes["/plano-gerencial/form"].component;
  const CustomersComponent = appRoutes["/clientes"].component;
  const AnalystsComponent = appRoutes["/analistas"].component;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        
        {/* Public routes */}
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/splash" element={<SplashComponent />} />

        {/* Private routes */}
        <Route path="/home" element={<HomeComponent />} />
        <Route path="/setup" element={<SetupComponent />} />

        <Route path="/usuarios-app" element={<UsersComponent />} />
        <Route path="/usuarios-app/novo" element={<UserFormComponent />} />
        <Route path="/usuarios-app/form" element={<UserFormComponent />} />

        <Route path="/empresas" element={<CompaniesComponent />} />
        <Route path="/empresas" element={<CompaniesComponent />} />
        
        <Route path="/modulos" element={<ModuleComponent />} />
        <Route path="/modulos/form" element={<ModuleFormComponent />} />
        
        <Route path="/cadastros" element={<CadastroComponent />} />
        <Route path="/cadastros/form" element={<CadastroFormComponent />} />
        
        <Route path="/extrato" element={<ExtratoComponent />} />
        <Route path="/dashboard-fechamento" element={<DashboardComponent />} />
        <Route path="/perfil" element={<ProfileComponent />} />
        
        
        <Route path="/planos" element={<PlanoComponent />} />
        <Route path="/planos/form" element={<PlanoFormComponent />} />
        
        <Route path="/perfis-de-usuario" element={<UserProfileComponent />} />

        <Route path="/usuarios" element={<CompanyUsers />} />

        <Route path="/meu-dashboard" element={<MyDashboard />} />
        
        <Route path="/projetos" element={<ProjectsComponent />} />
        <Route path="/projetos/form" element={<ProjectFormComponent />} />

        <Route path="/icones" element={<Icons />} />
        <Route path="/icones/form" element={<IconForm />} />
        
        <Route path="/rodoflip/importacao-fretes" element={<FreightImportsComponent />} />

        <Route path="/asaas-inicio" element={<AsaasHome />} />
        <Route path="/asaas-cobrancas" element={<Charges />} />

        <Route path="/asaas-assinaturas" element={<Subscriptions />} />

        <Route path="/asaas-clientes" element={<Customers />} />

        <Route path="/asaas-conciliacao" element={<Conciliation />} />
        
        <Route path="/marvee-vendas" element={<Sales />} />
        
        <Route path="/marvee-compras" element={<Purchases />} />
        
        <Route path="/marvee-extrato" element={<Extract />} />
        
        <Route path="/marvee-clientes" element={<MarveeCustomers />} />
        
        <Route path="/marvee-centros-de-custo" element={<CostCenters />} />
        
        <Route path="/marvee-categorias" element={<Categories />} />
        
        <Route path="/contas-gerenciais" element={<AccountCategoriesComponent />} />
        <Route path="/contas-gerenciais/form" element={<AccountCategoryFormComponent />} />
        
        <Route path="/plano-gerencial" element={<GerencialPlanComponent />} />
        <Route path="/plano-gerencial/form" element={<GerencialPlanFormComponent />} />
        
        <Route path="/clientes" element={<CustomersComponent />} />
        
        <Route path="/analistas" element={<AnalystsComponent />} />
        
        <Route path="/emails/caixa-de-entrada" element={<Inbox />} />
        
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

