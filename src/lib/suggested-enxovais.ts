export interface SuggestedItem {
  clothing_type_name: string;
  target_quantity: number;
}

export interface SuggestedEnxoval {
  id: string;
  name: string;
  description: string;
  season: "inverno" | "verao" | "meia-estacao";
  items: SuggestedItem[];
}

// Quantidades baseadas em recomendações de:
// - Alô Bebê (alobebe.com.br)
// - Minha Mãe Experiente (minhamaexperiente.com.br)
// - Mooui (blog.mooui.com.br)
// Adaptadas para clima do Rio de Janeiro (inverno ameno, ~15-25°C)
// Quantidades por tamanho (o usuário seleciona o tamanho ao criar)

export const SUGGESTED_ENXOVAIS: SuggestedEnxoval[] = [
  {
    id: "inverno-rio",
    name: "Roupas de Inverno (clima ameno)",
    description: "Para bebês que nascem entre maio e agosto em cidades de inverno ameno como o Rio. Peças de camada, sem exagero no frio.",
    season: "inverno",
    items: [
      { clothing_type_name: "Body manga longa", target_quantity: 6 },
      { clothing_type_name: "Body manga curta", target_quantity: 6 },
      { clothing_type_name: "Calça", target_quantity: 6 },
      { clothing_type_name: "Macacão manga longa", target_quantity: 4 },
      { clothing_type_name: "Macacão manga curta", target_quantity: 3 },
      { clothing_type_name: "Casaco", target_quantity: 2 },
      { clothing_type_name: "Meia", target_quantity: 6 },
      { clothing_type_name: "Manta", target_quantity: 2 },
      { clothing_type_name: "Pijama", target_quantity: 3 },
      { clothing_type_name: "Touca", target_quantity: 1 },
    ],
  },
  {
    id: "verao-basico",
    name: "Roupas de Verão",
    description: "Para bebês que nascem entre novembro e fevereiro. Peças leves e frescas em algodão.",
    season: "verao",
    items: [
      { clothing_type_name: "Body manga curta", target_quantity: 8 },
      { clothing_type_name: "Body regata", target_quantity: 4 },
      { clothing_type_name: "Short", target_quantity: 4 },
      { clothing_type_name: "Macacão manga curta", target_quantity: 6 },
      { clothing_type_name: "Meia", target_quantity: 4 },
      { clothing_type_name: "Body manga longa", target_quantity: 3 },
      { clothing_type_name: "Calça", target_quantity: 3 },
      { clothing_type_name: "Manta", target_quantity: 1 },
    ],
  },
  {
    id: "meia-estacao",
    name: "Roupas Meia-Estação",
    description: "Para bebês que nascem entre março–abril ou setembro–outubro. Mix equilibrado de peças leves e quentes.",
    season: "meia-estacao",
    items: [
      { clothing_type_name: "Body manga curta", target_quantity: 6 },
      { clothing_type_name: "Body manga longa", target_quantity: 6 },
      { clothing_type_name: "Calça", target_quantity: 6 },
      { clothing_type_name: "Macacão manga longa", target_quantity: 3 },
      { clothing_type_name: "Macacão manga curta", target_quantity: 3 },
      { clothing_type_name: "Casaco", target_quantity: 2 },
      { clothing_type_name: "Meia", target_quantity: 5 },
      { clothing_type_name: "Pijama", target_quantity: 3 },
      { clothing_type_name: "Manta", target_quantity: 2 },
    ],
  },
];
