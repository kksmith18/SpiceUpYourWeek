// Second batch of dinner recipes, requested directly in chat (not from the
// spreadsheet — the spreadsheet's Dinner tab still ends at D25/Eating Out/Julian).
// Ingredients/instructions are a first-draft the user said they'd personalize.
// Run with: node scripts/seed-dinners-2.mjs

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

const rows = [
  {
    code: "D28",
    name: "Tuna Melt",
    protein: "Tuna",
    ingredients: "Canned tuna, mayonnaise, celery, onion, cheddar cheese, bread, butter",
    optional: "Pickles, hot sauce",
    minutes: 15,
    instructions:
      "1) Mix tuna, mayo, diced celery and onion, salt and pepper.\n2) Butter one side of each bread slice; spread tuna mix on the unbuttered side, top with cheese, close sandwich.\n3) Grill in a pan over medium heat until golden and cheese melts, flipping once.",
    notes: "Quick weeknight option",
  },
  {
    code: "D29",
    name: "Healthy Buffalo Chicken Dip",
    protein: "Chicken breast",
    ingredients:
      "Shredded chicken breast, plain Greek yogurt, light cream cheese, buffalo sauce, ranch seasoning, shredded cheddar, celery, carrots, tortilla chips or bread",
    optional: "Blue cheese crumbles",
    minutes: 30,
    instructions:
      "1) Cook and shred chicken breast (or use rotisserie chicken).\n2) Mix Greek yogurt, light cream cheese, buffalo sauce, and ranch seasoning until smooth.\n3) Fold in shredded chicken and half the cheddar.\n4) Spread in a baking dish, top with remaining cheddar, bake at 375°F for 20 minutes until bubbly.\n5) Serve with celery, carrots, and chips or bread.",
    notes: "Good as a lighter dinner with veggies on the side, not just an appetizer",
  },
  {
    code: "D30",
    name: "Caesar Wraps & Salad",
    protein: "Chicken breast",
    ingredients: "Romaine lettuce, grilled chicken breast, parmesan cheese, caesar dressing, croutons, tortillas",
    optional: "Anchovies, bacon bits",
    minutes: 20,
    instructions:
      "1) Grill or pan-sear seasoned chicken breast; slice.\n2) Chop romaine; toss with caesar dressing, parmesan, and croutons.\n3) For a salad, plate as-is; for a wrap, roll the dressed lettuce and chicken in a tortilla.",
    notes: "Two serving styles from one recipe, same as D01",
  },
  {
    code: "D31",
    name: "Homemade Ranch",
    protein: "",
    ingredients: "Mayonnaise, sour cream or buttermilk, garlic powder, onion powder, dill, chives, parsley, salt, pepper",
    optional: "",
    minutes: 5,
    instructions:
      "1) Whisk mayonnaise and sour cream (or buttermilk) together.\n2) Add garlic powder, onion powder, dill, chives, parsley, salt, and pepper; whisk until smooth.\n3) Chill at least 30 minutes before serving.",
    notes: "A condiment, not a full dinner on its own — pairs with the buffalo chicken dip or wraps above. Consider giving it a day_lock or low max/week if it keeps getting shuffled in as its own night.",
  },
  {
    code: "D32",
    name: "Tacos",
    protein: "Ground beef or chicken",
    ingredients: "Corn or flour tortillas, ground beef or chicken, taco seasoning, cheese, lettuce, tomato, onion, salsa, sour cream",
    optional: "Guacamole, jalapeños, lime",
    minutes: 25,
    instructions:
      "1) Brown ground beef or cook diced/shredded chicken with taco seasoning.\n2) Warm tortillas.\n3) Assemble with cheese, lettuce, tomato, onion, salsa, and sour cream.",
    notes: "Works for breakfast (with eggs), lunch, or dinner — swap the protein based on what's on hand",
  },
  {
    code: "D33",
    name: "Stuffed Shells",
    protein: "Ricotta cheese",
    ingredients: "Jumbo pasta shells, ricotta cheese, mozzarella cheese, parmesan cheese, egg, red sauce, garlic, basil",
    optional: "Ground beef or Italian sausage, spinach",
    minutes: 50,
    instructions:
      "1) Boil shells until just shy of al dente; drain and cool slightly.\n2) Mix ricotta, most of the mozzarella, parmesan, egg, garlic, and basil.\n3) Spread a layer of red sauce in a baking dish; stuff shells with the cheese mixture and arrange in the dish.\n4) Top with remaining sauce and mozzarella; bake at 375°F for 25-30 minutes until bubbly.",
    notes: "Great make-ahead / batch-cook option",
  },
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
