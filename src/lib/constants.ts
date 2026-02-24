import { Season } from "./types/database";

export const SEASONS: { value: Season; label: string }[] = [
  { value: "neutro", label: "Neutro" },
  { value: "verao", label: "Verão" },
  { value: "inverno", label: "Inverno" },
];

export const SEASON_LABELS: Record<Season, string> = {
  neutro: "Neutro",
  verao: "Verão",
  inverno: "Inverno",
};
