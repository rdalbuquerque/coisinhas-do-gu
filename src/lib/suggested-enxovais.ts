export type EnxovalKind = "roupinhas" | "quarto";

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

export interface SuggestedItemNoSize {
  clothing_type_name: string;
  target_quantity: number;
}

export type SuggestedEnxoval =
  | {
      id: string;
      kind: "roupinhas";
      name: string;
      description: string;
      season: "inverno" | "verao" | "meia-estacao";
      items: SuggestedItemBySize[];
    }
  | {
      id: string;
      kind: "quarto";
      name: string;
      description: string;
      items: SuggestedItemNoSize[];
    };

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
    kind: "roupinhas",
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
    kind: "roupinhas",
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
    kind: "roupinhas",
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
  {
    id: "quarto-padrao",
    kind: "quarto",
    name: "Quarto da bebê",
    description: "Berço, roupa de cama, cobertores e acessórios para montar o quartinho.",
    items: [
      { clothing_type_name: "Berço desmontável", target_quantity: 1 },
      { clothing_type_name: "Jogos de lençol para berço desmontável", target_quantity: 2 },
      { clothing_type_name: "Mantas", target_quantity: 2 },
      { clothing_type_name: "Cueiros", target_quantity: 2 },
      { clothing_type_name: "Edredons", target_quantity: 2 },
      { clothing_type_name: "Cobertores de berço", target_quantity: 2 },
      { clothing_type_name: "Cobertores de enrolar", target_quantity: 2 },
      { clothing_type_name: "Colchonete para berço desmontável", target_quantity: 1 },
      { clothing_type_name: "Jogos de lençol para berço", target_quantity: 4 },
      { clothing_type_name: "Protetor de colchão", target_quantity: 1 },
      { clothing_type_name: "Fronhas avulsas", target_quantity: 3 },
      { clothing_type_name: "Travesseiro antirrefluxo", target_quantity: 1 },
      { clothing_type_name: "Travesseiros antissufocante", target_quantity: 2 },
      { clothing_type_name: "Posicionador para dormir", target_quantity: 1 },
      { clothing_type_name: "Kits para berço", target_quantity: 2 },
      { clothing_type_name: "Mosquiteiro", target_quantity: 1 },
      { clothing_type_name: "Kits de fralda de boca", target_quantity: 2 },
      { clothing_type_name: "Blanket (naninha)", target_quantity: 1 },
      { clothing_type_name: "Ninho", target_quantity: 1 },
      { clothing_type_name: "Móbile", target_quantity: 1 },
      { clothing_type_name: "Kits de cabide", target_quantity: 3 },
    ],
  },
];
