import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Send, MessageCircle, Bot, User, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BeerAILoader } from "@/components/BeerAILoader";

// Sistema de tracking de respuestas más utilizadas
const ANSWER_STATS_KEY = 'beer-ai-answer-stats';

interface AnswerStats {
  [answer: string]: number;
}

const getAnswerStats = (): AnswerStats => {
  try {
    const stored = localStorage.getItem(ANSWER_STATS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const updateAnswerStats = (answer: string) => {
  const stats = getAnswerStats();
  stats[answer] = (stats[answer] || 0) + 1;
  localStorage.setItem(ANSWER_STATS_KEY, JSON.stringify(stats));
};

const sortAnswersByPopularity = (answers: string[]): string[] => {
  const stats = getAnswerStats();
  return [...answers].sort((a, b) => {
    const countA = stats[a] || 0;
    const countB = stats[b] || 0;
    return countB - countA; // Orden descendente (más usadas primero)
  });
};

interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: any) => void;
  onStartSearch?: () => void;
}

const conversationSteps = {
  initial: {
    question: "¡Hola! ¿Con qué puedo ayudarte?",
    answers: [
      "🌍 Buscar por país de origen",
      "🍺 Recomendarme por estilo",
      "🍋 Buscar por sabor específico",
      "💪 Encontrar por intensidad",
      "🎯 Búsqueda completa personalizada"
    ]
  },
  
  country: {
    question: "¡Perfecto! ¿De qué país te gustaría probar cervezas?",
    answers: [
      "🇩🇴 República Dominicana",
      "🇺🇸 Estados Unidos", 
      "🇲🇽 México",
      "🇩🇪 Alemania",
      "🇧🇪 Bélgica",
      "🇬🇧 Reino Unido"
    ]
  },

  style: {
    question: "¡Excelente! ¿Qué estilo de cerveza prefieres?",
    answers: [
      "🍺 IPA",
      "⚫ Stout",
      "✨ Lager",
      "🟠 Amber Ale",
      "🌾 Wheat Beer",
      "☁️ Hazy IPA"
    ]
  },

  flavor: {
    question: "¡Me encanta! ¿Qué sabor específico buscas?",
    answers: [
      "🍋 Cítrico",
      "🥥 Tropical",
      "🍫 Chocolate",
      "☕ Café",
      "🍯 Caramelo",
      "🍓 Frutal"
    ]
  },

  intensity: {
    question: "¡Perfecto! ¿Qué intensidad prefieres?",
    answers: [
      "🪶 Ligera (< 5% ABV)",
      "⚖️ Media (5-6.5% ABV)",
      "💪 Fuerte (> 6.5% ABV)"
    ]
  }
};

export const AIChat = ({ isOpen, onClose, onSearch, onStartSearch }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: conversationSteps.initial.question,
      timestamp: new Date()
    }
  ]);
  const [currentStep, setCurrentStep] = useState<'initial' | 'country' | 'style' | 'flavor' | 'intensity'>('initial');
  const [selectedFilters, setSelectedFilters] = useState<any>({
    style: [],
    color: [],
    flavor: [],
    strength: [],
    bitterness: [],
    origin: []
  });
  const [showAnswers, setShowAnswers] = useState(false);
  const [answerKey, setAnswerKey] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchLoader, setShowSearchLoader] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const [sortedAnswers, setSortedAnswers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    // Solo hacer scroll si no hay respuestas visibles o si es la primera vez
    if (!showAnswers || messages.length <= 2) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: conversationSteps.initial.question,
        timestamp: new Date()
      }
    ]);
    setCurrentStep('initial');
    setSelectedFilters({
      style: [],
      color: [],
      flavor: [],
      strength: [],
      bitterness: [],
      origin: []
    });
    setShowAnswers(false);
    setAnswerKey(prev => prev + 1);
    setIsTyping(false);
    setLastActivityTime(Date.now());
  };

  const updateActivity = () => {
    setLastActivityTime(Date.now());
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll cuando se muestran las respuestas
  useEffect(() => {
    if (showAnswers) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 800); // Esperar a que termine la animación de cascada
      return () => clearTimeout(timer);
    }
  }, [showAnswers]);

  // Mostrar respuestas iniciales al abrir el chat
  useEffect(() => {
    if (isOpen && currentStep === 'initial') {
      const timer = setTimeout(() => {
        setShowAnswers(true);
      }, 600); // Reducido de 1000ms a 600ms
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep]);

  // Reiniciar chat después de 10 segundos de inactividad
  useEffect(() => {
    if (!isOpen) return;

    // Limpiar timer anterior si existe
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Crear nuevo timer
    inactivityTimerRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (timeSinceLastActivity >= 10000) {
        // 10 segundos de inactividad
        resetChat();
        // Mostrar respuestas iniciales después del reset
        setTimeout(() => {
          setShowAnswers(true);
        }, 600);
      }
    }, 10000);

    // Cleanup al desmontar o cuando cambie la dependencia
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isOpen, lastActivityTime]);

  // Ordenar respuestas por popularidad cuando cambia el paso
  useEffect(() => {
    if (conversationSteps[currentStep]) {
      const answers = conversationSteps[currentStep].answers;
      const sorted = sortAnswersByPopularity(answers);
      setSortedAnswers(sorted);
    }
  }, [currentStep, answerKey]);

  // Reiniciar conversación cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      // Resetear el chat a su estado inicial
      resetChat();
    }
  }, [isOpen]);

  const addMessage = (type: 'ai' | 'user', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addTypingMessage = (content: string, callback?: () => void) => {
    setIsTyping(true);
    
    // Simular tiempo de escritura más rápido
    const typingDuration = Math.min(content.length * 15, 1200); // 15ms por carácter, máximo 1.2s
    
    setTimeout(() => {
      // Crear el mensaje completo cuando termine de "escribir"
      const newMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      
      if (callback) {
        setTimeout(callback, 300); // Reducido de 500ms a 300ms
      }
    }, typingDuration);
  };

  const handlePredefinedAnswer = (answer: string) => {
    // Actualizar actividad
    updateActivity();
    
    // Registrar la respuesta en las estadísticas
    updateAnswerStats(answer);
    
    // Ocultar respuestas inmediatamente
    setShowAnswers(false);
    
    // Primero mostrar la respuesta del usuario
    addMessage('user', answer);

    // Esperar un poco para que se vea la respuesta del usuario
    setTimeout(() => {
      // Procesar la respuesta según el paso actual
      let updatedFilters = { ...selectedFilters };
      let nextStep = currentStep;

      if (currentStep === 'initial') {
        // Determinar el siguiente paso basado en la respuesta
        if (answer.includes('país') || answer.includes('origen')) {
          nextStep = 'country';
        } else if (answer.includes('estilo')) {
          nextStep = 'style';
        } else if (answer.includes('sabor')) {
          nextStep = 'flavor';
        } else if (answer.includes('intensidad')) {
          nextStep = 'intensity';
        } else if (answer.includes('completa')) {
          // Búsqueda completa - ir directamente al catálogo
          setTimeout(() => {
            addTypingMessage('¡Perfecto! Te voy a mostrar todas nuestras cervezas disponibles 🍺', () => {
              setTimeout(() => {
                onStartSearch?.(); // Iniciar búsqueda en el componente padre
                onSearch({}); // Pasar filtros vacíos para catálogo completo
              }, 500);
            });
          }, 800); // Reducido de 1500ms a 800ms
          return;
        }
      } else {
        // Procesar la selección específica
        if (currentStep === 'country') {
          // Extraer el país correctamente del emoji + texto
          if (answer.includes("República Dominicana")) updatedFilters.origin = ["República Dominicana"];
          else if (answer.includes("Estados Unidos")) updatedFilters.origin = ["Estados Unidos"];
          else if (answer.includes("México")) updatedFilters.origin = ["México"];
          else if (answer.includes("Alemania")) updatedFilters.origin = ["Alemania"];
          else if (answer.includes("Bélgica")) updatedFilters.origin = ["Bélgica"];
          else if (answer.includes("Reino Unido")) updatedFilters.origin = ["Reino Unido"];
        } else if (currentStep === 'style') {
          // Extraer el estilo correctamente
          if (answer.includes("IPA")) updatedFilters.style = ["IPA"];
          else if (answer.includes("Stout")) updatedFilters.style = ["Stout"];
          else if (answer.includes("Lager")) updatedFilters.style = ["Lager"];
          else if (answer.includes("Amber")) updatedFilters.style = ["Amber Ale"];
          else if (answer.includes("Wheat")) updatedFilters.style = ["Wheat Beer"];
          else if (answer.includes("Hazy")) updatedFilters.style = ["Hazy IPA"];
        } else if (currentStep === 'flavor') {
          // Extraer el sabor correctamente
          if (answer.includes("Cítrico")) updatedFilters.flavor = ["Cítrico"];
          else if (answer.includes("Tropical")) updatedFilters.flavor = ["Tropical"];
          else if (answer.includes("Chocolate")) updatedFilters.flavor = ["Chocolate"];
          else if (answer.includes("Café")) updatedFilters.flavor = ["Café"];
          else if (answer.includes("Caramelo")) updatedFilters.flavor = ["Caramelo"];
          else if (answer.includes("Frutal")) updatedFilters.flavor = ["Frutal"];
        } else if (currentStep === 'intensity') {
          if (answer.includes("Ligera")) updatedFilters.strength = ["light"];
          else if (answer.includes("Media")) updatedFilters.strength = ["medium"];
          else if (answer.includes("Fuerte")) updatedFilters.strength = ["strong"];
        }

        // Finalizar después de cualquier selección específica
        setTimeout(() => {
          addTypingMessage('¡Perfecto! Basándome en tus preferencias, voy a buscar las cervezas ideales para ti 🎯', () => {
            setTimeout(() => {
              console.log('🔍 Filtros desde chat:', updatedFilters); // Debug
              onStartSearch?.(); // Iniciar búsqueda en el componente padre
              onSearch(updatedFilters); // Pasar los filtros
            }, 500);
          });
        }, 800); // Reducido de 1500ms a 800ms
        return;
      }

      setSelectedFilters(updatedFilters);
      setCurrentStep(nextStep);

        // Mostrar siguiente pregunta con animación de escritura
        setTimeout(() => {
          const nextQuestion = conversationSteps[nextStep].question;
          addTypingMessage(nextQuestion, () => {
            // Mostrar nuevas respuestas después de que termine de escribir
            setShowAnswers(true);
            setAnswerKey(prev => prev + 1); // Forzar re-render para nueva animación
          });
        }, 800); // Reducido de 1500ms a 800ms
    }, 500); // Reducido de 800ms a 500ms
  };

  const handleSearchComplete = () => {
    // Obtener los filtros actuales
    const currentFilters = currentStep === 'country' || currentStep === 'style' || 
                          currentStep === 'flavor' || currentStep === 'intensity' ? 
                          selectedFilters : {};
    
    onSearch(currentFilters);
    setShowSearchLoader(false); // Ocultar el loader
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md h-[650px] flex flex-col bg-gradient-to-b from-card to-card/95 border-border shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Beer AI
              </h3>
              <p className="text-xs text-muted-foreground">Tu sommelier personal</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-background/50 to-transparent">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`max-w-[85%] p-4 rounded-3xl shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground ml-4'
                    : 'bg-gradient-to-r from-muted to-muted/80 text-foreground mr-4 border border-border/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {message.type === 'ai' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={12} className="text-primary" />
                    </div>
                  )}
                  {message.type === 'user' && (
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={12} className="text-white" />
                    </div>
                  )}
                  <p className="text-sm font-medium leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Predefined Answers */}
          {conversationSteps[currentStep] && showAnswers && sortedAnswers.length > 0 && (
            <div className="space-y-4" key={answerKey}>
              <div className="text-center animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-primary">Selecciona una opción</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {sortedAnswers.map((answer, index) => {
                  const stats = getAnswerStats();
                  const count = stats[answer] || 0;
                  const isPopular = count > 0;
                  
                  return (
                    <Button
                      key={`${answerKey}-${index}`}
                      variant="outline"
                      size="lg"
                      onClick={() => handlePredefinedAnswer(answer)}
                      className={`group justify-start text-left h-auto py-4 px-4 rounded-2xl border-2 ${
                        isPopular && index === 0 
                          ? 'border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10' 
                          : 'border-border/50'
                      } hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cascade-animation relative`}
                    >
                      {isPopular && index === 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent text-white text-[10px] px-2 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                          <TrendingUp size={10} />
                          Popular
                        </div>
                      )}
                      <div className="flex items-center gap-3 w-full">
                        <div className="text-lg group-hover:scale-110 transition-transform duration-200">
                          {answer.split(' ')[0]}
                        </div>
                        <span className="font-medium text-sm group-hover:text-primary transition-colors duration-200 flex-1">
                          {answer.split(' ').slice(1).join(' ')}
                        </span>
                        {count > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 bg-muted">
                            {count}x
                          </Badge>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="max-w-[85%] p-4 rounded-3xl shadow-lg bg-gradient-to-r from-muted to-muted/80 text-foreground mr-4 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>IA activa - Selecciona una opción para continuar</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Search Loader */}
      {showSearchLoader && (
        <BeerAILoader
          type="search"
          onComplete={handleSearchComplete}
        />
      )}
    </div>
  );
};
