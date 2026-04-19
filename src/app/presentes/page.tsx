import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clothes, clothingTypes, enxovais } from "@/lib/db/schema";
import Image from "next/image";
import { EnxovalKind } from "@/lib/types/database";
import { PresentesList } from "./presentes-list";

export const revalidate = 60;

function sizeKey(size_period_id: string | null): string {
  return size_period_id ?? "none";
}

export default async function PresentesPage() {
  const [enxovaisRows, clothesRows] = await Promise.all([
    db.query.enxovais.findMany({
      with: {
        enxoval_items: {
          with: { clothing_types: true, size_periods: true },
        },
      },
      orderBy: [asc(enxovais.created_at)],
    }),
    db
      .select({
        clothing_type_id: clothes.clothing_type_id,
        size_period_id: clothes.size_period_id,
        kind: clothingTypes.kind,
      })
      .from(clothes)
      .innerJoin(clothingTypes, eq(clothes.clothing_type_id, clothingTypes.id)),
  ]);

  // Per-kind clothes maps to keep Roupinhas and Quarto counts separate.
  const clothesMaps: Record<EnxovalKind, Map<string, number>> = {
    roupinhas: new Map(),
    quarto: new Map(),
  };
  clothesRows.forEach((c) => {
    const key = `${c.clothing_type_id}-${sizeKey(c.size_period_id)}`;
    const m = clothesMaps[c.kind as EnxovalKind];
    m.set(key, (m.get(key) || 0) + 1);
  });

  const sections = enxovaisRows
    .map((enxoval) => {
      const kind = (enxoval.kind ?? "roupinhas") as EnxovalKind;
      const map = clothesMaps[kind];
      const items = (enxoval.enxoval_items || [])
        .map((item) => {
          const key = `${item.clothing_type_id}-${sizeKey(item.size_period_id)}`;
          const current = map.get(key) || 0;
          const missing = item.target_quantity - current;
          return {
            name: item.clothing_types?.name || "",
            sizeName: item.size_periods?.name || "",
            missing,
          };
        })
        .filter((item) => item.missing > 0);

      return { name: enxoval.name, kind, items };
    })
    .filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-secondary/10">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="text-center space-y-3">
          <Image
            src="/logo.png"
            alt="Coisinhas do Gu"
            width={96}
            height={96}
            priority
            className="mx-auto h-24 w-24"
          />
          <div>
            <h1 className="text-2xl font-bold">Coisinhas do Gu</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Veja o que ainda falta no enxoval do Gustavo
            </p>
          </div>
        </div>

        <PresentesList sections={sections} />

        <p className="text-center text-xs text-muted-foreground">
          Lista atualizada automaticamente pelos papais
        </p>
      </div>
    </div>
  );
}
