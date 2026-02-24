export type Season = "verao" | "inverno" | "neutro";

export interface SizePeriod {
  id: string;
  name: string;
  display_order: number;
}

export interface ClothingType {
  id: string;
  name: string;
  created_at: string;
}

export interface Clothing {
  id: string;
  clothing_type_id: string;
  size_period_id: string;
  season: Season;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clothing_types?: ClothingType;
  size_periods?: SizePeriod;
}

export interface Enxoval {
  id: string;
  name: string;
  size_period_id: string;
  created_at: string;
  size_periods?: SizePeriod;
  enxoval_items?: EnxovalItem[];
}

export interface EnxovalItem {
  id: string;
  enxoval_id: string;
  clothing_type_id: string;
  target_quantity: number;
  clothing_types?: ClothingType;
}