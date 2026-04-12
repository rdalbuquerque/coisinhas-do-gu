import { asc, sql, eq, and } from "drizzle-orm";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { clothingTypes, clothes } from "@/lib/db/schema";
import { TypesList } from "./types-list";
import { KindToggle } from "@/components/kind-toggle";
import { parseEnxovalKind } from "@/lib/constants";

interface Props {
  searchParams: Promise<{ kind?: string }>;
}

export default async function TiposPage({ searchParams }: Props) {
  const params = await searchParams;
  const kind = parseEnxovalKind(params.kind);

  const rows = await db
    .select({
      id: clothingTypes.id,
      name: clothingTypes.name,
      kind: clothingTypes.kind,
      created_at: clothingTypes.created_at,
      usage_count: sql<number>`coalesce(count(${clothes.id}), 0)::int`,
    })
    .from(clothingTypes)
    .leftJoin(clothes, and(eq(clothes.clothing_type_id, clothingTypes.id)))
    .where(eq(clothingTypes.kind, kind))
    .groupBy(clothingTypes.id)
    .orderBy(asc(clothingTypes.name));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">
          {kind === "quarto" ? "Tipos de item" : "Tipos de roupa"}
        </h1>
        <Suspense fallback={null}>
          <KindToggle kind={kind} basePath="/tipos" />
        </Suspense>
      </div>
      <TypesList
        kind={kind}
        types={rows.map((r) => ({
          id: r.id,
          name: r.name,
          kind: r.kind,
          created_at: r.created_at as unknown as string,
          usage_count: r.usage_count,
        }))}
      />
    </div>
  );
}
