export type Season = "verao" | "inverno" | "neutro";

export type EnxovalKind = "roupinhas" | "quarto";

export interface SizePeriod {
  id: string;
  name: string;
  display_order: number;
}

export interface ClothingType {
  id: string;
  name: string;
  kind: EnxovalKind;
  created_at: Date | string;
}

export interface Clothing {
  id: string;
  clothing_type_id: string;
  size_period_id: string | null;
  season: Season;
  photo_url: string | null;
  notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  clothing_types?: ClothingType | null;
  size_periods?: SizePeriod | null;
}

export interface Enxoval {
  id: string;
  name: string;
  kind: EnxovalKind;
  created_at: Date | string;
  enxoval_items?: EnxovalItem[];
}

export interface EnxovalItem {
  id: string;
  enxoval_id: string;
  clothing_type_id: string;
  size_period_id: string | null;
  target_quantity: number;
  clothing_types?: ClothingType;
  size_periods?: SizePeriod | null;
}