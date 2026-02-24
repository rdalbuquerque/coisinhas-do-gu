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

  const [{ data: enxoval }, { data: clothingTypes }] = await Promise.all([
    supabase
      .from("enxovais")
      .select("*, size_periods(*), enxoval_items(*, clothing_types(*))")
      .eq("id", id)
      .single(),
    supabase.from("clothing_types").select("*").order("name"),
  ]);

  if (!enxoval) notFound();

  // Get clothes counts for this size period
  const { data: clothes } = await supabase
    .from("clothes")
    .select("clothing_type_id")
    .eq("size_period_id", enxoval.size_period_id);

  const clothesCount = new Map<string, number>();
  (clothes || []).forEach((c) => {
    clothesCount.set(
      c.clothing_type_id,
      (clothesCount.get(c.clothing_type_id) || 0) + 1
    );
  });

  const items = enxoval.enxoval_items || [];
  const totalTarget = items.reduce(
    (sum: number, i: { target_quantity: number }) => sum + i.target_quantity,
    0
  );
  const totalCurrent = items.reduce(
    (sum: number, i: { clothing_type_id: string; target_quantity: number }) =>
      sum + Math.min(clothesCount.get(i.clothing_type_id) || 0, i.target_quantity),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{enxoval.name}</h1>
          <Badge variant="secondary" className="mt-1">
            {enxoval.size_periods?.name}
          </Badge>
        </div>
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
              target_quantity: number;
              clothing_types?: { name: string };
            }) => (
              <EnxovalProgress
                key={item.id}
                label={item.clothing_types?.name || ""}
                current={clothesCount.get(item.clothing_type_id) || 0}
                target={item.target_quantity}
              />
            )
          )
        )}
      </div>

      <EnxovalItemManager
        enxovalId={id}
        existingItems={items.map(
          (i: { id: string; clothing_type_id: string; target_quantity: number }) => ({
            id: i.id,
            clothing_type_id: i.clothing_type_id,
            target_quantity: i.target_quantity,
          })
        )}
        clothingTypes={clothingTypes || []}
      />
    </div>
  );
}
