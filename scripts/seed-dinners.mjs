// One-time import of the Dinner tab from SpiceUpYourWeek_Recipes.xlsx.
// Run with: node scripts/seed-dinners.mjs
//
// "Eating Out" (D26) and "Dinner from Julian" (D27) are deliberately excluded —
// those are OffSlots, not recipes, and get their own table once the shuffler exists.

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

const splitList = (s) =>
  (s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const splitLines = (s) =>
  (s ?? "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

// Transcribed directly from the Dinner tab (rows D01-D25); D26/D27 excluded.
const rows = [
  { code: "D01", name: "Chicken & Grain Salad Bowl", protein: "Chicken thighs", ingredients: "Chicken thighs, rice or quinoa, spinach, salad greens", optional: "Avocado", minutes: 35, instructions: "1) Dry chicken thighs then put in bowl with olive oil, taco + rotisserie seasoning, bake at 425 for 35 minutes.\n2) Cook rice or quinoa while chicken bakes then chop vegetables\n3) In a bowl toss spinach, cucumbers, peppers, onions, walnuts, feta, apples, lemon juice, and olive oil then mix\n4) Either build as one bowl (chicken sliced over grains + greens) or plate the salad on the side.", notes: "Two serving styles from one recipe" },
  { code: "D02", name: "Chicken Thigh Red Sauce Pasta", protein: "Chicken thighs", ingredients: "Chicken thighs, pasta, red sauce, peppers, onions, garlic", optional: "", minutes: 35, instructions: "1) Boil water\n2) Sear seasoned chicken thighs or dry chicken thighs then put in bowl with olive oil, taco + rotisserie seasoning, bake at 425 for 35 minutes then throw in pasta\n2) Sauté peppers, onions, garlic in the same pan.\n3) Add red sauce and simmer; return chicken.\n4) Toss with cooked pasta.", notes: "" },
  { code: "D03", name: "Chicken, Rice & Brassicas", protein: "Chicken thighs", ingredients: "Chicken thighs, rice, broccoli, cauliflower", optional: "Avocado", minutes: 35, instructions: "1) Dry chicken thighs then put in bowl with olive oil, taco + rotisserie seasoning, bake at 425 for 35 minutes.\n2) Cook rice.\n3) Put seasoning garlic brocolli in oven for 12-15 mins\n4) Plate together.", notes: "Easy weeknight default" },
  { code: "D04", name: "Chicken, Potatoes & Broccoli", protein: "Chicken thighs", ingredients: "Chicken thighs, potatoes or sweet potatoes, broccoli", optional: "Avocado", minutes: 45, instructions: "1) Dry chicken thighs then put in bowl with olive oil, taco + rotisserie seasoning, bake at 425 for 35 minutes.\n2) Cube potatoes; toss in oil, salt, pepper, paprika; roast at 425°F for ~30 min. or in airfryer, put in with chicken\n3) Add broccoli for the last 12-15 min.", notes: "One-tray if timed right" },
  { code: "D05", name: "Chicken, Potatoes & Sautéed Peppers/Onions", protein: "Chicken thighs", ingredients: "Chicken thighs, potatoes or sweet potatoes, peppers, onions", optional: "", minutes: 45, instructions: "1) Dry chicken thighs then put in bowl with olive oil, taco + rotisserie seasoning, bake at 425 for 35 minutes.\n2) Cube potatoes; toss in oil, salt, pepper, paprika; roast at 425°F for ~30 min. or in airfryer, put in with chicken\n3) Sauté sliced peppers and onions until soft and browned; plate all together.", notes: "" },
  { code: "D06", name: "Chicken Pasta w/ Olive Oil & Cheese", protein: "Chicken thighs", ingredients: "Chicken thighs, pasta, olive oil or butter, cheese, broccoli, cauliflower", optional: "", minutes: 35, instructions: "1) Boil water and cook pasta; reserve some pasta water.\n2) Sear chicken thighs or dry chicken thighs then put in bowl with olive oil, taco + rotisserie seasoning, bake at 425 for 35 minutes.\n3) Toss pasta with olive oil or butter, cheese, and a splash of pasta water.\n4) Airfry or put in oven for 12-15 mins at 425 roasted broccoli and cauliflower", notes: "" },
  { code: "D07", name: "Teriyaki Chicken Bowl", protein: "Chicken thighs", ingredients: "Chicken thighs, rice, onions, peppers, broccoli, teriyaki sauce, avocado", optional: "", minutes: 35, instructions: "1) Cook rice.\n2) Sear diced chicken thighs; add teriyaki near the end and let it glaze.\n3) Sauté onions, peppers, broccoli.\n4) Build bowl: rice, chicken, veg, sliced avocado.", notes: "Same template as D12 and D17" },
  { code: "D08", name: "Chicken Sandwich", protein: "Chicken thighs", ingredients: "Chicken thighs, sourdough or burger bun, lettuce, tomato, onion", optional: "Sautéed vegetables", minutes: 30, instructions: "1) Season and sear chicken thighs until crisp-edged or dry chicken thighs then put in bowl with olive oil, taco + rotisserie seasoning, bake at 425 for 35 minutes.\n2) Toast the bun or sourdough.\n3) Build with lettuce, tomato, onion (and sautéed veg if using).", notes: "" },
  { code: "D09", name: "Chicken Thigh Tacos", protein: "Chicken thighs", ingredients: "Corn tortillas, chicken thighs, cheese, onions, peppers, sour cream", optional: "", minutes: 35, instructions: "1) Season diced chicken thighs with taco seasoning; cook through or dry chicken thighs then put in bowl with olive oil, taco + rotisserie seasoning, bake at 425 for 35 minutes.\n2) Sauté onions and peppers.\n3) Warm corn tortillas.\n4) Assemble with cheese and sour cream.", notes: "" },
  { code: "D10", name: "Greek Sheet Bake", protein: "Chicken thighs", ingredients: "Chicken thighs, onions, tomatoes, peppers, zucchini, garlic, olive oil, pasta, feta", optional: "", minutes: 50, instructions: "1) Cut veg into large chunks; toss with olive oil and seasoning on a sheet pan.\n2) Nestle in seasoned chicken thighs; bake at 425°F ~30-35 min.\n3) Boil water and cook pasta.\n4) Toss the roasted veg and pan juices with pasta; crumble feta over the top.", notes: "Best batch-cook option — scales well" },
  { code: "D11", name: "Burgers & Homemade Fries", protein: "Ground beef", ingredients: "Ground beef, burger buns, lettuce, tomato, onion, ketchup, potatoes", optional: "", minutes: 45, instructions: "1) Cut potatoes into fries, put into ice water, dry; toss in oil and seasoning; bake at 425°F ~30-35 min, flipping once or in airfryer.\n2) Form and season beef patties; sear hard on both sides.\n3) Toast buns and build.with veggies", notes: "" },
  { code: "D12", name: "Teriyaki Ground Beef Bowl", protein: "Ground beef", ingredients: "Ground beef, rice, peppers, onions, broccoli, teriyaki sauce", optional: "", minutes: 30, instructions: "1) Cook rice.\n2) Brown ground beef; drain excess fat.\n3) Add peppers, onions, broccoli; cook until tender - or in seperate pan to be quicker.\n4) Add teriyaki and toss; serve over rice.", notes: "Cheapest of the three teriyaki bowls" },
  { code: "D13", name: "Ground Beef, Potatoes & Peppers", protein: "Ground beef", ingredients: "Ground beef, potatoes or sweet potatoes, onions, peppers, avocado", optional: "", minutes: 40, instructions: "1) Roast cubed potatoes at 425°F ~30 min.\n2) Brown ground beef with seasoning.\n3) Sauté onions and peppers or in seperate pan to be quicker. combine and top with avocado.", notes: "" },
  { code: "D14", name: "Ground Beef Red Sauce Pasta", protein: "Ground beef", ingredients: "Ground beef, red sauce, peppers, onions, pasta", optional: "Jalapeños", minutes: 35, instructions: "1) Boil water and cook pasta.\n2) Brown ground beef; drain.\n3) Add peppers and onions; cook until soft.\n4) Add red sauce and simmer 10 min.\n5) Toss with cooked pasta.", notes: "" },
  { code: "D15", name: "Ground Beef Tacos", protein: "Ground beef", ingredients: "Corn tortillas, ground beef, cheese, onions, peppers, sour cream, avocado", optional: "", minutes: 30, instructions: "1) Brown ground beef with taco seasoning.\n2) Sauté onions and peppers.\n3) Warm tortillas; assemble with cheese, sour cream, avocado.", notes: "" },
  { code: "D16", name: "Steak & Mashed Potatoes", protein: "Steak", ingredients: "Steak, potatoes, butter, milk, broccoli", optional: "", minutes: 45, instructions: "1) Boil peeled potatoes until fork-tender; mash with butter, milk, salt.\n2) Season steak generously; sear hard, rest 5-10 min before slicing. - maybe reverse sear it at 250-275 for 15-25 mins\n3) Steam or roast broccoli.", notes: "Priciest protein — treat night" },
  { code: "D17", name: "Teriyaki Salmon Bowl", protein: "Salmon", ingredients: "Salmon, rice, onions, peppers, broccoli, teriyaki sauce, avocado", optional: "", minutes: 30, instructions: "1) Cook rice.\n2) Sear or bake salmon - 400 for 12-15 mins; glaze with teriyaki before and at the end.\n3) Sauté onions, peppers, broccoli.\n4) Build bowl and top with avocado.", notes: "" },
  { code: "D18", name: "Teriyaki Salmon & Greek Salad", protein: "Salmon", ingredients: "Salmon, spinach, cucumber, onion, pepper, feta, apple, walnut, lemon juice, olive oil, avocado, teriyaki", optional: "Quinoa", minutes: 30, instructions: "1) Sear or bake salmon; glaze with teriyaki. Cook quinoa if avaliable.\n2) Toss spinach, cucumber, onion, pepper, apple, walnuts, and feta.\n3) Dress with lemon juice and olive oil; add avocado; plate salmon on top.", notes: "Lightest dinner on the list" },
  { code: "D19", name: "Salmon, Potatoes & Brassicas", protein: "Salmon", ingredients: "Salmon, potatoes, broccoli, cauliflower", optional: "", minutes: 40, instructions: "1) Roast cubed potatoes at 425°F ~30 min.\n2) Add broccoli and cauliflower for the last 15 min.\n3) Bake or sear salmon (~12 min) and plate together.", notes: "" },
  { code: "D20", name: "Salmon Pasta", protein: "Salmon", ingredients: "Salmon, pasta, olive oil or butter, cheese, broccoli", optional: "", minutes: 30, instructions: "1) Cook pasta; reserve pasta water.\n2) Sear salmon; flake into large pieces.\n3) Toss pasta with olive oil or butter, cheese, and pasta water.\n4) Fold in salmon and broccoli gently.", notes: "" },
  { code: "D21", name: "White Fish, Potatoes & Brassicas", protein: "White fish", ingredients: "White fish, potatoes, broccoli, cauliflower", optional: "", minutes: 40, instructions: "1) Roast cubed potatoes at 425°F ~30 min.\n2) Add broccoli and cauliflower for the last 15 min.\n3) Pan-sear or bake white fish (~10 min) and plate.", notes: "Cheaper swap for D19" },
  { code: "D22", name: "White Fish, Rice & Brassicas", protein: "White fish", ingredients: "White fish, rice, broccoli, cauliflower", optional: "", minutes: 30, instructions: "1) Cook rice.\n2) Roast or steam broccoli and cauliflower.\n3) Pan-sear or bake white fish; plate together - season fish with 1/3 cup extra virgin olive oil, 1/4 cup fresh lemon juice, 2 minced garlic cloves, 1 tsp dried basil, 1/2 tsp dried thyme, 1/4 tsp salt, and 1/4 tsp black pepper.", notes: "" },
  { code: "D23", name: "Shrimp Scampi", protein: "Shrimp", ingredients: "Pasta, shrimp, white wine, cheese, lemon juice, parsley, broccoli", optional: "", minutes: 30, instructions: "1) Cook pasta; reserve pasta water. Put brocolli in oven.\n2) Sauté garlic in butter/oil; add shrimp and cook until just pink.\n3) Deglaze with white wine and lemon juice; reduce slightly.\n4) Toss with pasta, cheese, parsley; broccoli on the side.", notes: "" },
  { code: "D24", name: "Scallops & Pasta", protein: "Scallops", ingredients: "Scallops, pasta, olive oil or butter, broccoli", optional: "", minutes: 25, instructions: "1) Cook pasta.\n2) Pat scallops very dry; sear 90 sec per side in a hot pan and add some butter and seasonings — do not crowd.\n3) Toss pasta with olive oil or butter; plate scallops on top with broccoli on the side.", notes: "Fastest dinner, but priciest per serving" },
  { code: "D25", name: "Homemade Pizza", protein: "Cheese or Meat", ingredients: "Pizza dough, pizza sauce, mozzerella cheese, basil, olive oil", optional: "Any toppings", minutes: 25, instructions: "1) Prebake dough until a little crispy (3-4 mins at 425)\n2) Add sauce, cheese, and toppings\n3) Put back in oven at 425 for around 8 more minutes then check on it\n4) Take out, put olive oil on crust and basil on top, let cool", notes: "" },
];

const payload = rows.map((r) => ({
  code: r.code,
  name: r.name,
  tag: "Dinner",
  main_protein: r.protein,
  minutes: r.minutes,
  day_lock: "",
  max_per_week: 1,
  protein: [],
  carbs: [],
  vegetables: [],
  other: splitList(r.ingredients),
  optional: splitList(r.optional),
  instructions: splitLines(r.instructions),
  notes: r.notes ?? "",
}));

const { data, error } = await supabase.from("recipes").insert(payload).select("id, code, name");

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

console.log(`Inserted ${data.length} recipes.`);
