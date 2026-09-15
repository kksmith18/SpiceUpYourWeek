"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type WorkoutInput = {
  id?: string;
  name: string;
  tag: string;
  minutes: number;
  dayLock: string;
  maxPerWeek: number;
  exercises: string[];
};

export async function upsertWorkout(input: WorkoutInput) {
  const supabase = await createClient();
  // TEMP: auth is disabled during solo testing (see lib/supabase/middleware.ts),
  // so there's no signed-in user yet — user_id falls back to the DB default.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const row = {
    ...(user ? { user_id: user.id } : {}),
    name: input.name,
    tag: input.tag,
    minutes: input.minutes,
    day_lock: input.dayLock,
    max_per_week: input.maxPerWeek,
    exercises: input.exercises,
  };

  const { error } = input.id
    ? await supabase.from("workouts").update(row).eq("id", input.id)
    : await supabase.from("workouts").insert(row);

  if (error) throw new Error(error.message);
  revalidatePath("/workouts");
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/workouts");
}
