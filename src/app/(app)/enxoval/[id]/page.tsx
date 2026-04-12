import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { clothes, clothingTypes } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnxovalProgress } from "@/components/enxoval-progress";
import { EnxovalItemsList } from "./items-list";
import { DeleteEnxovalButton } from "./delete-button";
import Link from "next/link";
import { Baby, BedDouble, Pencil } from "lucide-react";
import { EnxovalKind } from "@/lib/types/database";

function sizeKey(size_period_id: string | null): string {
  return size_period_id ?? "none";
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EnxovalDetailPage({ params }: Props) {
  const { id } = await params;

  const enxoval = await db.query.enxovais.findFirst({
    where: (e, { eq }) => eq(e.id, id),
    with: {
      enxoval_items: {
        with: { clothing_types: true, size_periods: true },
      },
    },
  });

  if (!enxoval) notFound();

  const kind = (enxoval.kind ?? "roupinhas") as EnxovalKind;

  const clothesRows = await db
    .select({
      clothing_type_id: clothes.clothing_type_id,
      size_period_id: clothes.size_period_id,
    })
    .from(clothes)
    .innerJoin(clothingTypes, eq(clothes.clothing_type_id, clothingTypes.id))
    .where(eq(clothingTypes.kind, kind));

  const clothesCount = new Map<string, number>();
  clothesRows.forEach((c) => {
    const key = `${c.clothing_type_id}-${sizeKey(c.size_period_id)}`;
    clothesCount.set(key, (clothesCount.get(key) || 0) + 1);
  });

  const items = (enxoval.enxoval_items || []).map((item) => {
    const key = `${item.clothing_type_id}-${sizeKey(item.size_period_id)}`;
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
    if (item.size_period_id) sizeMap.set(item.size_period_id, item.size_name);
    typeMap.set(item.clothing_type_id, item.type_name);
  }
  const sizes = Array.from(sizeMap, ([id, name]) => ({ id, name }));
  const types = Array.from(typeMap, ([id, name]) => ({ id, name })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{enxoval.name}</h1>
          <Badge variant="secondary" className="gap-1">
            {kind === "quarto" ? (
              <BedDouble className="h-3 w-3" />
            ) : (
              <Baby className="h-3 w-3" />
            )}
            {kind === "quarto" ? "Quarto" : "Roupinhas"}
          </Badge>
        </div>
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
            {totalCurrent}/{totalTarget} {kind === "quarto" ? "itens" : "peças"}
          </span>
        </div>
        <EnxovalProgress label="" current={totalCurrent} target={totalTarget} />
      </div>

      <EnxovalItemsList kind={kind} items={items} sizes={sizes} types={types} />
    </div>
  );
}
