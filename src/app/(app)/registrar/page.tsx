import { asc, eq } from "drizzle-orm";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { clothingTypes, sizePeriods } from "@/lib/db/schema";
import { ClothingForm } from "@/components/clothing-form";
import { KindToggle } from "@/components/kind-toggle";
import { parseEnxovalKind } from "@/lib/constants";

interface Props {
  searchParams: Promise<{ kind?: string }>;
}

export default async function RegistrarPage({ searchParams }: Props) {
  const params = await searchParams;
  const kind = parseEnxovalKind(params.kind);

  const [types, sizes] = await Promise.all([
    db
      .select()
      .from(clothingTypes)
      .where(eq(clothingTypes.kind, kind))
      .orderBy(asc(clothingTypes.name)),
    db.select().from(sizePeriods).orderBy(asc(sizePeriods.display_order)),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-medium">Registrar</h1>
        <Suspense fallback={null}>
          <KindToggle kind={kind} basePath="/registrar" />
        </Suspense>
      </div>
      <ClothingForm
        kind={kind}
        clothingTypes={types}
        sizePeriods={sizes}
      />
    </div>
  );
}
