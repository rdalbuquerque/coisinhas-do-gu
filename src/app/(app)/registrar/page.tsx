import { createClient } from "@/lib/supabase/server";
import { ClothingForm } from "@/components/clothing-form";

export default async function RegistrarPage() {
  const supabase = await createClient();

  const [{ data: clothingTypes }, { data: sizePeriods }] = await Promise.all([
    supabase.from("clothing_types").select("*").order("name"),
    supabase.from("size_periods").select("*").order("display_order"),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Registrar peça</h1>
      <ClothingForm
        clothingTypes={clothingTypes || []}
        sizePeriods={sizePeriods || []}
      />
    </div>
  );
}
