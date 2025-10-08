export interface Beer {
  id: string;
  name: string;
  brewery: string;
  style: string;
  abv: number;
  ibu: number;
  color: string;
  flavor: string[];
  description: string;
}

export const beersDatabase: Beer[] = [
  {
    id: "1",
    name: "Golden Sunset IPA",
    brewery: "Cervecería del Sol",
    style: "IPA",
    abv: 6.5,
    ibu: 65,
    color: "Dorado",
    flavor: ["Cítrico", "Tropical", "Amargo"],
    description: "IPA americana con intensos aromas a frutas tropicales y cítricos. Final amargo equilibrado."
  },
  {
    id: "2",
    name: "Dark Mountain Stout",
    brewery: "Montaña Brewing",
    style: "Stout",
    abv: 7.2,
    ibu: 45,
    color: "Negro",
    flavor: ["Chocolate", "Café", "Tostado"],
    description: "Stout cremosa con notas de chocolate negro y café expreso. Cuerpo completo y sedoso."
  },
  {
    id: "3",
    name: "Sunset Lager",
    brewery: "Playa Brewery",
    style: "Lager",
    abv: 4.8,
    ibu: 20,
    color: "Rubio",
    flavor: ["Suave", "Malta", "Refrescante"],
    description: "Lager clásica ligera y refrescante, perfecta para cualquier ocasión. Sabor limpio y crujiente."
  },
  {
    id: "4",
    name: "Amber Dreams",
    brewery: "Sueños Artesanales",
    style: "Amber Ale",
    abv: 5.5,
    ibu: 35,
    color: "Ámbar",
    flavor: ["Caramelo", "Malta", "Equilibrado"],
    description: "Amber ale equilibrada con dulzor de malta caramelizada y un toque de lúpulo."
  },
  {
    id: "5",
    name: "Wheat Cloud",
    brewery: "Nube Cervecera",
    style: "Wheat Beer",
    abv: 5.0,
    ibu: 15,
    color: "Turbio",
    flavor: ["Plátano", "Clavo", "Suave"],
    description: "Cerveza de trigo con notas de plátano y clavo de olor. Refrescante y aromática."
  },
  {
    id: "6",
    name: "Hoppy Session",
    brewery: "Lúpulo Loco",
    style: "Session IPA",
    abv: 4.2,
    ibu: 45,
    color: "Dorado claro",
    flavor: ["Cítrico", "Herbal", "Ligero"],
    description: "Session IPA baja en alcohol pero llena de sabor. Perfecta para varias rondas."
  },
  {
    id: "7",
    name: "Porter del Puerto",
    brewery: "Mar Brewing",
    style: "Porter",
    abv: 6.0,
    ibu: 40,
    color: "Marrón oscuro",
    flavor: ["Chocolate", "Tostado", "Ahumado"],
    description: "Porter robusta con maltosidad tostada y toques de chocolate amargo."
  },
  {
    id: "8",
    name: "Tropical Haze",
    brewery: "Selva Cervecera",
    style: "Hazy IPA",
    abv: 6.8,
    ibu: 50,
    color: "Turbio dorado",
    flavor: ["Mango", "Tropical", "Jugoso"],
    description: "IPA turbia cargada de lúpulos, con explosión de sabores tropicales y textura jugosa."
  },
  {
    id: "9",
    name: "Belgian Blonde",
    brewery: "Europa Artesanal",
    style: "Belgian Blonde",
    abv: 6.5,
    ibu: 25,
    color: "Rubio dorado",
    flavor: ["Especiado", "Frutal", "Malta"],
    description: "Rubia belga con perfil especiado, toques frutales y final seco."
  },
  {
    id: "10",
    name: "Red Horizon",
    brewery: "Horizonte Brewery",
    style: "Red Ale",
    abv: 5.8,
    ibu: 42,
    color: "Rojo cobrizo",
    flavor: ["Caramelo", "Tostado", "Cítrico"],
    description: "Red ale con dulzor de caramelo equilibrado con amargor de lúpulo cítrico."
  },
  {
    id: "11",
    name: "Pilsner Premium",
    brewery: "Clásicos Cerveceros",
    style: "Pilsner",
    abv: 5.0,
    ibu: 35,
    color: "Dorado brillante",
    flavor: ["Floral", "Pan", "Crujiente"],
    description: "Pilsner bohemia tradicional con amargor noble y final limpio y seco."
  },
  {
    id: "12",
    name: "Coconut Milk Stout",
    brewery: "Trópico Negro",
    style: "Milk Stout",
    abv: 6.0,
    ibu: 30,
    color: "Negro",
    flavor: ["Coco", "Chocolate", "Dulce"],
    description: "Milk stout cremosa con coco tostado, chocolate y dulzor equilibrado de lactosa."
  }
];
