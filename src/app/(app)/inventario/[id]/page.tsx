import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { clothingTypes, sizePeriods } from "@/lib/db/schema";
import { ClothingForm } from "@/components/clothing-form";
import { Clothing } from "@/lib/types/database";
import { DeleteClothingButton } from "./delete-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClothingDetailPage({ params }: Props) {
  const { id } = await params;

  const clothing = await db.query.clothes.findFirst({
    where: (c, { eq }) => eq(c.id, id),
    with: { clothing_types: true, size_periods: true },
  });

  if (!clothing) notFound();

  const kind = clothing.clothing_types?.kind ?? "roupinhas";

  const [types, sizes] = await Promise.all([
    db
      .select()
      .from(clothingTypes)
      .where(eq(clothingTypes.kind, kind))
      .orderBy(asc(clothingTypes.name)),
    db.select().from(sizePeriods).orderBy(asc(sizePeriods.display_order)),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {kind === "quarto" ? "Editar item" : "Editar peça"}
        </h1>
        <DeleteClothingButton id={id} />
      </div>
      <ClothingForm
        kind={kind}
        clothingTypes={types}
        sizePeriods={sizes}
        editing={clothing as unknown as Clothing}
      />
    </div>
  );
}
