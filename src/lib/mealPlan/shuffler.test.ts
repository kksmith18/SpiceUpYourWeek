import { describe, it, expect } from "vitest";
import { generateSchedule, type ShufflerRecipe } from "./shuffler";
import { DAYS } from "./constants";

function recipe(id: string, mainProtein: string, opts: Partial<ShufflerRecipe> = {}): ShufflerRecipe {
  return { id, mainProtein, dayLock: "", maxPerWeek: 1, ...opts };
}

const ALL_DAYS = [...DAYS];

describe("generateSchedule", () => {
  it("is deterministic for a given seed", () => {
    const recipes = Array.from({ length: 10 }, (_, i) => recipe(`r${i}`, `protein${i % 3}`));
    const a = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "week-1" });
    const b = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "week-1" });
    expect(a).toEqual(b);
  });

  it("produces a different result for a different seed", () => {
    const recipes = Array.from({ length: 10 }, (_, i) => recipe(`r${i}`, `protein${i % 3}`));
    const a = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "week-1" });
    const b = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "week-2" });
    expect(a.assignments).not.toEqual(b.assignments);
  });

  it("fills all 7 days when enough unlocked recipes exist", () => {
    const recipes = Array.from({ length: 10 }, (_, i) => recipe(`r${i}`, `protein${i % 5}`));
    const result = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "week-1" });
    expect(result.assignments).toHaveLength(7);
    expect(result.assignments.every((a) => a.kind === "recipe")).toBe(true);
  });

  it("only fills the requested days when given a shorter week", () => {
    const recipes = Array.from({ length: 10 }, (_, i) => recipe(`r${i}`, `protein${i % 5}`));
    const result = generateSchedule({
      recipes,
      days: ["Mon", "Tue", "Wed", "Thu"],
      offSlotByDay: {},
      seed: "week-1",
    });
    expect(result.assignments.map((a) => a.day)).toEqual(["Mon", "Tue", "Wed", "Thu"]);
  });

  it("respects dayLock as a hard constraint", () => {
    const recipes = [
      recipe("fri-only", "steak", { dayLock: "Fri" }),
      ...Array.from({ length: 9 }, (_, i) => recipe(`r${i}`, `protein${i % 5}`)),
    ];
    const result = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "week-1" });
    for (const a of result.assignments) {
      if (a.kind === "recipe" && a.recipeId === "fri-only") {
        expect(a.day).toBe("Fri");
      }
    }
  });

  it("excludes a day-locked recipe entirely when its day isn't in the requested range", () => {
    const recipes = [
      recipe("fri-only", "steak", { dayLock: "Fri" }),
      ...Array.from({ length: 5 }, (_, i) => recipe(`r${i}`, `protein${i}`)),
    ];
    const result = generateSchedule({
      recipes,
      days: ["Mon", "Tue", "Wed", "Thu"],
      offSlotByDay: {},
      seed: "week-1",
    });
    expect(result.assignments.some((a) => a.kind === "recipe" && a.recipeId === "fri-only")).toBe(false);
  });

  it("never uses a recipe more times than maxPerWeek", () => {
    const recipes = [recipe("only-one", "chicken", { maxPerWeek: 1 })];
    const result = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "week-1" });
    const uses = result.assignments.filter((a) => a.kind === "recipe" && a.recipeId === "only-one");
    expect(uses.length).toBeLessThanOrEqual(1);
    // the other 6 days should be flagged unassigned since there's nothing else to place
    expect(result.assignments.filter((a) => a.kind === "unassigned")).toHaveLength(6);
  });

  it("marks off-slot days without consuming a recipe", () => {
    const recipes = Array.from({ length: 10 }, (_, i) => recipe(`r${i}`, `protein${i % 5}`));
    const result = generateSchedule({
      recipes,
      days: ALL_DAYS,
      offSlotByDay: { Wed: "eating-out", Sun: "dinner-from-julian" },
      seed: "week-1",
    });
    const wed = result.assignments.find((a) => a.day === "Wed");
    const sun = result.assignments.find((a) => a.day === "Sun");
    expect(wed).toEqual({ day: "Wed", kind: "offSlot", offSlotId: "eating-out" });
    expect(sun).toEqual({ day: "Sun", kind: "offSlot", offSlotId: "dinner-from-julian" });
  });

  it("avoids the same main protein on back-to-back days when an alternative exists", () => {
    // Heavily chicken-weighted pool (mirrors the real library) plus a few others.
    const recipes = [
      ...Array.from({ length: 8 }, (_, i) => recipe(`chicken${i}`, "Chicken thighs")),
      recipe("beef", "Ground beef"),
      recipe("salmon", "Salmon"),
    ];
    const result = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "variety-check" });
    const proteinById = new Map(recipes.map((r) => [r.id, r.mainProtein]));
    let backToBack = 0;
    let prev: string | null = null;
    for (const a of result.assignments) {
      if (a.kind !== "recipe") {
        prev = null;
        continue;
      }
      const protein = proteinById.get(a.recipeId)!;
      if (prev && prev === protein) backToBack++;
      prev = protein;
    }
    // With only 2 non-chicken recipes for 7 slots, some repeats are unavoidable,
    // but it shouldn't degenerate into "chicken every single day".
    expect(backToBack).toBeLessThan(5);
  });

  it("covers exactly the requested days, in order", () => {
    const recipes = Array.from({ length: 10 }, (_, i) => recipe(`r${i}`, `protein${i % 5}`));
    const result = generateSchedule({ recipes, days: ALL_DAYS, offSlotByDay: {}, seed: "week-1" });
    expect(result.assignments.map((a) => a.day)).toEqual(ALL_DAYS);
  });
});
