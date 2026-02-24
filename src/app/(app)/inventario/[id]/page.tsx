import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClothingForm } from "@/components/clothing-form";
import { Clothing } from "@/lib/types/database";
import { DeleteClothingButton } from "./delete-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClothingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: clothing }, { data: clothingTypes }, { data: sizePeriods }] =
    await Promise.all([
      supabase
        .from("clothes")
        .select("*, clothing_types(*), size_periods(*)")
        .eq("id", id)
        .single(),
      supabase.from("clothing_types").select("*").order("name"),
      supabase.from("size_periods").select("*").order("display_order"),
    ]);

  if (!clothing) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar peça</h1>
        <DeleteClothingButton id={id} />
      </div>
      <ClothingForm
        clothingTypes={clothingTypes || []}
        sizePeriods={sizePeriods || []}
        editing={clothing as Clothing}
      />
    </div>
  );
}
