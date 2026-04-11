import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { clothingTypes, sizePeriods } from "@/lib/db/schema";
import { ClothingForm } from "@/components/clothing-form";

export default async function RegistrarPage() {
  const [types, sizes] = await Promise.all([
    db.select().from(clothingTypes).orderBy(asc(clothingTypes.name)),
    db.select().from(sizePeriods).orderBy(asc(sizePeriods.display_order)),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Registrar peça</h1>
      <ClothingForm clothingTypes={types} sizePeriods={sizes} />
    </div>
  );
}
