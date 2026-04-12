import { and, desc, eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { clothes, clothingTypes, sizePeriods } from "@/lib/db/schema";
import { ClothingCard } from "@/components/clothing-card";
import { FilterBar } from "@/components/filter-bar";
import { InventorySummary } from "@/components/inventory-summary";
import { KindToggle } from "@/components/kind-toggle";
import { Clothing, Season } from "@/lib/types/database";
import { parseEnxovalKind } from "@/lib/constants";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{
    tipo?: string;
    tamanho?: string;
    estacao?: string;
    kind?: string;
  }>;
}

export default async function InventarioPage({ searchParams }: Props) {
  const params = await searchParams;
  const kind = parseEnxovalKind(params.kind);

  const conditions = [eq(clothingTypes.kind, kind)];
  if (params.tipo) conditions.push(eq(clothes.clothing_type_id, params.tipo));
  if (params.tamanho) conditions.push(eq(clothes.size_period_id, params.tamanho));
  if (params.estacao) conditions.push(eq(clothes.season, params.estacao as Season));

  const [itemRows, types, sizes] = await Promise.all([
    db
      .select({
        clothing: clothes,
        clothing_type: clothingTypes,
        size_period: sizePeriods,
      })
      .from(clothes)
      .innerJoin(clothingTypes, eq(clothes.clothing_type_id, clothingTypes.id))
      .leftJoin(sizePeriods, eq(clothes.size_period_id, sizePeriods.id))
      .where(and(...conditions))
      .orderBy(desc(clothes.created_at)),
    db
      .select()
      .from(clothingTypes)
      .where(eq(clothingTypes.kind, kind))
      .orderBy(asc(clothingTypes.name)),
    db.select().from(sizePeriods).orderBy(asc(sizePeriods.display_order)),
  ]);

  const items: Clothing[] = itemRows.map((row) => ({
    ...row.clothing,
    clothing_types: row.clothing_type,
    size_periods: row.size_period ?? null,
  })) as unknown as Clothing[];

  const totalLabel =
    kind === "quarto"
      ? `${items.length} ite${items.length === 1 ? "m" : "ns"}`
      : `${items.length} peça${items.length !== 1 ? "s" : ""}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-medium">Inventário</h1>
        <Suspense fallback={null}>
          <KindToggle kind={kind} basePath="/inventario" />
        </Suspense>
      </div>

      <div className="flex items-center justify-end">
        <span className="text-sm text-muted-foreground">{totalLabel}</span>
      </div>

      <InventorySummary
        kind={kind}
        items={items}
        clothingTypes={types}
        sizePeriods={sizes}
      />

      <Suspense fallback={null}>
        <FilterBar kind={kind} clothingTypes={types} sizePeriods={sizes} />
      </Suspense>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <div className="h-12 w-12 rounded-full border-2 border-dashed border-muted-foreground/20" />
          <p className="text-sm">
            {kind === "quarto"
              ? "Nenhum item encontrado."
              : "Nenhuma peça encontrada."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
