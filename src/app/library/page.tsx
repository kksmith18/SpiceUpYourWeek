import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/NavBar";
import { RecipeLibrary } from "./RecipeLibrary";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <NavBar active="library" />

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Your recipe library</h1>
        <p className="text-sm text-neutral-500">Every recipe you add here is only visible to you.</p>
      </div>

      {error && (
        <p className="mb-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load your recipes: {error.message}. Did you run supabase/schema.sql yet?
        </p>
      )}

      <RecipeLibrary initialRecipes={recipes ?? []} />
    </div>
  );
}
