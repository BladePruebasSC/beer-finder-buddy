import { beersDatabase } from "@/data/beers";

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
  image?: string;
  origin?: string;
}

const BEERS_KEY = "beers_catalog";

export const initializeBeers = () => {
  const stored = localStorage.getItem(BEERS_KEY);
  if (!stored) {
    localStorage.setItem(BEERS_KEY, JSON.stringify(beersDatabase));
  }
};

export const getBeersList = (): Beer[] => {
  initializeBeers();
  const stored = localStorage.getItem(BEERS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getBeerById = (id: string): Beer | null => {
  const beers = getBeersList();
  return beers.find(beer => beer.id === id) || null;
};

export const addBeer = (beer: Omit<Beer, "id">): Beer => {
  const beers = getBeersList();
  const newBeer = {
    ...beer,
    id: Date.now().toString(),
  };
  beers.push(newBeer);
  localStorage.setItem(BEERS_KEY, JSON.stringify(beers));
  return newBeer;
};

export const updateBeer = (id: string, updates: Partial<Beer>): Beer | null => {
  const beers = getBeersList();
  const index = beers.findIndex(beer => beer.id === id);
  
  if (index === -1) return null;
  
  beers[index] = { ...beers[index], ...updates };
  localStorage.setItem(BEERS_KEY, JSON.stringify(beers));
  return beers[index];
};

export const deleteBeer = (id: string): boolean => {
  const beers = getBeersList();
  const filtered = beers.filter(beer => beer.id !== id);
  
  if (filtered.length === beers.length) return false;
  
  localStorage.setItem(BEERS_KEY, JSON.stringify(filtered));
  return true;
};
