import { useEffect, useState } from "react";
import { Beer, Sparkles, Brain, Zap } from "lucide-react";

interface BeerAILoaderProps {
  onComplete?: () => void;
  type?: "initial" | "search";
}

const initialMessages = [
  { icon: Brain, text: "Iniciando el sommelier de cervezas IA...", duration: 800 },
  { icon: Sparkles, text: "Cargando base de conocimiento cervecero...", duration: 900 },
  { icon: Beer, text: "Preparando recomendaciones personalizadas...", duration: 700 },
];

const searchMessages = [
  { icon: Brain, text: "Analizando tus preferencias...", duration: 800 },
  { icon: Zap, text: "Procesando datos con IA...", duration: 900 },
  { icon: Sparkles, text: "Encontrando las cervezas perfectas...", duration: 800 },
  { icon: Beer, text: "Preparando resultados...", duration: 600 },
];

export const BeerAILoader = ({ onComplete, type = "initial" }: BeerAILoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const messages = type === "initial" ? initialMessages : searchMessages;

  useEffect(() => {
    if (currentStep < messages.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, messages[currentStep].duration);
      return () => clearTimeout(timer);
    } else {
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onComplete?.();
        }, 500);
      }, 400);
      return () => clearTimeout(fadeTimer);
    }
  }, [currentStep, messages, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="text-center px-4 max-w-md w-full">
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-ping" />
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Beer className="text-white" size={40} />
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 min-h-[100px] sm:min-h-[120px]">
          {messages.map((message, index) => {
            const Icon = message.icon;
            const isActive = index === currentStep;
            const isPast = index < currentStep;

            return (
              <div
                key={index}
                className={`flex items-center justify-center gap-2 sm:gap-3 transition-all duration-500 ${
                  isActive
                    ? "opacity-100 scale-100 translate-y-0"
                    : isPast
                    ? "opacity-40 scale-95 -translate-y-2"
                    : "opacity-0 scale-95 translate-y-2"
                }`}
              >
                <Icon
                  className={`flex-shrink-0 ${
                    isActive ? "text-primary animate-pulse" : "text-muted-foreground"
                  }`}
                  size={20}
                />
                <p
                  className={`text-sm sm:text-base md:text-lg font-medium leading-tight ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {message.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 sm:mt-8 flex justify-center gap-1.5 sm:gap-2">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index <= currentStep ? "w-6 sm:w-8 bg-gradient-to-r from-primary to-accent" : "w-1.5 sm:w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <p className="mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground animate-pulse">
          Powered by Beer AI 🧠✨
        </p>
      </div>
    </div>
  );
};
