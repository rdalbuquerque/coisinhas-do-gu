"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createClothingType(name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clothing_types").insert({ name });

  if (error) {
    if (error.code === "23505") throw new Error("Esse tipo já existe.");
    throw new Error(error.message);
  }

  revalidatePath("/tipos");
  revalidatePath("/registrar");
}

export async function updateClothingType(id: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clothing_types")
    .update({ name })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/tipos");
  revalidatePath("/registrar");
  revalidatePath("/inventario");
}

export async function deleteClothingType(id: string) {
  const supabase = await createClient();

  // Check if type is in use
  const { count } = await supabase
    .from("clothes")
    .select("*", { count: "exact", head: true })
    .eq("clothing_type_id", id);

  if (count && count > 0) {
    throw new Error(`Esse tipo está em uso em ${count} peça(s). Remova as peças primeiro.`);
  }

  // Also check enxoval_items
  const { count: enxovalCount } = await supabase
    .from("enxoval_items")
    .select("*", { count: "exact", head: true })
    .eq("clothing_type_id", id);

  if (enxovalCount && enxovalCount > 0) {
    throw new Error(`Esse tipo está em uso em ${enxovalCount} item(ns) de enxoval. Remova dos enxovais primeiro.`);
  }

  const { error } = await supabase
    .from("clothing_types")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/tipos");
  revalidatePath("/registrar");
}
