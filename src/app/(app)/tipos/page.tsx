import { asc, sql, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clothingTypes, clothes } from "@/lib/db/schema";
import { TypesList } from "./types-list";

export default async function TiposPage() {
  const rows = await db
    .select({
      id: clothingTypes.id,
      name: clothingTypes.name,
      created_at: clothingTypes.created_at,
      usage_count: sql<number>`coalesce(count(${clothes.id}), 0)::int`,
    })
    .from(clothingTypes)
    .leftJoin(clothes, eq(clothes.clothing_type_id, clothingTypes.id))
    .groupBy(clothingTypes.id)
    .orderBy(asc(clothingTypes.name));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tipos de roupa</h1>
      <TypesList
        types={rows.map((r) => ({
          id: r.id,
          name: r.name,
          created_at: r.created_at as unknown as string,
          usage_count: r.usage_count,
        }))}
      />
    </div>
  );
}
