"use client";

import { useEffect, useMemo, useState } from "react";
import { generateSchedule, type ShufflerRecipe } from "@/lib/mealPlan/shuffler";
import { WORKOUT_OFF_SLOTS, DAYS, DEFAULT_ACTIVE_WORKOUT_DAYS, type Day } from "@/lib/mealPlan/constants";

type DbWorkout = {
  id: string;
  name: string;
  tag: string;
  minutes: number;
  day_lock: string;
  max_per_week: number;
  exercises: string[];
};

const ACTIVE_DAYS_STORAGE_KEY = "spiceup:activeWorkoutDays";

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

type StoredWeekState = {
  offSlotByDay: Partial<Record<Day, string>>;
  seedCounter: number;
};

export function WorkoutView({
  workouts,
  sharedEpoch,
}: {
  workouts: DbWorkout[];
  /** Bumped by the page-level "Shuffle week" button so dinners and workouts reshuffle together. */
  sharedEpoch: number;
}) {
  const weekStart = useMemo(() => getWeekStart(new Date()), []);
  const weekKey = formatDateKey(weekStart);
  const storageKey = `spiceup:workoutWeek:${weekKey}`;

  const [offSlotByDay, setOffSlotByDay] = useState<Partial<Record<Day, string>>>({});
  const [seedCounter, setSeedCounter] = useState(1);
  const [activeDaySet, setActiveDaySet] = useState<Set<Day>>(new Set(DEFAULT_ACTIVE_WORKOUT_DAYS));
  const [expandedDay, setExpandedDay] = useState<Day | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed: StoredWeekState = JSON.parse(raw);
        setOffSlotByDay(parsed.offSlotByDay ?? {});
        setSeedCounter(parsed.seedCounter ?? 1);
      } catch {
        // ignore malformed local storage
      }
    }

    const rawDays = window.localStorage.getItem(ACTIVE_DAYS_STORAGE_KEY);
    if (rawDays) {
      try {
        const parsedDays: Day[] = JSON.parse(rawDays);
        setActiveDaySet(new Set(parsedDays));
      } catch {
        // ignore malformed local storage
      }
    }

    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    const state: StoredWeekState = { offSlotByDay, seedCounter };
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [loaded, storageKey, offSlotByDay, seedCounter]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(ACTIVE_DAYS_STORAGE_KEY, JSON.stringify([...activeDaySet]));
  }, [loaded, activeDaySet]);

  const activeDays = useMemo(() => DAYS.filter((d) => activeDaySet.has(d)), [activeDaySet]);

  const dayDates = useMemo(() => {
    const map = new Map<Day, Date>();
    DAYS.forEach((day, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      map.set(day, d);
    });
    return map;
  }, [weekStart]);

  const shufflerWorkouts: ShufflerRecipe[] = useMemo(
    () =>
      workouts.map((w) => ({
        id: w.id,
        mainProtein: w.tag,
        dayLock: w.day_lock,
        maxPerWeek: w.max_per_week,
      })),
    [workouts]
  );

  const result = useMemo(
    () =>
      generateSchedule({
        recipes: shufflerWorkouts,
        days: activeDays,
        offSlotByDay,
        seed: `workout:${weekKey}:${sharedEpoch}:${seedCounter}`,
      }),
    [shufflerWorkouts, activeDays, offSlotByDay, weekKey, sharedEpoch, seedCounter]
  );

  const workoutById = useMemo(() => new Map(workouts.map((w) => [w.id, w])), [workouts]);

  function toggleActiveDay(day: Day) {
    setActiveDaySet((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Workouts</h2>
        <button
          onClick={() => setSeedCounter((c) => c + 1)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:border-neutral-500"
        >
          Reshuffle workouts only
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
          Training days
        </span>
        {DAYS.map((day) => {
          const active = activeDaySet.has(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggleActiveDay(day)}
              className={
                active
                  ? "rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white"
                  : "rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-500 hover:border-neutral-500"
              }
            >
              {day}
            </button>
          );
        })}
      </div>

      {result.warnings.length > 0 && (
        <div className="mb-4 flex flex-col gap-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {result.warnings.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>
      )}

      {activeDays.length === 0 && (
        <p className="py-3 text-sm italic text-neutral-400">
          No training days selected — pick at least one day above.
        </p>
      )}

      <div className="flex flex-col divide-y divide-neutral-100">
        {result.assignments.map((a) => {
          const date = dayDates.get(a.day)!;
          const workout = a.kind === "recipe" ? workoutById.get(a.recipeId) : undefined;
          const expanded = expandedDay === a.day && Boolean(workout);
          return (
            <div key={a.day} className="py-3">
              <div className="flex items-center gap-3">
                <div className="w-16 shrink-0 text-sm font-medium text-neutral-500">
                  {a.day} <span className="text-neutral-400">{formatShortDate(date)}</span>
                </div>

                <div className="flex-1">
                  {a.kind === "offSlot" && (
                    <span className="text-sm italic text-neutral-500">
                      {WORKOUT_OFF_SLOTS.find((o) => o.id === a.offSlotId)?.name ?? a.offSlotId}
                    </span>
                  )}
                  {a.kind === "unassigned" && (
                    <span className="text-sm italic text-amber-700">No eligible workout</span>
                  )}
                  {a.kind === "recipe" && workout && (
                    <button
                      type="button"
                      onClick={() => setExpandedDay(expanded ? null : a.day)}
                      className="text-left text-sm text-neutral-900 underline decoration-neutral-300 decoration-dotted underline-offset-4 hover:decoration-neutral-600"
                    >
                      {workout.name}
                      <span className="ml-2 font-mono text-xs text-neutral-400">
                        {workout.minutes} min · {workout.tag}
                      </span>
                    </button>
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
                  <option value="">Train</option>
                  {WORKOUT_OFF_SLOTS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              {expanded && workout && (
                <div className="mt-3 ml-[76px] rounded-md border border-neutral-100 bg-neutral-50 p-3 text-sm">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Exercises
                  </div>
                  {workout.exercises.length ? (
                    <ul className="list-disc pl-4 text-neutral-700">
                      {workout.exercises.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="italic text-neutral-400">None added</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
