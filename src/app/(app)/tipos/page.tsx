import { createClient } from "@/lib/supabase/server";
import { TypesList } from "./types-list";

export default async function TiposPage() {
  const supabase = await createClient();

  const { data: types } = await supabase
    .from("clothing_types")
    .select("*")
    .order("name");

  // Get usage counts
  const { data: clothesUsage } = await supabase
    .from("clothes")
    .select("clothing_type_id");

  const usageCount = new Map<string, number>();
  (clothesUsage || []).forEach((c) => {
    usageCount.set(
      c.clothing_type_id,
      (usageCount.get(c.clothing_type_id) || 0) + 1
    );
  });

  const typesWithCount = (types || []).map((t) => ({
    ...t,
    usage_count: usageCount.get(t.id) || 0,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tipos de roupa</h1>
      <TypesList types={typesWithCount} />
    </div>
  );
}
