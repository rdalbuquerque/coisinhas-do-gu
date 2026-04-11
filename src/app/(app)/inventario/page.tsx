import { and, desc, eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { clothes, clothingTypes, sizePeriods } from "@/lib/db/schema";
import { ClothingCard } from "@/components/clothing-card";
import { FilterBar } from "@/components/filter-bar";
import { InventorySummary } from "@/components/inventory-summary";
import { Clothing, Season } from "@/lib/types/database";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ tipo?: string; tamanho?: string; estacao?: string }>;
}

export default async function InventarioPage({ searchParams }: Props) {
  const params = await searchParams;

  const conditions = [];
  if (params.tipo) conditions.push(eq(clothes.clothing_type_id, params.tipo));
  if (params.tamanho) conditions.push(eq(clothes.size_period_id, params.tamanho));
  if (params.estacao) conditions.push(eq(clothes.season, params.estacao as Season));

  const [items, types, sizes] = await Promise.all([
    db.query.clothes.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      with: { clothing_types: true, size_periods: true },
      orderBy: [desc(clothes.created_at)],
    }),
    db.select().from(clothingTypes).orderBy(asc(clothingTypes.name)),
    db.select().from(sizePeriods).orderBy(asc(sizePeriods.display_order)),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventário</h1>
        <span className="text-sm text-muted-foreground">
          {items.length} peça{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <InventorySummary
        items={items as unknown as Clothing[]}
        clothingTypes={types}
        sizePeriods={sizes}
      />

      <Suspense fallback={null}>
        <FilterBar clothingTypes={types} sizePeriods={sizes} />
      </Suspense>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma peça encontrada.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <ClothingCard key={item.id} item={item as unknown as Clothing} />
          ))}
        </div>
      )}
    </div>
  );
}
