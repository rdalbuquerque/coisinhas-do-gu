import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { clothingTypes, sizePeriods } from "@/lib/db/schema";
import { NovoEnxovalForm } from "./novo-form";

export default async function NovoEnxovalPage() {
  const [types, sizes] = await Promise.all([
    db.select().from(clothingTypes).orderBy(asc(clothingTypes.name)),
    db.select().from(sizePeriods).orderBy(asc(sizePeriods.display_order)),
  ]);

  return <NovoEnxovalForm initialClothingTypes={types} initialSizePeriods={sizes} />;
}
