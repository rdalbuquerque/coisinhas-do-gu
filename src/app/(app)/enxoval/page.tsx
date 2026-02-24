import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function EnxovalListPage() {
  const supabase = await createClient();

  const { data: enxovais } = await supabase
    .from("enxovais")
    .select("*, size_periods(*), enxoval_items(*, clothing_types(*))")
    .order("created_at", { ascending: false });

  // Get all clothes for counting
  const { data: clothes } = await supabase
    .from("clothes")
    .select("clothing_type_id, size_period_id");

  const clothesMap = new Map<string, number>();
  (clothes || []).forEach((c) => {
    const key = `${c.clothing_type_id}-${c.size_period_id}`;
    clothesMap.set(key, (clothesMap.get(key) || 0) + 1);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Enxovais</h1>
        <Button asChild size="sm">
          <Link href="/enxoval/novo">
            <Plus className="mr-1 h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      {(!enxovais || enxovais.length === 0) ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhum enxoval criado ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {enxovais.map((enxoval) => {
            const items = enxoval.enxoval_items || [];
            const totalTarget = items.reduce(
              (sum: number, i: { target_quantity: number }) => sum + i.target_quantity,
              0
            );
            const totalCurrent = items.reduce(
              (sum: number, i: { clothing_type_id: string; target_quantity: number }) => {
                const key = `${i.clothing_type_id}-${enxoval.size_period_id}`;
                return sum + Math.min(clothesMap.get(key) || 0, i.target_quantity);
              },
              0
            );
            const percentage =
              totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

            return (
              <Link key={enxoval.id} href={`/enxoval/${enxoval.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{enxoval.name}</CardTitle>
                      <Badge variant="secondary">
                        {enxoval.size_periods?.name}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={percentage} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {totalCurrent}/{totalTarget} itens
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
