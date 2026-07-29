import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import { ScheduleView } from "./ScheduleView";

export default async function Home() {
  const supabase = await createClient();

  const [{ data: recipes, error: recipesError }, { data: pantryIgnore }] = await Promise.all([
    supabase
      .from("recipes")
      .select("id, code, name, main_protein, minutes, day_lock, max_per_week, other, optional")
      .order("code", { ascending: true }),
    supabase.from("pantry_ignore").select("name"),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <NavBar active="schedule" />

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">This week&apos;s dinners</h1>
        <p className="text-sm text-neutral-500">
          Shuffle your library into a 7-day plan, then pull the grocery list for it.
        </p>
      </div>

      {recipesError && (
        <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load your recipes: {recipesError.message}.
        </p>
      )}

      {!recipesError && (recipes ?? []).length === 0 && (
        <p className="mb-6 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
          No dinners in your library yet — add some on the{" "}
          <a href="/library" className="underline">
            Recipes
          </a>{" "}
          page first.
        </p>
      )}

      <ScheduleView
        recipes={recipes ?? []}
        pantryIgnore={(pantryIgnore ?? []).map((p) => p.name)}
      />
    </div>
  );
}
