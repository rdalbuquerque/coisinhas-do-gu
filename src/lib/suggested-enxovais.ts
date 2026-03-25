export interface SuggestedItem {
  clothing_type_name: string;
  target_quantity: number;
}

// Quantidades por tamanho: "default" é o fallback quando não há valor específico
export type SizeKey = "RN" | "P" | "M" | "G" | "default";

export interface SuggestedItemBySize {
  clothing_type_name: string;
  quantities: Partial<Record<SizeKey, number>>;
}

export interface SuggestedEnxoval {
  id: string;
  name: string;
  description: string;
  season: "inverno" | "verao" | "meia-estacao";
  items: SuggestedItemBySize[];
}

export function getQuantityForSize(
  item: SuggestedItemBySize,
  sizeName: string
): number {
  const key = sizeName.toUpperCase() as SizeKey;
  return item.quantities[key] ?? item.quantities["default"] ?? 0;
}

// Quantidades baseadas em recomendações de:
// - Alô Bebê (alobebe.com.br)
// - Minha Mãe Experiente (minhamaexperiente.com.br)
// - Mooui (blog.mooui.com.br)
// Adaptadas para clima do Rio de Janeiro (inverno ameno, ~15-25°C)

export const SUGGESTED_ENXOVAIS: SuggestedEnxoval[] = [
  {
    id: "inverno-rio",
    name: "Roupas de Inverno (clima ameno)",
    description: "Para bebês que nascem entre maio e agosto em cidades de inverno ameno como o Rio. Peças de camada, sem exagero no frio.",
    season: "inverno",
    items: [
      { clothing_type_name: "Body manga longa", quantities: { RN: 6, P: 6, M: 4, G: 4 } },
      { clothing_type_name: "Body manga curta", quantities: { RN: 6, P: 6, M: 4, G: 4 } },
      { clothing_type_name: "Calça", quantities: { RN: 6, P: 6, M: 4, G: 4 } },
      { clothing_type_name: "Macacão manga longa", quantities: { RN: 4, P: 4, M: 3, G: 3 } },
      { clothing_type_name: "Macacão manga curta", quantities: { RN: 3, P: 3, M: 2, G: 2 } },
      { clothing_type_name: "Casaco", quantities: { RN: 2, P: 2, M: 2, G: 2 } },
      { clothing_type_name: "Meia", quantities: { RN: 6, P: 6, M: 4, G: 4 } },
      { clothing_type_name: "Manta", quantities: { default: 2 } },
      { clothing_type_name: "Pijama", quantities: { RN: 3, P: 3, M: 2, G: 2 } },
      { clothing_type_name: "Touca", quantities: { default: 1 } },
    ],
  },
  {
    id: "verao-basico",
    name: "Roupas de Verão",
    description: "Para bebês que nascem entre novembro e fevereiro. Peças leves e frescas em algodão.",
    season: "verao",
    items: [
      { clothing_type_name: "Body manga curta", quantities: { RN: 8, P: 8, M: 6, G: 4 } },
      { clothing_type_name: "Body regata", quantities: { RN: 4, P: 4, M: 3, G: 2 } },
      { clothing_type_name: "Short", quantities: { RN: 4, P: 4, M: 3, G: 3 } },
      { clothing_type_name: "Macacão manga curta", quantities: { RN: 6, P: 6, M: 4, G: 4 } },
      { clothing_type_name: "Meia", quantities: { RN: 4, P: 4, M: 3, G: 3 } },
      { clothing_type_name: "Body manga longa", quantities: { RN: 3, P: 3, M: 2, G: 2 } },
      { clothing_type_name: "Calça", quantities: { RN: 3, P: 3, M: 2, G: 2 } },
      { clothing_type_name: "Manta", quantities: { default: 1 } },
    ],
  },
  {
    id: "meia-estacao",
    name: "Roupas Meia-Estação",
    description: "Para bebês que nascem entre março–abril ou setembro–outubro. Mix equilibrado de peças leves e quentes.",
    season: "meia-estacao",
    items: [
      { clothing_type_name: "Body manga curta", quantities: { RN: 6, P: 6, M: 4, G: 4 } },
      { clothing_type_name: "Body manga longa", quantities: { RN: 6, P: 6, M: 4, G: 4 } },
      { clothing_type_name: "Calça", quantities: { RN: 6, P: 6, M: 4, G: 4 } },
      { clothing_type_name: "Macacão manga longa", quantities: { RN: 3, P: 3, M: 2, G: 2 } },
      { clothing_type_name: "Macacão manga curta", quantities: { RN: 3, P: 3, M: 2, G: 2 } },
      { clothing_type_name: "Casaco", quantities: { RN: 2, P: 2, M: 2, G: 2 } },
      { clothing_type_name: "Meia", quantities: { RN: 5, P: 5, M: 4, G: 3 } },
      { clothing_type_name: "Pijama", quantities: { RN: 3, P: 3, M: 2, G: 2 } },
      { clothing_type_name: "Manta", quantities: { default: 2 } },
    ],
  },
];
