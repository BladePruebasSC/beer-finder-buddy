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

// Sistema de tracking de FILTROS reales (no respuestas del chat)
const updateFilterStats = (filterValue: string) => {
  const FILTER_STATS_KEY = 'beer-filter-stats';
  try {
    const stored = localStorage.getItem(FILTER_STATS_KEY);
    const stats = stored ? JSON.parse(stored) : {};
    stats[filterValue] = (stats[filterValue] || 0) + 1;
    localStorage.setItem(FILTER_STATS_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error updating filter stats:', error);
  }
};

// Obtener estadísticas de filtros (no respuestas del chat)
const getFilterStats = () => {
  try {
    const stored = localStorage.getItem('beer-filter-stats');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const sortAnswersByPopularity = (answers: string[], category: string): string[] => {
  const filterStats = getFilterStats();
  
  return [...answers].sort((a, b) => {
    // Extraer el valor del filtro de la respuesta (después del emoji)
    const extractFilter = (answer: string) => {
      // Para países, estilos, sabores e intensidad, extraer el texto después del emoji
      const parts = answer.split(' ').slice(1).join(' ');
      return parts;
    };
    
    const filterA = extractFilter(a);
    const filterB = extractFilter(b);
    
    const countA = filterStats[filterA] || 0;
    const countB = filterStats[filterB] || 0;
    
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

// Definir TODAS las opciones posibles (más que las que se muestran)
const allAnswersPool = {
  initial: [
    "🌍 Buscar por país de origen",
    "🍺 Recomendarme por estilo",
    "🍋 Buscar por sabor específico",
    "💪 Encontrar por intensidad",
    "🎯 Búsqueda completa personalizada"
  ],
  
  country: [
    "🇩🇴 República Dominicana",
    "🇺🇸 Estados Unidos", 
    "🇲🇽 México",
    "🇩🇪 Alemania",
    "🇧🇪 Bélgica",
    "🇬🇧 Reino Unido",
    "🇪🇸 España",
    "🇮🇪 Irlanda",
    "🇨🇿 República Checa",
    "🇯🇵 Japón",
    "🇧🇷 Brasil",
    "🇦🇷 Argentina"
  ],

  style: [
    "🍺 IPA",
    "⚫ Stout",
    "✨ Lager",
    "🟠 Amber Ale",
    "🌾 Wheat Beer",
    "☁️ Hazy IPA",
    "🍂 Porter",
    "🔴 Red Ale",
    "🌟 Pilsner",
    "💛 Pale Ale",
    "🎨 Sour Ale",
    "🍯 Belgian Ale"
  ],

  flavor: [
    "🍋 Cítrico",
    "🥥 Tropical",
    "🍫 Chocolate",
    "☕ Café",
    "🍯 Caramelo",
    "🍓 Frutal",
    "🌰 Nuez",
    "🌿 Herbal",
    "🍞 Pan tostado",
    "🍑 Durazno",
    "🫐 Frutos rojos",
    "🍊 Naranja"
  ],

  intensity: [
    "🪶 Ligera (< 5% ABV)",
    "⚖️ Media (5-6.5% ABV)",
    "💪 Fuerte (> 6.5% ABV)"
  ]
};

// Obtener las top respuestas más usadas de cada categoría basándose en filtros reales
const getTopAnswers = (category: keyof typeof allAnswersPool, limit: number = 6): string[] => {
  const allOptions = allAnswersPool[category];
  const sorted = sortAnswersByPopularity(allOptions, category);
  return sorted.slice(0, limit);
};

const conversationSteps = {
  initial: {
    question: "¡Hola! ¿Con qué puedo ayudarte?",
    get answers() {
      return getTopAnswers('initial', 5);
    }
  },
  
  country: {
    question: "¡Perfecto! ¿De qué país te gustaría probar cervezas?",
    get answers() {
      return getTopAnswers('country', 6);
    }
  },

  style: {
    question: "¡Excelente! ¿Qué estilo de cerveza prefieres?",
    get answers() {
      return getTopAnswers('style', 6);
    }
  },

  flavor: {
    question: "¡Me encanta! ¿Qué sabor específico buscas?",
    get answers() {
      return getTopAnswers('flavor', 6);
    }
  },

  intensity: {
    question: "¡Perfecto! ¿Qué intensidad prefieres?",
    get answers() {
      return getTopAnswers('intensity', 3);
    }
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


  // Reiniciar conversación cuando se abre el chat (solo cuando cambia de cerrado a abierto)
  const prevIsOpenRef = useRef(isOpen);
  
  useEffect(() => {
    // Solo resetear cuando el chat se acaba de abrir (transición de false a true)
    if (isOpen && !prevIsOpenRef.current) {
      // Usar setTimeout para evitar actualización durante render
      setTimeout(() => {
        resetChat();
      }, 0);
    }
    prevIsOpenRef.current = isOpen;
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
        // Procesar la selección específica y registrar el filtro usado
        if (currentStep === 'country') {
          // Extraer el país correctamente del emoji + texto
          let selectedCountry = "";
          if (answer.includes("República Dominicana")) { selectedCountry = "República Dominicana"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("Estados Unidos")) { selectedCountry = "Estados Unidos"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("México")) { selectedCountry = "México"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("Alemania")) { selectedCountry = "Alemania"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("Bélgica")) { selectedCountry = "Bélgica"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("Reino Unido")) { selectedCountry = "Reino Unido"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("España")) { selectedCountry = "España"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("Irlanda")) { selectedCountry = "Irlanda"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("República Checa")) { selectedCountry = "República Checa"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("Japón")) { selectedCountry = "Japón"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("Brasil")) { selectedCountry = "Brasil"; updatedFilters.origin = [selectedCountry]; }
          else if (answer.includes("Argentina")) { selectedCountry = "Argentina"; updatedFilters.origin = [selectedCountry]; }
          
          if (selectedCountry) updateFilterStats(selectedCountry);
        } else if (currentStep === 'style') {
          // Extraer el estilo correctamente
          let selectedStyle = "";
          if (answer.includes("IPA") && !answer.includes("Hazy")) { selectedStyle = "IPA"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Stout")) { selectedStyle = "Stout"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Lager")) { selectedStyle = "Lager"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Amber")) { selectedStyle = "Amber Ale"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Wheat")) { selectedStyle = "Wheat Beer"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Hazy")) { selectedStyle = "Hazy IPA"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Porter")) { selectedStyle = "Porter"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Red Ale")) { selectedStyle = "Red Ale"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Pilsner")) { selectedStyle = "Pilsner"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Pale Ale")) { selectedStyle = "Pale Ale"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Sour")) { selectedStyle = "Sour Ale"; updatedFilters.style = [selectedStyle]; }
          else if (answer.includes("Belgian")) { selectedStyle = "Belgian Ale"; updatedFilters.style = [selectedStyle]; }
          
          if (selectedStyle) updateFilterStats(selectedStyle);
        } else if (currentStep === 'flavor') {
          // Extraer el sabor correctamente
          let selectedFlavor = "";
          if (answer.includes("Cítrico")) { selectedFlavor = "Cítrico"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Tropical")) { selectedFlavor = "Tropical"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Chocolate")) { selectedFlavor = "Chocolate"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Café")) { selectedFlavor = "Café"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Caramelo")) { selectedFlavor = "Caramelo"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Frutal")) { selectedFlavor = "Frutal"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Nuez")) { selectedFlavor = "Nuez"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Herbal")) { selectedFlavor = "Herbal"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Pan tostado")) { selectedFlavor = "Pan tostado"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Durazno")) { selectedFlavor = "Durazno"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Frutos rojos")) { selectedFlavor = "Frutos rojos"; updatedFilters.flavor = [selectedFlavor]; }
          else if (answer.includes("Naranja")) { selectedFlavor = "Naranja"; updatedFilters.flavor = [selectedFlavor]; }
          
          if (selectedFlavor) updateFilterStats(selectedFlavor);
        } else if (currentStep === 'intensity') {
          let selectedIntensity = "";
          if (answer.includes("Ligera")) { selectedIntensity = "Ligera"; updatedFilters.strength = ["light"]; }
          else if (answer.includes("Media")) { selectedIntensity = "Media"; updatedFilters.strength = ["medium"]; }
          else if (answer.includes("Fuerte")) { selectedIntensity = "Fuerte"; updatedFilters.strength = ["strong"]; }
          
          if (selectedIntensity) updateFilterStats(selectedIntensity);
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md h-[calc(100vh-1rem)] sm:h-[90vh] md:h-[650px] max-h-[800px] flex flex-col bg-gradient-to-b from-card to-card/95 border-border shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
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
          {conversationSteps[currentStep] && showAnswers && (
            <div className="space-y-4" key={answerKey}>
              <div className="text-center animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-primary">Selecciona una opción</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {conversationSteps[currentStep].answers.map((answer, index) => {
                  const filterStats = getFilterStats();
                  // Extraer el valor del filtro (texto después del emoji)
                  const filterValue = answer.split(' ').slice(1).join(' ');
                  const count = filterStats[filterValue] || 0;
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
                          {filterValue}
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
