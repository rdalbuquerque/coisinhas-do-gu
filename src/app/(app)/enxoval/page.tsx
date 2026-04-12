import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { clothes, clothingTypes, enxovais } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Baby, BedDouble, Plus } from "lucide-react";
import { EnxovalKind } from "@/lib/types/database";

function sizeKey(size_period_id: string | null): string {
  return size_period_id ?? "none";
}

export default async function EnxovalListPage() {
  const [enxovaisRows, clothesRows] = await Promise.all([
    db.query.enxovais.findMany({
      with: {
        enxoval_items: {
          with: { clothing_types: true, size_periods: true },
        },
      },
      orderBy: [desc(enxovais.created_at)],
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

  // Separate clothes maps per kind so "Manta" (roupinhas) and "Mantas" (quarto) never cross-count.
  const clothesMaps: Record<EnxovalKind, Map<string, number>> = {
    roupinhas: new Map(),
    quarto: new Map(),
  };
  clothesRows.forEach((c) => {
    const key = `${c.clothing_type_id}-${sizeKey(c.size_period_id)}`;
    const m = clothesMaps[c.kind as EnxovalKind];
    m.set(key, (m.get(key) || 0) + 1);
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Enxovais</h1>
        <Button asChild size="sm">
          <Link href="/enxoval/novo">
            <Plus className="mr-1 h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      {enxovaisRows.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhum enxoval criado ainda.
        </p>
      ) : (
        <div className="space-y-4">
          {enxovaisRows.map((enxoval) => {
            const kind = (enxoval.kind ?? "roupinhas") as EnxovalKind;
            const items = enxoval.enxoval_items || [];
            const map = clothesMaps[kind];
            const totalTarget = items.reduce((sum, i) => sum + i.target_quantity, 0);
            const totalCurrent = items.reduce((sum, i) => {
              const key = `${i.clothing_type_id}-${sizeKey(i.size_period_id)}`;
              return sum + Math.min(map.get(key) || 0, i.target_quantity);
            }, 0);
            const percentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

            return (
              <Link key={enxoval.id} href={`/enxoval/${enxoval.id}`}>
                <Card className="transition-all hover:shadow-soft-lg hover:-translate-y-0.5">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-lg">{enxoval.name}</CardTitle>
                      <Badge variant="secondary" className="gap-1 shrink-0">
                        {kind === "quarto" ? (
                          <BedDouble className="h-3 w-3" />
                        ) : (
                          <Baby className="h-3 w-3" />
                        )}
                        {kind === "quarto" ? "Quarto" : "Roupinhas"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={percentage} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {totalCurrent}/{totalTarget} {kind === "quarto" ? "itens" : "peças"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
