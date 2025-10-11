import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Send, MessageCircle, Bot, User, TrendingUp } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { BeerAILoader } from "@/components/BeerAILoader";
import { updateFilterStats, getFilterStats } from "@/lib/filterStats";

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

// Funciones de validación para categorías
const isCountry = (value: string): boolean => {
  const countries = [
    'chile', 'méxico', 'estados unidos', 'república dominicana', 'alemania', 
    'bélgica', 'reino unido', 'españa', 'irlanda', 'república checa', 
    'japón', 'brasil', 'argentina', 'colombia', 'países bajos'
  ];
  return countries.some(country => value.toLowerCase().includes(country));
};

const isBeerStyle = (value: string): boolean => {
  const styles = [
    'ipa', 'stout', 'lager', 'amber', 'wheat', 'hazy', 'porter', 
    'red ale', 'pilsner', 'pale ale', 'sour', 'belgian', 'blonde'
  ];
  return styles.some(style => value.toLowerCase().includes(style));
};

const isFlavor = (value: string): boolean => {
  const flavors = [
    'cítrico', 'tropical', 'amargo', 'chocolate', 'café', 'caramelo', 
    'malta', 'frutal', 'especiado', 'tostado', 'suave', 'refrescante'
  ];
  return flavors.some(flavor => value.toLowerCase().includes(flavor));
};

const isIntensity = (value: string): boolean => {
  const intensities = ['ligera', 'media', 'fuerte', 'light', 'medium', 'strong'];
  return intensities.some(intensity => value.toLowerCase().includes(intensity));
};

const isColor = (value: string): boolean => {
  const colors = [
    'rubia', 'dorado', 'ámbar', 'rojo', 'marrón', 'negro', 'turbio', 
    'verde', 'clara', 'púrpura', 'blanca'
  ];
  return colors.some(color => value.toLowerCase().includes(color));
};

const isBitterness = (value: string): boolean => {
  const bitterness = ['bajo', 'alto', 'low', 'high'];
  return bitterness.some(bitter => value.toLowerCase().includes(bitter));
};

// Función para agregar nuevos filtros dinámicamente a las opciones disponibles
const addDynamicFilter = (category: keyof typeof allAnswersPool, newFilter: string, emoji: string = '🌟') => {
  // Crear una entrada temporal para el nuevo filtro
  const newAnswer = `${emoji} ${newFilter}`;
  
  // Agregar a las estadísticas si no existe
  updateFilterStats(newFilter);
  
  // Retornar la nueva opción para mostrarla inmediatamente
  return newAnswer;
};

const sortAnswersByPopularity = (answers: string[], category: string, filterStats: Record<string, number>): string[] => {
  
  console.log('🔍 sortAnswersByPopularity - category:', category);
  console.log('🔍 sortAnswersByPopularity - answers:', answers);
  console.log('🔍 sortAnswersByPopularity - filterStats:', filterStats);
  
  return [...answers].sort((a, b) => {
    // Extraer el valor del filtro de la respuesta (después del emoji)
    const extractFilter = (answer: string) => {
      // Para países, estilos, sabores e intensidad, extraer el texto después del emoji
      const parts = answer.split(' ').slice(1).join(' ');
      return parts;
    };
    
    const filterA = extractFilter(a);
    const filterB = extractFilter(b);
    
    // Para opciones iniciales, buscar estadísticas de las acciones correspondientes
    let countA = 0;
    let countB = 0;
    
    if (category === 'initial') {
      // Mapear opciones iniciales a sus categorías correspondientes para buscar estadísticas
      if (filterA.includes('país') || filterA.includes('origen')) {
        countA = Object.keys(filterStats).filter(key => 
          key.includes('República Dominicana') || key.includes('Estados Unidos') || 
          key.includes('México') || key.includes('Alemania') || key.includes('Bélgica') ||
          key.includes('Reino Unido') || key.includes('España') || key.includes('Irlanda') ||
          key.includes('República Checa') || key.includes('Japón') || key.includes('Brasil') ||
          key.includes('Argentina') || key.includes('Chile')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterA.includes('estilo')) {
        countA = Object.keys(filterStats).filter(key => 
          key.includes('IPA') || key.includes('Stout') || key.includes('Lager') ||
          key.includes('Amber') || key.includes('Wheat') || key.includes('Hazy') ||
          key.includes('Porter') || key.includes('Red Ale') || key.includes('Pilsner') ||
          key.includes('Pale Ale') || key.includes('Sour') || key.includes('Belgian')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterA.includes('sabor')) {
        countA = Object.keys(filterStats).filter(key => 
          key.includes('Cítrico') || key.includes('Tropical') || key.includes('Chocolate') ||
          key.includes('Café') || key.includes('Caramelo') || key.includes('Frutal') ||
          key.includes('Nuez') || key.includes('Herbal') || key.includes('Pan tostado') ||
          key.includes('Durazno') || key.includes('Frutos rojos') || key.includes('Naranja')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterA.includes('intensidad')) {
        countA = Object.keys(filterStats).filter(key => 
          key.includes('Ligera') || key.includes('Media') || key.includes('Fuerte')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterA.includes('color')) {
        countA = Object.keys(filterStats).filter(key => 
          key.includes('Rubia') || key.includes('Ámbar') || key.includes('Marrón') ||
          key.includes('Negra') || key.includes('Roja') || key.includes('Verde') ||
          key.includes('Clara') || key.includes('Púrpura')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterA.includes('amargo') || filterA.includes('amargor')) {
        countA = Object.keys(filterStats).filter(key => 
          key.includes('Suave') || key.includes('Moderado') || key.includes('Amargo')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      }
      
      // Hacer lo mismo para filterB
      if (filterB.includes('país') || filterB.includes('origen')) {
        countB = Object.keys(filterStats).filter(key => 
          key.includes('República Dominicana') || key.includes('Estados Unidos') || 
          key.includes('México') || key.includes('Alemania') || key.includes('Bélgica') ||
          key.includes('Reino Unido') || key.includes('España') || key.includes('Irlanda') ||
          key.includes('República Checa') || key.includes('Japón') || key.includes('Brasil') ||
          key.includes('Argentina') || key.includes('Chile')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterB.includes('estilo')) {
        countB = Object.keys(filterStats).filter(key => 
          key.includes('IPA') || key.includes('Stout') || key.includes('Lager') ||
          key.includes('Amber') || key.includes('Wheat') || key.includes('Hazy') ||
          key.includes('Porter') || key.includes('Red Ale') || key.includes('Pilsner') ||
          key.includes('Pale Ale') || key.includes('Sour') || key.includes('Belgian')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterB.includes('sabor')) {
        countB = Object.keys(filterStats).filter(key => 
          key.includes('Cítrico') || key.includes('Tropical') || key.includes('Chocolate') ||
          key.includes('Café') || key.includes('Caramelo') || key.includes('Frutal') ||
          key.includes('Nuez') || key.includes('Herbal') || key.includes('Pan tostado') ||
          key.includes('Durazno') || key.includes('Frutos rojos') || key.includes('Naranja')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterB.includes('intensidad')) {
        countB = Object.keys(filterStats).filter(key => 
          key.includes('Ligera') || key.includes('Media') || key.includes('Fuerte')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterB.includes('color')) {
        countB = Object.keys(filterStats).filter(key => 
          key.includes('Rubia') || key.includes('Ámbar') || key.includes('Marrón') ||
          key.includes('Negra') || key.includes('Roja') || key.includes('Verde') ||
          key.includes('Clara') || key.includes('Púrpura')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      } else if (filterB.includes('amargo') || filterB.includes('amargor')) {
        countB = Object.keys(filterStats).filter(key => 
          key.includes('Suave') || key.includes('Moderado') || key.includes('Amargo')
        ).reduce((sum, key) => sum + (filterStats[key] || 0), 0);
      }
    } else {
      // Para otras categorías, usar el método original
      countA = filterStats[filterA] || 0;
      countB = filterStats[filterB] || 0;
    }
    
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
    "🎨 Buscar por color",
    "💪 Encontrar por intensidad",
    "😤 Buscar por nivel de amargor",
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
    "🌿 Amargo",
    "🍫 Chocolate",
    "☕ Café",
    "🍯 Caramelo",
    "🌾 Malta",
    "🍓 Frutal",
    "🌶️ Especiado",
    "🔥 Tostado",
    "💫 Suave",
    "❄️ Refrescante"
  ],

  intensity: [
    "🪶 Ligera (< 5% ABV)",
    "⚖️ Media (5-6.5% ABV)",
    "💪 Fuerte (> 6.5% ABV)"
  ],

  color: [
    "🟡 Rubia",
    "🟠 Ámbar",
    "🟤 Marrón",
    "⚫ Negra",
    "🔴 Roja",
    "🟢 Verde",
    "⚪ Clara",
    "🟣 Púrpura"
  ],

  bitterness: [
    "😊 Bajo (< 30 IBU)",
    "😤 Alto (> 50 IBU)"
  ]
};

// Obtener respuestas dinámicas que incluyen todas las opciones disponibles
const getDynamicAnswers = (category: keyof typeof allAnswersPool, filterStats: Record<string, number>): string[] => {
  const allOptions = allAnswersPool[category];
  
  // Para la categoría 'initial', mostrar las opciones predefinidas ordenadas por popularidad
  if (category === 'initial') {
    const sortedOptions = sortAnswersByPopularity(allOptions, category, filterStats);
    console.log('🔍 getDynamicAnswers - allOptions:', allOptions);
    console.log('🔍 getDynamicAnswers - sortedOptions:', sortedOptions);
    return sortedOptions;
  }
  
  // Crear opciones expandidas que incluyen filtros personalizados usados anteriormente
  const expandedOptions = [...allOptions];
  
  // Agregar filtros personalizados que se hayan usado antes pero no estén en las opciones predefinidas
  // Solo agregar filtros que correspondan a la categoría actual
  Object.keys(filterStats).forEach(filterValue => {
    // Verificar si ya existe en las opciones predefinidas (comparando solo el texto, no el emoji)
    const isInPredefined = allOptions.some(option => {
      const optionText = option.split(' ').slice(1).join(' ');
      return optionText.toLowerCase() === filterValue.toLowerCase();
    });
    
    // Verificar si el filtro corresponde a la categoría actual
    let belongsToCategory = false;
    
    if (category === 'country') {
      // Solo países/países
      belongsToCategory = isCountry(filterValue);
    } else if (category === 'style') {
      // Solo estilos de cerveza
      belongsToCategory = isBeerStyle(filterValue);
    } else if (category === 'flavor') {
      // Solo sabores
      belongsToCategory = isFlavor(filterValue);
    } else if (category === 'intensity') {
      // Solo intensidades
      belongsToCategory = isIntensity(filterValue);
    } else if (category === 'color') {
      // Solo colores
      belongsToCategory = isColor(filterValue);
    } else if (category === 'bitterness') {
      // Solo niveles de amargor
      belongsToCategory = isBitterness(filterValue);
    }
    
    if (!isInPredefined && filterStats[filterValue] > 0 && belongsToCategory) {
      // Determinar emoji basado en la categoría y el valor específico
      let emoji = '🌟';
      
      if (category === 'country') {
        // Mapear países específicos a sus banderas
        const countryFlags: { [key: string]: string } = {
          'chile': '🇨🇱',
          'méxico': '🇲🇽',
          'estados unidos': '🇺🇸',
          'república dominicana': '🇩🇴',
          'alemania': '🇩🇪',
          'bélgica': '🇧🇪',
          'reino unido': '🇬🇧',
          'españa': '🇪🇸',
          'irlanda': '🇮🇪',
          'república checa': '🇨🇿',
          'japón': '🇯🇵',
          'brasil': '🇧🇷',
          'argentina': '🇦🇷',
          'colombia': '🇨🇴',
          'países bajos': '🇳🇱'
        };
        emoji = countryFlags[filterValue.toLowerCase()] || '🌍';
      } else if (category === 'style') {
        emoji = '🍺';
      } else if (category === 'flavor') {
        emoji = '🍋';
      } else if (category === 'intensity') {
        emoji = '💪';
      } else if (category === 'color') {
        emoji = '🎨';
      } else if (category === 'bitterness') {
        emoji = '🔥';
      }
      
      expandedOptions.push(`${emoji} ${filterValue}`);
    }
  });
  
  const sorted = sortAnswersByPopularity(expandedOptions, category, filterStats);
  
  // Para categorías con más de 6 opciones, mostrar las más populares + algunas aleatorias de las menos usadas
  if (expandedOptions.length > 6) {
    const popular = sorted.slice(0, 4); // Las 4 más populares siempre
    const lessPopular = sorted.slice(4); // El resto
    const randomLessPopular = lessPopular
      .sort(() => Math.random() - 0.5) // Mezclar aleatoriamente
      .slice(0, 2); // Tomar 2 aleatorias
    return [...popular, ...randomLessPopular];
  }
  
  // Para categorías con 6 o menos opciones, mostrar todas
  return sorted;
};

const getConversationSteps = (filterStats: Record<string, number>) => ({
  initial: {
    question: "¡Hola! ¿Con qué puedo ayudarte?",
    get answers() {
      return getDynamicAnswers('initial', filterStats);
    }
  },
  
  country: {
    question: "¡Perfecto! ¿De qué país te gustaría probar cervezas?",
    get answers() {
      return getDynamicAnswers('country', filterStats);
    }
  },

  style: {
    question: "¡Excelente! ¿Qué estilo de cerveza prefieres?",
    get answers() {
      return getDynamicAnswers('style', filterStats);
    }
  },

  flavor: {
    question: "¡Me encanta! ¿Qué sabor específico buscas?",
    get answers() {
      return getDynamicAnswers('flavor', filterStats);
    }
  },

  color: {
    question: "¡Genial! ¿Qué color de cerveza prefieres?",
    get answers() {
      return getDynamicAnswers('color', filterStats);
    }
  },

  intensity: {
    question: "¡Perfecto! ¿Qué intensidad prefieres?",
    get answers() {
      return getDynamicAnswers('intensity', filterStats);
    }
  },

  bitterness: {
    question: "¡Excelente! ¿Qué nivel de amargor prefieres?",
    get answers() {
      return getDynamicAnswers('bitterness', filterStats);
    }
  }
});

export const AIChat = ({ isOpen, onClose, onSearch, onStartSearch }: AIChatProps) => {
  const location = useLocation();
  const [filterStats, setFilterStats] = useState<Record<string, number>>({});
  
  // Crear conversationSteps con las estadísticas actuales
  const conversationSteps = useMemo(() => getConversationSteps(filterStats), [filterStats]);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: getConversationSteps({}).initial.question,
      timestamp: new Date()
    }
  ]);
  const [currentStep, setCurrentStep] = useState<'initial' | 'country' | 'style' | 'flavor' | 'color' | 'intensity' | 'bitterness'>('initial');
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
  const [refreshAnswers, setRefreshAnswers] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Cargar estadísticas de filtros al abrir el chat
  useEffect(() => {
    if (isOpen) {
      getFilterStats().then(stats => {
        setFilterStats(stats);
      }).catch(error => {
        console.error('Error loading filter stats:', error);
      });
    }
  }, [isOpen, refreshAnswers]);

  const scrollToCenter = () => {
    const chatContainer = document.querySelector('.chat-messages-container');
    if (chatContainer) {
      // Calcular la posición central del contenido
      const containerHeight = chatContainer.clientHeight;
      const scrollHeight = chatContainer.scrollHeight;
      const centerPosition = (scrollHeight - containerHeight) / 2;
      
      chatContainer.scrollTo({
        top: Math.max(0, centerPosition),
        behavior: 'smooth'
      });
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
    setRefreshAnswers(prev => prev + 1); // Forzar actualización de respuestas dinámicas
    setIsTyping(false);
    setLastActivityTime(Date.now());
  };

  const updateActivity = () => {
    setLastActivityTime(Date.now());
  };

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => {
        scrollToCenter();
      }, 300);
    }
  }, [messages]);

  // Scroll cuando se muestran las respuestas
  useEffect(() => {
    if (showAnswers) {
      const timer = setTimeout(() => {
        scrollToCenter();
      }, 400); // Esperar a que termine la animación de cascada
      return () => clearTimeout(timer);
    }
  }, [showAnswers]);

  // Mostrar respuestas iniciales al abrir el chat y centrar contenido
  useEffect(() => {
    if (isOpen && currentStep === 'initial') {
      const timer = setTimeout(() => {
        setShowAnswers(true);
        scrollToCenter(); // Centrar el contenido inicial
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep]);

  // Reiniciar chat después de 15 segundos de inactividad
  useEffect(() => {
    if (!isOpen) return;

    // Limpiar timer anterior si existe
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Crear nuevo timer
    inactivityTimerRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (timeSinceLastActivity >= 15000) {
        // 15 segundos de inactividad
        resetChat();
        // Mostrar respuestas iniciales después del reset
        setTimeout(() => {
          setShowAnswers(true);
        }, 600);
      }
    }, 15000);

    // Cleanup al desmontar o cuando cambie la dependencia
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isOpen, lastActivityTime]);


  // Prevenir scroll del body cuando el chat está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      // Prevenir scroll del body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurar el scroll del body
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup
    return () => {
      if (isOpen) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      }
    };
  }, [isOpen]);

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
        } else if (answer.includes('color')) {
          nextStep = 'color';
        } else if (answer.includes('intensidad')) {
          nextStep = 'intensity';
        } else if (answer.includes('amargo') || answer.includes('amargor') || answer.includes('nivel de amargor')) {
          nextStep = 'bitterness';
        } else if (answer.includes('completa')) {
          // Búsqueda completa - empezar con el primer paso
          nextStep = 'country';
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
          
          console.log('🔍 País seleccionado:', selectedCountry);
          console.log('🔍 updatedFilters después de país:', updatedFilters);
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
        } else if (currentStep === 'color') {
          let selectedColor = "";
          if (answer.includes("Rubia")) { selectedColor = "Rubia"; updatedFilters.color = [selectedColor]; }
          else if (answer.includes("Ámbar")) { selectedColor = "Ámbar"; updatedFilters.color = [selectedColor]; }
          else if (answer.includes("Marrón")) { selectedColor = "Marrón"; updatedFilters.color = [selectedColor]; }
          else if (answer.includes("Negra")) { selectedColor = "Negra"; updatedFilters.color = [selectedColor]; }
          else if (answer.includes("Roja")) { selectedColor = "Roja"; updatedFilters.color = [selectedColor]; }
          else if (answer.includes("Verde")) { selectedColor = "Verde"; updatedFilters.color = [selectedColor]; }
          else if (answer.includes("Clara")) { selectedColor = "Clara"; updatedFilters.color = [selectedColor]; }
          else if (answer.includes("Púrpura")) { selectedColor = "Púrpura"; updatedFilters.color = [selectedColor]; }
          
          if (selectedColor) updateFilterStats(selectedColor);
        } else if (currentStep === 'bitterness') {
          let selectedBitterness = "";
          if (answer.includes("Suave")) { selectedBitterness = "Suave"; updatedFilters.bitterness = ["low"]; }
          else if (answer.includes("Moderado")) { selectedBitterness = "Moderado"; updatedFilters.bitterness = ["medium"]; }
          else if (answer.includes("Amargo")) { selectedBitterness = "Amargo"; updatedFilters.bitterness = ["high"]; }
          
          if (selectedBitterness) updateFilterStats(selectedBitterness);
        }

        // Determinar si continuar con la búsqueda completa o finalizar
        const isCompleteSearch = location.state?.from === 'complete-search' || 
                                messages.some(msg => msg.content.includes('completa'));
        
        if (isCompleteSearch) {
          // Búsqueda completa - determinar el siguiente paso
          if (currentStep === 'country') {
            nextStep = 'style';
          } else if (currentStep === 'style') {
            nextStep = 'flavor';
          } else if (currentStep === 'flavor') {
            nextStep = 'color';
          } else if (currentStep === 'color') {
            nextStep = 'intensity';
          } else if (currentStep === 'intensity') {
            nextStep = 'bitterness';
          } else if (currentStep === 'bitterness') {
            // Finalizar la búsqueda completa
            setTimeout(() => {
              addTypingMessage('¡Perfecto! Basándome en todas tus preferencias, voy a buscar las cervezas ideales para ti 🎯', () => {
                setTimeout(() => {
                  console.log('🔍 Filtros desde chat:', updatedFilters); // Debug
                  setRefreshAnswers(prev => prev + 1); // Actualizar respuestas dinámicas
                  onStartSearch?.(); // Iniciar búsqueda en el componente padre
                  onSearch(updatedFilters); // Pasar los filtros
                }, 500);
              });
            }, 800);
            return;
          }
        } else {
          // Búsqueda normal - finalizar después de cualquier selección específica
          console.log('🔍 Búsqueda normal - updatedFilters antes de enviar:', updatedFilters);
        setTimeout(() => {
          addTypingMessage('¡Perfecto! Basándome en tus preferencias, voy a buscar las cervezas ideales para ti 🎯', () => {
            setTimeout(() => {
              console.log('🔍 Filtros desde chat:', updatedFilters); // Debug
                setRefreshAnswers(prev => prev + 1); // Actualizar respuestas dinámicas
              onStartSearch?.(); // Iniciar búsqueda en el componente padre
              onSearch(updatedFilters); // Pasar los filtros
            }, 500);
          });
          }, 800);
        return;
        }
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
            setRefreshAnswers(prev => prev + 1); // Actualizar respuestas dinámicas
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-4 sm:pt-8 md:items-center md:pt-0 p-2 sm:p-4 animate-in fade-in duration-300" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <Card className="w-full max-w-md h-[75vh] sm:h-[85vh] md:h-[650px] max-h-[600px] sm:max-h-[700px] flex flex-col bg-gradient-to-b from-card to-card/95 border-border shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Bot className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Beer AI
              </h3>
              <p className="text-xs text-muted-foreground">Tu sommelier personal</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
          >
            <X size={16} />
          </Button>
        </div>

         {/* Messages */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-background/50 to-transparent chat-messages-container">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`max-w-[85%] p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground ml-2 sm:ml-4'
                    : 'bg-gradient-to-r from-muted to-muted/80 text-foreground mr-2 sm:mr-4 border border-border/50'
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {message.type === 'ai' && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={10} className="text-primary sm:hidden" />
                      <Bot size={12} className="text-primary hidden sm:block" />
                    </div>
                  )}
                  {message.type === 'user' && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={10} className="text-white sm:hidden" />
                      <User size={12} className="text-white hidden sm:block" />
                    </div>
                  )}
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Predefined Answers */}
          {conversationSteps[currentStep] && showAnswers && (
            <div className="space-y-3 sm:space-y-4" key={`${answerKey}-${refreshAnswers}`}>
              <div className="text-center animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <p className="text-xs sm:text-sm font-medium text-primary">Selecciona una opción</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                {conversationSteps[currentStep].answers.map((answer, index) => {
                  // Extraer el valor del filtro (texto después del emoji)
                  const filterValue = answer.split(' ').slice(1).join(' ');
                  
                  // Obtener el contador solo si el valor exacto existe en filterStats
                  // Esto asegura que solo se muestren estadísticas de la categoría correcta
                  let count = 0;
                  
                  // Buscar coincidencia exacta o parcial dependiendo de la categoría
                  if (currentStep === 'country') {
                    // Para países, buscar coincidencia exacta
                    count = filterStats[filterValue] || 0;
                  } else if (currentStep === 'style') {
                    // Para estilos, buscar coincidencia exacta
                    count = filterStats[filterValue] || 0;
                  } else if (currentStep === 'flavor') {
                    // Para sabores, buscar coincidencia exacta
                    count = filterStats[filterValue] || 0;
                  } else if (currentStep === 'intensity') {
                    // Para intensidad, buscar por palabras clave
                    if (filterValue.includes('Ligera')) count = filterStats['Ligera'] || filterStats['light'] || 0;
                    else if (filterValue.includes('Media')) count = filterStats['Media'] || filterStats['medium'] || 0;
                    else if (filterValue.includes('Fuerte')) count = filterStats['Fuerte'] || filterStats['strong'] || 0;
                  } else if (currentStep === 'color') {
                    // Para colores, buscar por palabras clave
                    const colorMatch = filterValue.match(/Rubia|Dorado|Ámbar|Rojo|Marrón|Negro|Turbio/);
                    if (colorMatch) count = filterStats[colorMatch[0]] || 0;
                  } else if (currentStep === 'bitterness') {
                    // Para amargor, buscar por palabras clave
                    if (filterValue.includes('Suave')) count = filterStats['Suave'] || filterStats['low'] || 0;
                    else if (filterValue.includes('Moderado')) count = filterStats['Moderado'] || filterStats['medium'] || 0;
                    else if (filterValue.includes('Amargo')) count = filterStats['Amargo'] || filterStats['high'] || 0;
                  }
                  
                  return (
                    <Button
                      key={`${answerKey}-${refreshAnswers}-${index}`}
                      variant="outline"
                      size="lg"
                      onClick={() => handlePredefinedAnswer(answer)}
                      className="group justify-start text-left h-auto py-3 px-3 sm:py-4 sm:px-4 rounded-xl sm:rounded-2xl border-2 border-border/50 hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cascade-animation"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 w-full">
                        <div className="text-base sm:text-lg group-hover:scale-110 transition-transform duration-200">
                          {answer.split(' ')[0]}
                        </div>
                        <span className="font-medium text-xs sm:text-sm group-hover:text-primary transition-colors duration-200 flex-1">
                          {filterValue}
                        </span>
                        {count > 0 && (
                          <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0.5 sm:px-2 bg-muted">
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

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-xs">IA activa - Selecciona una opción para continuar</span>
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
