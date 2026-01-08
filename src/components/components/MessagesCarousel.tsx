import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const MENSAGENS = [
  { texto: "Equipe organizada e focada, gera grandes resultados", autor: "Marvee" },
  { texto: "Estamos aqui para apoiar o empreendedor brasileiro", autor: "Marvee" },
  { texto: "Dinheiro não aceita desaforo.", autor: "Marvee" },
  { texto: "Seja leve com as pessoas e pesado com os problemas.", autor: "Marvee" },
  { texto: "Assuma a responsabilidade ao invés de procurar culpados.", autor: "Marvee" },
  { texto: "Transforme todo problema em uma melhoria nos processos.", autor: "Marvee" },
  { texto: "Não seja medíocre, pois a média é uma merda.", autor: "Marvee" },
  { texto: "Dados comem feeling no café da manhã.", autor: "Marvee" },
  { texto: "Não se pergunta o que o Google responde.", autor: "Marvee" },
  { texto: "Detalhes importam.", autor: "Marvee" },
  { texto: "Trabalhar dá trabalho.", autor: "Marvee" }
];

export function MessagesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      setTimeout(() => {
        // Change message
        setCurrentIndex((prev) => (prev + 1) % MENSAGENS.length);
        // Fade in
        setIsVisible(true);
      }, 300); // Small delay for smooth transition
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentMessage = MENSAGENS[currentIndex];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 w-full max-w-xl">
      <CardContent className="p-6">
        <div 
          className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          <p className="text-white text-lg md:text-xl font-medium italic mb-2">
            "{currentMessage.texto}"
          </p>
          <p className="text-white/80 text-sm md:text-base">
            — {currentMessage.autor}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
