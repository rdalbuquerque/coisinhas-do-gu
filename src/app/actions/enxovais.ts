"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEnxoval(data: {
  name: string;
  size_period_id: string;
  items: { clothing_type_id: string; target_quantity: number }[];
}) {
  const supabase = await createClient();

  const { data: enxoval, error } = await supabase
    .from("enxovais")
    .insert({ name: data.name, size_period_id: data.size_period_id })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (data.items.length > 0) {
    const itemsToInsert = data.items.map((item) => ({
      enxoval_id: enxoval.id,
      clothing_type_id: item.clothing_type_id,
      target_quantity: item.target_quantity,
    }));

    const { error: itemsError } = await supabase
      .from("enxoval_items")
      .insert(itemsToInsert);

    if (itemsError) throw new Error(itemsError.message);
  }

  revalidatePath("/enxoval");
  revalidatePath("/presentes");
  return enxoval;
}

export async function updateEnxovalItem(
  id: string,
  target_quantity: number
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("enxoval_items")
    .update({ target_quantity })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/enxoval");
  revalidatePath("/presentes");
}

export async function addEnxovalItem(data: {
  enxoval_id: string;
  clothing_type_id: string;
  target_quantity: number;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("enxoval_items").insert(data);

  if (error) throw new Error(error.message);

  revalidatePath("/enxoval");
  revalidatePath("/presentes");
}

export async function removeEnxovalItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("enxoval_items").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/enxoval");
  revalidatePath("/presentes");
}

export async function deleteEnxoval(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("enxovais").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/enxoval");
  revalidatePath("/presentes");
}
