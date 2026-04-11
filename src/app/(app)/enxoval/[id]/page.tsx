import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { clothes } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { EnxovalProgress } from "@/components/enxoval-progress";
import { EnxovalItemsList } from "./items-list";
import { DeleteEnxovalButton } from "./delete-button";
import Link from "next/link";
import { Pencil } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EnxovalDetailPage({ params }: Props) {
  const { id } = await params;

  const [enxoval, clothesRows] = await Promise.all([
    db.query.enxovais.findFirst({
      where: (e, { eq }) => eq(e.id, id),
      with: {
        enxoval_items: {
          with: { clothing_types: true, size_periods: true },
        },
      },
    }),
    db
      .select({
        clothing_type_id: clothes.clothing_type_id,
        size_period_id: clothes.size_period_id,
      })
      .from(clothes),
  ]);

  if (!enxoval) notFound();

  const clothesCount = new Map<string, number>();
  clothesRows.forEach((c) => {
    const key = `${c.clothing_type_id}-${c.size_period_id}`;
    clothesCount.set(key, (clothesCount.get(key) || 0) + 1);
  });

  const items = (enxoval.enxoval_items || []).map((item) => {
    const key = `${item.clothing_type_id}-${item.size_period_id}`;
    return {
      id: item.id,
      clothing_type_id: item.clothing_type_id,
      size_period_id: item.size_period_id,
      target_quantity: item.target_quantity,
      type_name: item.clothing_types?.name || "",
      size_name: item.size_periods?.name || "",
      current: Math.min(clothesCount.get(key) || 0, item.target_quantity),
    };
  });

  const totalTarget = items.reduce((sum, i) => sum + i.target_quantity, 0);
  const totalCurrent = items.reduce((sum, i) => sum + i.current, 0);

  const sizeMap = new Map<string, string>();
  const typeMap = new Map<string, string>();
  for (const item of items) {
    sizeMap.set(item.size_period_id, item.size_name);
    typeMap.set(item.clothing_type_id, item.type_name);
  }
  const sizes = Array.from(sizeMap, ([id, name]) => ({ id, name }));
  const types = Array.from(typeMap, ([id, name]) => ({ id, name })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{enxoval.name}</h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/enxoval/${id}/editar`}>
              <Pencil className="mr-1 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <DeleteEnxovalButton id={id} />
        </div>
      </div>

      <div className="rounded-lg border p-4 space-y-1">
        <div className="flex justify-between text-sm font-medium">
          <span>Progresso geral</span>
          <span>
            {totalCurrent}/{totalTarget} peças
          </span>
        </div>
        <EnxovalProgress label="" current={totalCurrent} target={totalTarget} />
      </div>

      <EnxovalItemsList items={items} sizes={sizes} types={types} />
    </div>
  );
}
