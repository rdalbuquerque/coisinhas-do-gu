import { createClient } from "@/lib/supabase/server";
import { ClothingCard } from "@/components/clothing-card";
import { FilterBar } from "@/components/filter-bar";
import { Clothing } from "@/lib/types/database";
import { Suspense } from "react";

interface Props {
  searchParams: Promise<{ tipo?: string; tamanho?: string; estacao?: string }>;
}

export default async function InventarioPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("clothes")
    .select("*, clothing_types(*), size_periods(*)")
    .order("created_at", { ascending: false });

  if (params.tipo) query = query.eq("clothing_type_id", params.tipo);
  if (params.tamanho) query = query.eq("size_period_id", params.tamanho);
  if (params.estacao) query = query.eq("season", params.estacao);

  const [{ data: clothes }, { data: clothingTypes }, { data: sizePeriods }] =
    await Promise.all([
      query,
      supabase.from("clothing_types").select("*").order("name"),
      supabase.from("size_periods").select("*").order("display_order"),
    ]);

  const items = (clothes as Clothing[]) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventário</h1>
        <span className="text-sm text-muted-foreground">
          {items.length} peça{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Suspense fallback={null}>
        <FilterBar
          clothingTypes={clothingTypes || []}
          sizePeriods={sizePeriods || []}
        />
      </Suspense>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhuma peça encontrada.
        </p>
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
