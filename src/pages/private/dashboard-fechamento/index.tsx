import { PageHeader } from '@/components/layout/PageHeader';
import { PageContent } from '@/components/layout/PageContent';
import { LayoutDashboard, Presentation, ChevronLeft, ChevronRight, X } from 'lucide-react';
import marveeLogo from '@/assets/LogoMarveeLight.png';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ChartFaturamento from './faturamento/chartFaturamento';
import ChartGeracaoCaixa from './geracao-caixa/chartGeracaoCaixa';
import ChartFaturamentoAcumulado from './faturamento/chartFaturamentoAcumulado';
import FluxoDeCaixa from './fluxo_de_caixa';

export default function DashboardFechamento() {
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'faturamento',
      title: 'Faturamento Mensal',
      component: <ChartFaturamento isPresentationMode={isPresentationMode} />
    },
    {
      id: 'faturamento-acumulado',
      title: 'Faturamento Acumulado',
      component: <ChartFaturamentoAcumulado isPresentationMode={isPresentationMode} />
    },
    {
      id: 'geracao-caixa',
      title: 'Geração de Caixa',
      component: <ChartGeracaoCaixa isPresentationMode={isPresentationMode} />
    },
    {
      id: 'fluxo-caixa',
      title: 'Fluxo de Caixa',
      component: <FluxoDeCaixa isPresentationMode={isPresentationMode} />
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const enterPresentationMode = () => {
    setIsPresentationMode(true);
    setCurrentSlide(0);
  };

  const exitPresentationMode = () => {
    setIsPresentationMode(false);
  };

  return (
    <>
      <PageHeader 
        title="Dashboard de Fechamento" 
        description="Visualize os dados de fechamento"
        icon={<LayoutDashboard className="h-5 w-5 text-primary" />}
      >
        {!isPresentationMode && (
          <Button
            onClick={enterPresentationMode}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Presentation className="h-4 w-4" />
            Modo Apresentação
          </Button>
        )}
      </PageHeader>
      
      <PageContent>
        {!isPresentationMode ? (
          // Modo normal - grid de componentes
          <div id="dashboard-fechamento-grid" className="flex flex-col gap-6 items-center w-full h-full overflow-y-auto">
            <ChartFaturamento />
            <ChartFaturamentoAcumulado />
            <ChartGeracaoCaixa />
            <FluxoDeCaixa />
          </div>
        ) : (
          // Modo apresentação - carrossel fullscreen
          <div className="fixed inset-0 z-50 bg-gray-100 flex flex-col">
            {/* Conteúdo do slide - centralizado e maior */}
            <div className="flex-1 flex items-center justify-center p-8 pb-20">
              <div className="w-full h-full max-w-none flex items-center justify-center">
                <div className="w-full h-full max-h-[65vh]">
                  {slides[currentSlide].component}
                </div>
              </div>
            </div>

            {/* Logo da Marvee no topo esquerdo */}
            <div className="absolute top-4 left-4 z-20">
              <img 
                src={marveeLogo} 
                alt="Marvee Logo" 
                className="h-14 w-auto"
              />
            </div>

            {/* Controles de navegação flutuantes */}
            <div className="absolute top-4 right-4 z-20">
              <Button
                onClick={exitPresentationMode}
                variant="ghost"
                size="icon"
                className="bg-white/90 hover:bg-white shadow-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navegação inferior */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-6 z-20">
              <Button
                onClick={prevSlide}
                variant="outline"
                size="icon"
                disabled={currentSlide === 0}
                className="bg-white/90 hover:bg-white shadow-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Indicadores de slides */}
              <div className="flex gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-4 h-4 rounded-full transition-colors shadow-lg ${
                      index === currentSlide 
                        ? 'bg-primary' 
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={nextSlide}
                variant="outline"
                size="icon"
                disabled={currentSlide === slides.length - 1}
                className="bg-white/90 hover:bg-white shadow-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </PageContent>
    </>
  );
}