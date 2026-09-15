"use client";

import { useEffect, useMemo, useState } from "react";
import { ScheduleView } from "./ScheduleView";
import { WorkoutView } from "./WorkoutView";

type DbRecipe = Parameters<typeof ScheduleView>[0]["recipes"][number];
type DbWorkout = Parameters<typeof WorkoutView>[0]["workouts"][number];

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

export function WeekPlanner({
  recipes,
  pantryIgnore,
  workouts,
}: {
  recipes: DbRecipe[];
  pantryIgnore: string[];
  workouts: DbWorkout[];
}) {
  const weekStart = useMemo(() => getWeekStart(new Date()), []);
  const weekKey = formatDateKey(weekStart);
  const epochStorageKey = `spiceup:week:${weekKey}:epoch`;

  const [epoch, setEpoch] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(epochStorageKey);
    if (raw) {
      const n = Number(raw);
      if (!Number.isNaN(n)) setEpoch(n);
    }
    setLoaded(true);
  }, [epochStorageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(epochStorageKey, String(epoch));
  }, [loaded, epochStorageKey, epoch]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4 text-white shadow-sm">
        <div>
          <h2 className="text-lg font-semibold">Week of {formatShortDate(weekStart)}</h2>
          <p className="text-sm text-neutral-300">One click reshuffles dinners and workouts together.</p>
        </div>
        <button
          onClick={() => setEpoch((e) => e + 1)}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
        >
          Shuffle week
        </button>
      </div>

      <ScheduleView recipes={recipes} pantryIgnore={pantryIgnore} sharedEpoch={epoch} />
      <WorkoutView workouts={workouts} sharedEpoch={epoch} />
    </div>
  );
}
