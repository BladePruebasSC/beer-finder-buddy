import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export type Beer = Tables<"beers">;
export type BeerInsert = Omit<Beer, 'id' | 'created_at' | 'updated_at'>;

/**
 * @deprecated Use useBeers hook instead for better React integration
 */
export const getBeersList = async (): Promise<Beer[]> => {
  const { data, error } = await supabase
    .from("beers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching beers:", error);
    return [];
  }

  return data as Beer[];
};

/**
 * @deprecated Use useBeer hook instead for better React integration
 */
export const getBeerById = async (id: string): Promise<Beer | null> => {
  const { data, error } = await supabase
    .from("beers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching beer:", error);
    return null;
  }

  return data as Beer;
};

/**
 * @deprecated Use useCreateBeer hook instead for better React integration
 */
export const addBeer = async (beer: BeerInsert): Promise<Beer | null> => {
  const { data, error } = await supabase
    .from("beers")
    .insert([beer])
    .select()
    .single();

  if (error) {
    console.error("Error adding beer:", error);
    return null;
  }

  return data as Beer;
};

/**
 * @deprecated Use useUpdateBeer hook instead for better React integration
 */
export const updateBeer = async (id: string, updates: Partial<BeerInsert>): Promise<Beer | null> => {
  const { data, error } = await supabase
    .from("beers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating beer:", error);
    return null;
  }

  return data as Beer;
};

/**
 * @deprecated Use useDeleteBeer hook instead for better React integration
 */
export const deleteBeer = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("beers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting beer:", error);
    return false;
  }

  return true;
};
