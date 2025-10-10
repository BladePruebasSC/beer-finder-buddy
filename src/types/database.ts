// Temporary type definitions until Supabase types are regenerated
export interface Beer {
  id: string;
  name: string;
  brewery: string;
  style: string;
  abv: number;
  ibu: number | null;
  color: string;
  flavor: string[];
  description: string;
  image: string | null;
  origin: string | null;
  created_at: string;
  updated_at: string;
}

export type BeerInsert = Omit<Beer, 'id' | 'created_at' | 'updated_at'>;
export type BeerUpdate = Partial<BeerInsert>;

export interface Review {
  id: string;
  beer_id: string;
  user_name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export type ReviewInsert = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
