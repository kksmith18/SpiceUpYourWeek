"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWorkout, upsertWorkout } from "./actions";
import { joinLines, linesToArray } from "@/lib/textLines";

export type Workout = {
  id: string;
  name: string;
  tag: string;
  minutes: number;
  day_lock: string;
  max_per_week: number;
  exercises: string[];
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type FormState = {
  id?: string;
  name: string;
  tag: string;
  minutes: string;
  dayLock: string;
  maxPerWeek: string;
  exercises: string;
};

const emptyForm: FormState = {
  id: undefined,
  name: "",
  tag: "",
  minutes: "45",
  dayLock: "",
  maxPerWeek: "1",
  exercises: "",
};

function textField(
  label: string,
  value: string,
  onChange: (v: string) => void,
  props: React.InputHTMLAttributes<HTMLInputElement> = {}
) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
        {...props}
      />
    </label>
  );
}

function textArea(
  label: string,
  value: string,
  onChange: (v: string) => void,
  placeholder = ""
) {
  return (
    <label className="flex flex-1 min-w-[200px] flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </label>
  );
}

export function WorkoutLibrary({ initialWorkouts }: { initialWorkouts: Workout[] }) {
  const router = useRouter();
  const workouts = initialWorkouts;
  const [form, setForm] = useState<FormState>(emptyForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await upsertWorkout({
        id: form.id,
        name: form.name.trim(),
        tag: form.tag.trim(),
        minutes: Number(form.minutes) || 0,
        dayLock: form.dayLock,
        maxPerWeek: Number(form.maxPerWeek) || 1,
        exercises: linesToArray(form.exercises),
      });
      setForm(emptyForm);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(w: Workout) {
    setForm({
      id: w.id,
      name: w.name,
      tag: w.tag,
      minutes: String(w.minutes),
      dayLock: w.day_lock,
      maxPerWeek: String(w.max_per_week),
      exercises: joinLines(w.exercises),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (form.id === id) setForm(emptyForm);
    await deleteWorkout(id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
      >
        {form.id && (
          <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Editing <strong>{form.name}</strong>
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="ml-auto text-amber-700 underline"
            >
              cancel
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {textField("Name", form.name, (v) => set("name", v), { placeholder: "Leg day", required: true })}
          {textField("Tag", form.tag, (v) => set("tag", v), { placeholder: "Legs" })}
          {textField("Min", form.minutes, (v) => set("minutes", v), { type: "number", min: 0 })}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Day lock</span>
            <select
              value={form.dayLock}
              onChange={(e) => set("dayLock", e.target.value)}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">Any day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          {textField("Max/wk", form.maxPerWeek, (v) => set("maxPerWeek", v), { type: "number", min: 1 })}
        </div>

        {textArea("Exercises — one per line, \"Name — sets x reps\"", form.exercises, (v) => set("exercises", v), "Barbell squat — 4x8")}

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : form.id ? "Save changes" : "Add workout"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {workouts.length === 0 && (
          <p className="text-sm italic text-neutral-500">No workouts yet — add your first one above.</p>
        )}
        {workouts.map((w) => {
          const expanded = expandedId === w.id;
          return (
            <div key={w.id} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setExpandedId(expanded ? null : w.id)}
                  className="flex-1 text-left"
                >
                  <span className="font-medium text-neutral-900">{w.name}</span>
                  <span className="block font-mono text-xs text-neutral-500">
                    {w.minutes} min
                    {w.tag && ` · ${w.tag}`}
                    {w.day_lock && ` · ${w.day_lock} only`} · max {w.max_per_week}/wk
                  </span>
                </button>
                <button
                  onClick={() => startEdit(w)}
                  className="shrink-0 rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:border-neutral-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="shrink-0 rounded px-2 py-1 text-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
                  aria-label={`Remove ${w.name}`}
                >
                  ×
                </button>
              </div>

              {expanded && (
                <div className="mt-3 border-t border-dashed border-neutral-200 pt-3 text-sm">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Exercises
                  </div>
                  {w.exercises.length ? (
                    <ul className="list-disc pl-4 text-neutral-700">
                      {w.exercises.map((line, i) => (
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
