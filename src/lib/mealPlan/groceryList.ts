// Pure aggregation over already-scheduled recipes. No quantities exist in the
// source data (the xlsx ingredient lists are plain names, not "1 lb / 2 cups"),
// so this produces a deduped checklist of what's needed, not summed amounts.
export type GroceryRecipeInput = {
  name: string;
  ingredients: string[];
};

export type GroceryItem = {
  name: string;
  /** How many of this week's scheduled dinners call for it. */
  recipeCount: number;
  usedIn: string[];
};

export type GroceryList = {
  items: GroceryItem[];
  standingItems: string[];
};

export function buildGroceryList(input: {
  recipes: GroceryRecipeInput[];
  standingItems: string[];
  pantryIgnore: string[];
}): GroceryList {
  const ignoreSet = new Set(input.pantryIgnore.map((s) => s.trim().toLowerCase()));
  const byKey = new Map<string, GroceryItem>();

  for (const recipe of input.recipes) {
    for (const ingredient of recipe.ingredients) {
      const name = ingredient.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (ignoreSet.has(key)) continue;

      const existing = byKey.get(key);
      if (existing) {
        existing.recipeCount += 1;
        existing.usedIn.push(recipe.name);
      } else {
        byKey.set(key, { name, recipeCount: 1, usedIn: [recipe.name] });
      }
    }
  }

  const items = Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name));

  return { items, standingItems: input.standingItems };
}
