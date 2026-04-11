import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { clothes, enxovais } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Gift } from "lucide-react";

export const revalidate = 60;

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
      })
      .from(clothes),
  ]);

  const clothesMap = new Map<string, number>();
  clothesRows.forEach((c) => {
    const key = `${c.clothing_type_id}-${c.size_period_id}`;
    clothesMap.set(key, (clothesMap.get(key) || 0) + 1);
  });

  const sections = enxovaisRows
    .map((enxoval) => {
      const items = (enxoval.enxoval_items || [])
        .map((item) => {
          const key = `${item.clothing_type_id}-${item.size_period_id}`;
          const current = clothesMap.get(key) || 0;
          const missing = item.target_quantity - current;
          return {
            name: item.clothing_types?.name || "",
            sizeName: item.size_periods?.name || "",
            missing,
          };
        })
        .filter((item) => item.missing > 0);

      return { name: enxoval.name, items };
    })
    .filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Baby className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Coisinhas do Gu</h1>
          <p className="text-muted-foreground text-sm">
            Veja o que ainda falta no enxoval do Gustavo
          </p>
        </div>

        {sections.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Gift className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Tudo completo! Nenhum item faltando no momento.
              </p>
            </CardContent>
          </Card>
        ) : (
          sections.map((section, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{section.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {section.items.map((item, j) => (
                    <li
                      key={j}
                      className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                    >
                      <span className="flex items-center gap-2">
                        {item.name}
                        <Badge variant="outline" className="text-xs">
                          {item.sizeName}
                        </Badge>
                      </span>
                      <span className="text-muted-foreground">
                        faltam {item.missing}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        )}

        <p className="text-center text-xs text-muted-foreground">
          Lista atualizada automaticamente pelos papais
        </p>
      </div>
    </div>
  );
}
