import { EnxovalKind, Season } from "./types/database";

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

export const ENXOVAL_KINDS: { value: EnxovalKind; label: string }[] = [
  { value: "roupinhas", label: "Roupinhas" },
  { value: "quarto", label: "Quarto" },
];

export const ENXOVAL_KIND_LABELS: Record<EnxovalKind, string> = {
  roupinhas: "Roupinhas",
  quarto: "Quarto",
};

export function parseEnxovalKind(value: string | undefined | null): EnxovalKind {
  return value === "quarto" ? "quarto" : "roupinhas";
}
