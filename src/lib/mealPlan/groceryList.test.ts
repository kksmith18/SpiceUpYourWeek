import { describe, it, expect } from "vitest";
import { buildGroceryList } from "./groceryList";

describe("buildGroceryList", () => {
  it("dedupes an ingredient shared across recipes and counts its uses", () => {
    const result = buildGroceryList({
      recipes: [
        { name: "Chicken Tacos", ingredients: ["Chicken thighs", "Onions", "Peppers"] },
        { name: "Chicken Bowl", ingredients: ["Chicken thighs", "Rice"] },
      ],
      standingItems: [],
      pantryIgnore: [],
    });
    const chicken = result.items.find((i) => i.name === "Chicken thighs");
    expect(chicken?.recipeCount).toBe(2);
    expect(chicken?.usedIn).toEqual(["Chicken Tacos", "Chicken Bowl"]);
    expect(result.items).toHaveLength(4);
  });

  it("matches ingredients case-insensitively when deduping", () => {
    const result = buildGroceryList({
      recipes: [
        { name: "A", ingredients: ["broccoli"] },
        { name: "B", ingredients: ["Broccoli"] },
      ],
      standingItems: [],
      pantryIgnore: [],
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].recipeCount).toBe(2);
  });

  it("excludes items on the pantry-ignore list", () => {
    const result = buildGroceryList({
      recipes: [{ name: "A", ingredients: ["Chicken thighs", "Olive oil", "Salt"] }],
      standingItems: [],
      pantryIgnore: ["olive oil", "Salt"],
    });
    expect(result.items.map((i) => i.name)).toEqual(["Chicken thighs"]);
  });

  it("always includes standing items regardless of what's scheduled", () => {
    const result = buildGroceryList({
      recipes: [],
      standingItems: ["Oats", "Milk"],
      pantryIgnore: [],
    });
    expect(result.items).toHaveLength(0);
    expect(result.standingItems).toEqual(["Oats", "Milk"]);
  });

  it("sorts items alphabetically for a stable, scannable list", () => {
    const result = buildGroceryList({
      recipes: [{ name: "A", ingredients: ["Rice", "Avocado", "Broccoli"] }],
      standingItems: [],
      pantryIgnore: [],
    });
    expect(result.items.map((i) => i.name)).toEqual(["Avocado", "Broccoli", "Rice"]);
  });
});
