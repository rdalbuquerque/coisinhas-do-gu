import { ClothingColor, EnxovalKind, Season } from "./types/database";

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

export const CLOTHING_COLORS: { value: ClothingColor; label: string }[] = [
  { value: "branco", label: "Branco" },
  { value: "preto", label: "Preto" },
  { value: "cinza", label: "Cinza" },
  { value: "bege", label: "Bege" },
  { value: "marrom", label: "Marrom" },
  { value: "vermelho", label: "Vermelho" },
  { value: "rosa", label: "Rosa" },
  { value: "laranja", label: "Laranja" },
  { value: "amarelo", label: "Amarelo" },
  { value: "verde", label: "Verde" },
  { value: "azul", label: "Azul" },
  { value: "roxo", label: "Roxo" },
  { value: "estampado", label: "Estampado" },
];

export const CLOTHING_COLOR_LABELS: Record<ClothingColor, string> = {
  branco: "Branco",
  preto: "Preto",
  cinza: "Cinza",
  bege: "Bege",
  marrom: "Marrom",
  vermelho: "Vermelho",
  rosa: "Rosa",
  laranja: "Laranja",
  amarelo: "Amarelo",
  verde: "Verde",
  azul: "Azul",
  roxo: "Roxo",
  estampado: "Estampado",
};

// CSS color values for the swatch dot. `estampado` is rendered as a
// conic-gradient by ColorChip — the string is a sentinel.
export const CLOTHING_COLOR_SWATCHES: Record<ClothingColor, string> = {
  branco: "#ffffff",
  preto: "#1f2937",
  cinza: "#9ca3af",
  bege: "#e5d3b3",
  marrom: "#78350f",
  vermelho: "#dc2626",
  rosa: "#f472b6",
  laranja: "#f97316",
  amarelo: "#fbbf24",
  verde: "#22c55e",
  azul: "#3b82f6",
  roxo: "#a855f7",
  estampado: "estampado",
};
