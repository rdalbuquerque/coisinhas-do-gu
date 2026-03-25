import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EnxovalItemManager } from "../item-manager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarEnxovalPage({ params }: Props) {
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
