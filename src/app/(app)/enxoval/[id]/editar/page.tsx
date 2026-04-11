import { asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { clothingTypes, sizePeriods } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { EnxovalItemManager } from "../item-manager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarEnxovalPage({ params }: Props) {
  const { id } = await params;

  const [enxoval, types, sizes] = await Promise.all([
    db.query.enxovais.findFirst({
      where: (e, { eq }) => eq(e.id, id),
      with: {
        enxoval_items: {
          with: { clothing_types: true, size_periods: true },
        },
      },
    }),
    db.select().from(clothingTypes).orderBy(asc(clothingTypes.name)),
    db.select().from(sizePeriods).orderBy(asc(sizePeriods.display_order)),
  ]);

  if (!enxoval) notFound();

  const items = enxoval.enxoval_items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/enxoval/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar: {enxoval.name}</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        As alterações são salvas automaticamente.
      </p>

      <EnxovalItemManager
        enxovalId={id}
        existingItems={items.map((i) => ({
          id: i.id,
          clothing_type_id: i.clothing_type_id,
          size_period_id: i.size_period_id,
          size_name: i.size_periods?.name || "",
          target_quantity: i.target_quantity,
        }))}
        clothingTypes={types}
        sizePeriods={sizes}
      />
    </div>
  );
}
