"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Season } from "@/lib/types/database";

export async function createClothing(formData: {
  clothing_type_id: string;
  size_period_id: string;
  season: Season;
  photo_url: string | null;
  notes: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("clothes").insert(formData);

  if (error) throw new Error(error.message);

  revalidatePath("/inventario");
  revalidatePath("/enxoval");
  revalidatePath("/presentes");
  revalidatePath("/registrar");
}

export async function updateClothing(
  id: string,
  formData: {
    clothing_type_id: string;
    size_period_id: string;
    season: Season;
    photo_url: string | null;
    notes: string | null;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("clothes").update(formData).eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/inventario");
  revalidatePath("/enxoval");
  revalidatePath("/presentes");
}

export async function deleteClothing(id: string) {
  const supabase = await createClient();

  // Get the photo URL to delete from storage
  const { data: clothing } = await supabase
    .from("clothes")
    .select("photo_url")
    .eq("id", id)
    .single();

  if (clothing?.photo_url) {
    const path = clothing.photo_url.split("/clothes-photos/")[1];
    if (path) {
      await supabase.storage.from("clothes-photos").remove([path]);
    }
  }

  const { error } = await supabase.from("clothes").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/inventario");
  revalidatePath("/enxoval");
  revalidatePath("/presentes");
}
