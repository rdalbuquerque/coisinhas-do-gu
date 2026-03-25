import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EnxovalProgress } from "@/components/enxoval-progress";
import { EnxovalItemManager } from "./item-manager";
import { DeleteEnxovalButton } from "./delete-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EnxovalDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: enxoval }, { data: clothingTypes }, { data: sizePeriods }] =
    await Promise.all([
      supabase
        .from("enxovais")
        .select("*, enxoval_items(*, clothing_types(*), size_periods(*))")
        .eq("id", id)
        .single(),
      supabase.from("clothing_types").select("*").order("name"),
      supabase.from("size_periods").select("*").order("display_order"),
    ]);

  if (!enxoval) notFound();

  // Get clothes counts by (type, size)
  const { data: clothes } = await supabase
    .from("clothes")
    .select("clothing_type_id, size_period_id");

  const clothesCount = new Map<string, number>();
  (clothes || []).forEach((c) => {
    const key = `${c.clothing_type_id}-${c.size_period_id}`;
    clothesCount.set(key, (clothesCount.get(key) || 0) + 1);
  });

  const items = enxoval.enxoval_items || [];
  const totalTarget = items.reduce(
    (sum: number, i: { target_quantity: number }) => sum + i.target_quantity,
    0
  );
  const totalCurrent = items.reduce(
    (sum: number, i: { clothing_type_id: string; size_period_id: string; target_quantity: number }) => {
      const key = `${i.clothing_type_id}-${i.size_period_id}`;
      return sum + Math.min(clothesCount.get(key) || 0, i.target_quantity);
    },
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{enxoval.name}</h1>
        <DeleteEnxovalButton id={id} />
      </div>

      <div className="rounded-lg border p-4 space-y-1">
        <div className="flex justify-between text-sm font-medium">
          <span>Progresso geral</span>
          <span>
            {totalCurrent}/{totalTarget}
          </span>
        </div>
        <EnxovalProgress
          label=""
          current={totalCurrent}
          target={totalTarget}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Itens</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum item definido.</p>
        ) : (
          items.map(
            (item: {
              id: string;
              clothing_type_id: string;
              size_period_id: string;
              target_quantity: number;
              clothing_types?: { name: string };
              size_periods?: { name: string };
            }) => {
              const key = `${item.clothing_type_id}-${item.size_period_id}`;
              return (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <EnxovalProgress
                      label={item.clothing_types?.name || ""}
                      current={clothesCount.get(key) || 0}
                      target={item.target_quantity}
                    />
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {item.size_periods?.name}
                  </Badge>
                </div>
              );
            }
          )
        )}
      </div>

      <EnxovalItemManager
        enxovalId={id}
        existingItems={items.map(
          (i: {
            id: string;
            clothing_type_id: string;
            size_period_id: string;
            target_quantity: number;
            size_periods?: { name: string };
          }) => ({
            id: i.id,
            clothing_type_id: i.clothing_type_id,
            size_period_id: i.size_period_id,
            size_name: i.size_periods?.name || "",
            target_quantity: i.target_quantity,
          })
        )}
        clothingTypes={clothingTypes || []}
        sizePeriods={sizePeriods || []}
      />
    </div>
  );
}
