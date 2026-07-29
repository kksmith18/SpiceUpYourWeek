import { createRng } from "./rng";
import { DAYS, type Day } from "./constants";

// Pure by design: no UI, no DB, no Date.now(). Same input + seed always
// produces the same week, so a shuffle can be reproduced, shared, or undone.
export type ShufflerRecipe = {
  id: string;
  mainProtein: string;
  /** "" means any day; otherwise the recipe can only land on this day. */
  dayLock: string;
  maxPerWeek: number;
};

export type ScheduleAssignment =
  | { day: Day; kind: "recipe"; recipeId: string }
  | { day: Day; kind: "offSlot"; offSlotId: string }
  | { day: Day; kind: "unassigned" };

export type GenerateScheduleInput = {
  recipes: ShufflerRecipe[];
  /** Days already spoken for by an OffSlot (eating out, etc.) — the shuffler skips these. */
  offSlotByDay: Partial<Record<Day, string>>;
  seed: string;
};

export type GenerateScheduleResult = {
  assignments: ScheduleAssignment[];
  warnings: string[];
};

export function generateSchedule(input: GenerateScheduleInput): GenerateScheduleResult {
  const rng = createRng(input.seed);
  const usageCount = new Map<string, number>();
  const assignments: ScheduleAssignment[] = [];
  const warnings: string[] = [];
  let prevProtein: string | null = null;

  for (const day of DAYS) {
    const offSlotId = input.offSlotByDay[day];
    if (offSlotId) {
      assignments.push({ day, kind: "offSlot", offSlotId });
      prevProtein = null; // an off night breaks any back-to-back protein streak
      continue;
    }

    const eligible: ShufflerRecipe[] = input.recipes.filter(
      (r) =>
        (r.dayLock === "" || r.dayLock === day) &&
        (usageCount.get(r.id) ?? 0) < Math.max(1, r.maxPerWeek)
    );

    if (eligible.length === 0) {
      warnings.push(`No eligible recipe left for ${day} — add more recipes or raise max/week.`);
      assignments.push({ day, kind: "unassigned" });
      prevProtein = null;
      continue;
    }

    // Soft constraint: avoid repeating yesterday's main protein. Only fall
    // back to allowing it when literally nothing else is eligible.
    const varied: ShufflerRecipe[] = prevProtein
      ? eligible.filter((r) => r.mainProtein !== prevProtein)
      : eligible;
    const pool: ShufflerRecipe[] = varied.length > 0 ? varied : eligible;
    if (varied.length === 0 && prevProtein) {
      warnings.push(`Couldn't avoid repeating ${prevProtein} on ${day} — not enough other proteins left this week.`);
    }

    const picked: ShufflerRecipe = pool[Math.floor(rng() * pool.length)];
    usageCount.set(picked.id, (usageCount.get(picked.id) ?? 0) + 1);
    assignments.push({ day, kind: "recipe", recipeId: picked.id });
    prevProtein = picked.mainProtein;
  }

  return { assignments, warnings };
}
