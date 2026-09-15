// One-time data fix, requested in chat right after seed-dinners-2.mjs ran:
// - "Homemade Ranch" (D31) shouldn't be its own schedulable dinner — it's a
//   condiment. Folded into the optional add-ins of every chicken dish instead,
//   then the standalone recipe is deleted.
// - Tacos (D32) gets meal-appropriate variants: eggs/cheese/veggies for
//   breakfast, chicken-or-beef/cheese/veggies/sour cream for lunch/dinner.
// Run with: node scripts/fix-ranch-and-tacos.mjs

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Dishes where chicken is the actual protein (excludes D32 Tacos, which is
// "ground beef or chicken" and gets its own update below).
const CHICKEN_DISH_CODES = ["D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D29", "D30"];

async function main() {
  const { data: chickenRows, error: fetchError } = await supabase
    .from("recipes")
    .select("id, code, optional")
    .in("code", CHICKEN_DISH_CODES);
  if (fetchError) throw new Error(fetchError.message);

  for (const row of chickenRows) {
    if (row.optional.includes("Homemade ranch")) continue;
    const optional = [...row.optional, "Homemade ranch"];
    const { error } = await supabase.from("recipes").update({ optional }).eq("id", row.id);
    if (error) throw new Error(`${row.code}: ${error.message}`);
    console.log(`Updated ${row.code} optional -> ${JSON.stringify(optional)}`);
  }

  const { error: deleteError, count } = await supabase
    .from("recipes")
    .delete({ count: "exact" })
    .eq("code", "D31");
  if (deleteError) throw new Error(deleteError.message);
  console.log(`Deleted D31 (Homemade Ranch) rows: ${count}`);

  const { error: tacoError } = await supabase
    .from("recipes")
    .update({
      main_protein: "Eggs, chicken, or ground beef",
      other: [
        "Corn or flour tortillas",
        "Eggs",
        "Ground beef or chicken",
        "Taco seasoning",
        "Cheese",
        "Lettuce",
        "Tomato",
        "Onion or bell peppers",
        "Salsa",
        "Sour cream",
      ],
      optional: ["Guacamole", "Jalapeños", "Lime", "Spinach"],
      instructions: [
        "1) Breakfast version: scramble eggs with a splash of milk; cook until just set, then fold in shredded cheese and diced veggies (peppers, onions, spinach).",
        "2) Lunch/dinner version: brown ground beef or cook diced/shredded chicken with taco seasoning; sauté any veggies you're adding.",
        "3) Warm tortillas.",
        "4) Assemble with cheese, lettuce or veggies, and salsa; add sour cream for the lunch/dinner version.",
      ],
      notes:
        "Swap fillings by meal — eggs + cheese + veggies for breakfast, chicken or beef + cheese + veggies + sour cream for lunch/dinner.",
    })
    .eq("code", "D32");
  if (tacoError) throw new Error(tacoError.message);
  console.log("Updated D32 (Tacos) with breakfast vs. lunch/dinner variants.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
