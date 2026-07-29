"use client";

import { useEffect, useMemo, useState } from "react";
import { generateSchedule, type ShufflerRecipe } from "@/lib/mealPlan/shuffler";
import { buildGroceryList } from "@/lib/mealPlan/groceryList";
import { OFF_SLOTS, STANDING_ITEMS, DAYS, type Day } from "@/lib/mealPlan/constants";

type DbRecipe = {
  id: string;
  code: string;
  name: string;
  main_protein: string;
  minutes: number;
  day_lock: string;
  max_per_week: number;
  other: string[];
  optional: string[];
};

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatShortDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

type StoredState = {
  offSlotByDay: Partial<Record<Day, string>>;
  seedCounter: number;
};

export function ScheduleView({
  recipes,
  pantryIgnore,
}: {
  recipes: DbRecipe[];
  pantryIgnore: string[];
}) {
  const weekStart = useMemo(() => getWeekStart(new Date()), []);
  const weekKey = formatDateKey(weekStart);
  const storageKey = `spiceup:week:${weekKey}`;

  const [offSlotByDay, setOffSlotByDay] = useState<Partial<Record<Day, string>>>({});
  const [seedCounter, setSeedCounter] = useState(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed: StoredState = JSON.parse(raw);
        setOffSlotByDay(parsed.offSlotByDay ?? {});
        setSeedCounter(parsed.seedCounter ?? 1);
      } catch {
        // ignore malformed local storage
      }
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    const state: StoredState = { offSlotByDay, seedCounter };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [loaded, storageKey, offSlotByDay, seedCounter]);

  const dayDates = useMemo(() => {
    const map = new Map<Day, Date>();
    DAYS.forEach((day, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      map.set(day, d);
    });
    return map;
  }, [weekStart]);

  const shufflerRecipes: ShufflerRecipe[] = useMemo(
    () =>
      recipes.map((r) => ({
        id: r.id,
        mainProtein: r.main_protein,
        dayLock: r.day_lock,
        maxPerWeek: r.max_per_week,
      })),
    [recipes]
  );

  const result = useMemo(
    () =>
      generateSchedule({
        recipes: shufflerRecipes,
        offSlotByDay,
        seed: `${weekKey}:${seedCounter}`,
      }),
    [shufflerRecipes, offSlotByDay, weekKey, seedCounter]
  );

  const recipeById = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  const grocery = useMemo(() => {
    const scheduledRecipes = result.assignments
      .filter((a): a is Extract<typeof a, { kind: "recipe" }> => a.kind === "recipe")
      .map((a) => recipeById.get(a.recipeId))
      .filter((r): r is DbRecipe => Boolean(r));

    return buildGroceryList({
      recipes: scheduledRecipes.map((r) => ({ name: r.name, ingredients: r.other })),
      standingItems: STANDING_ITEMS,
      pantryIgnore,
    });
  }, [result, recipeById, pantryIgnore]);

  const optionalAddIns = useMemo(() => {
    const scheduledRecipes = result.assignments
      .filter((a): a is Extract<typeof a, { kind: "recipe" }> => a.kind === "recipe")
      .map((a) => recipeById.get(a.recipeId))
      .filter((r): r is DbRecipe => Boolean(r && r.optional.length > 0));

    const seen = new Set<string>();
    const items: { name: string; recipe: string }[] = [];
    for (const r of scheduledRecipes) {
      for (const opt of r.optional) {
        const key = opt.trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        items.push({ name: opt.trim(), recipe: r.name });
      }
    }
    return items;
  }, [result, recipeById]);

  function toggleChecked(name: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Week of {formatShortDate(weekStart)}
          </h2>
          <button
            onClick={() => setSeedCounter((c) => c + 1)}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Reshuffle
          </button>
        </div>

        {result.warnings.length > 0 && (
          <div className="mb-4 flex flex-col gap-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {result.warnings.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
        )}

        <div className="flex flex-col divide-y divide-neutral-100">
          {result.assignments.map((a) => {
            const date = dayDates.get(a.day)!;
            const recipe = a.kind === "recipe" ? recipeById.get(a.recipeId) : undefined;
            return (
              <div key={a.day} className="flex items-center gap-3 py-3">
                <div className="w-16 shrink-0 text-sm font-medium text-neutral-500">
                  {a.day} <span className="text-neutral-400">{formatShortDate(date)}</span>
                </div>

                <div className="flex-1">
                  {a.kind === "offSlot" && (
                    <span className="text-sm italic text-neutral-500">
                      {OFF_SLOTS.find((o) => o.id === a.offSlotId)?.name ?? a.offSlotId}
                    </span>
                  )}
                  {a.kind === "unassigned" && (
                    <span className="text-sm italic text-amber-700">No eligible recipe</span>
                  )}
                  {a.kind === "recipe" && recipe && (
                    <span className="text-sm text-neutral-900">
                      {recipe.name}
                      <span className="ml-2 font-mono text-xs text-neutral-400">
                        {recipe.minutes} min · {recipe.main_protein}
                      </span>
                    </span>
                  )}
                </div>

                <select
                  value={offSlotByDay[a.day] ?? ""}
                  onChange={(e) =>
                    setOffSlotByDay((prev) => {
                      const next = { ...prev };
                      if (e.target.value) next[a.day] = e.target.value;
                      else delete next[a.day];
                      return next;
                    })
                  }
                  className="shrink-0 rounded-md border border-neutral-300 px-2 py-1 text-xs"
                >
                  <option value="">Cook</option>
                  {OFF_SLOTS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-neutral-900">Grocery list</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Ingredients for this week&apos;s dinners, plus your standing breakfast/lunch items. No
          quantities — your recipes don&apos;t track amounts, so check off what you need.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              For this week&apos;s dinners
            </h3>
            {grocery.items.length === 0 ? (
              <p className="text-sm italic text-neutral-400">Nothing scheduled yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {grocery.items.map((item) => (
                  <li key={item.name} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked.has(item.name)}
                      onChange={() => toggleChecked(item.name)}
                      className="h-4 w-4 rounded border-neutral-300"
                    />
                    <span className={checked.has(item.name) ? "text-neutral-400 line-through" : "text-neutral-800"}>
                      {item.name}
                    </span>
                    {item.recipeCount > 1 && (
                      <span className="text-xs text-neutral-400">×{item.recipeCount}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Standing weekly items
            </h3>
            <ul className="flex flex-col gap-1">
              {grocery.standingItems.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked.has(item)}
                    onChange={() => toggleChecked(item)}
                    className="h-4 w-4 rounded border-neutral-300"
                  />
                  <span className={checked.has(item) ? "text-neutral-400 line-through" : "text-neutral-800"}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {optionalAddIns.length > 0 && (
          <div className="mt-6 border-t border-dashed border-neutral-200 pt-4">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
              Optional add-ins (only if you want them)
            </h3>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {optionalAddIns.map((item) => (
                <li key={item.name} className="text-sm text-neutral-500">
                  {item.name} <span className="text-xs text-neutral-400">({item.recipe})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
