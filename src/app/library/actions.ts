"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RecipeInput = {
  id?: string;
  code: string;
  name: string;
  tag: string;
  mainProtein: string;
  minutes: number;
  dayLock: string;
  maxPerWeek: number;
  protein: string[];
  carbs: string[];
  vegetables: string[];
  other: string[];
  optional: string[];
  instructions: string[];
  notes: string;
};

export async function upsertRecipe(input: RecipeInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const row = {
    user_id: user.id,
    code: input.code,
    name: input.name,
    tag: input.tag,
    main_protein: input.mainProtein,
    minutes: input.minutes,
    day_lock: input.dayLock,
    max_per_week: input.maxPerWeek,
    protein: input.protein,
    carbs: input.carbs,
    vegetables: input.vegetables,
    other: input.other,
    optional: input.optional,
    instructions: input.instructions,
    notes: input.notes,
  };

  const { error } = input.id
    ? await supabase.from("recipes").update(row).eq("id", input.id)
    : await supabase.from("recipes").insert(row);

  if (error) throw new Error(error.message);
  revalidatePath("/library");
}

export async function deleteRecipe(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/library");
}
