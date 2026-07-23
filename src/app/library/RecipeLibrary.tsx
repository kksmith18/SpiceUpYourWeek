"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRecipe, upsertRecipe } from "./actions";
import { joinLines, linesToArray } from "@/lib/textLines";

export type Recipe = {
  id: string;
  code: string;
  name: string;
  tag: string;
  main_protein: string;
  minutes: number;
  day_lock: string;
  max_per_week: number;
  protein: string[];
  carbs: string[];
  vegetables: string[];
  other: string[];
  optional: string[];
  instructions: string[];
  notes: string;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TAGS = ["Breakfast", "Lunch", "Dinner", "Snack"];

type FormState = {
  id?: string;
  code: string;
  name: string;
  tag: string;
  mainProtein: string;
  minutes: string;
  dayLock: string;
  maxPerWeek: string;
  protein: string;
  carbs: string;
  vegetables: string;
  other: string;
  optional: string;
  instructions: string;
  notes: string;
};

const emptyForm: FormState = {
  id: undefined,
  code: "",
  name: "",
  tag: "Dinner",
  mainProtein: "",
  minutes: "25",
  dayLock: "",
  maxPerWeek: "1",
  protein: "",
  carbs: "",
  vegetables: "",
  other: "",
  optional: "",
  instructions: "",
  notes: "",
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
        rows={3}
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </label>
  );
}

export function RecipeLibrary({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const router = useRouter();
  const recipes = initialRecipes;
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
      await upsertRecipe({
        id: form.id,
        code: form.code.trim(),
        name: form.name.trim(),
        tag: form.tag,
        mainProtein: form.mainProtein.trim(),
        minutes: Number(form.minutes) || 0,
        dayLock: form.dayLock,
        maxPerWeek: Number(form.maxPerWeek) || 1,
        protein: linesToArray(form.protein),
        carbs: linesToArray(form.carbs),
        vegetables: linesToArray(form.vegetables),
        other: linesToArray(form.other),
        optional: linesToArray(form.optional),
        instructions: linesToArray(form.instructions),
        notes: form.notes.trim(),
      });
      setForm(emptyForm);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(r: Recipe) {
    setForm({
      id: r.id,
      code: r.code,
      name: r.name,
      tag: r.tag,
      mainProtein: r.main_protein,
      minutes: String(r.minutes),
      dayLock: r.day_lock,
      maxPerWeek: String(r.max_per_week),
      protein: joinLines(r.protein),
      carbs: joinLines(r.carbs),
      vegetables: joinLines(r.vegetables),
      other: joinLines(r.other),
      optional: joinLines(r.optional),
      instructions: joinLines(r.instructions),
      notes: r.notes,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (form.id === id) setForm(emptyForm);
    await deleteRecipe(id);
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
          {textField("Name", form.name, (v) => set("name", v), { placeholder: "Turkey Chili", required: true })}
          {textField("Min", form.minutes, (v) => set("minutes", v), { type: "number", min: 0 })}
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Type</span>
            <select
              value={form.tag}
              onChange={(e) => set("tag", e.target.value)}
              className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            >
              {MEAL_TAGS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
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

        <div className="flex flex-wrap gap-3">
          {textField("Main protein/base", form.mainProtein, (v) => set("mainProtein", v), {
            placeholder: "Chicken thighs",
          })}
          {textField("Notes", form.notes, (v) => set("notes", v), { placeholder: "Prep the night before" })}
          {textField("Code", form.code, (v) => set("code", v), { placeholder: "D01" })}
        </div>

        <div className="flex flex-wrap gap-3">
          {textArea("Protein — one per line, \"Name — qty\"", form.protein, (v) => set("protein", v), "Chicken breast — 1 lb")}
          {textArea("Carbs — one per line", form.carbs, (v) => set("carbs", v), "Rice — 1 cup")}
          {textArea("Vegetables — one per line", form.vegetables, (v) => set("vegetables", v), "Broccoli — 2 cups")}
          {textArea("Other (dairy, condiments, spices)", form.other, (v) => set("other", v), "Olive oil — 1 tbsp")}
          {textArea("Optional add-ins", form.optional, (v) => set("optional", v), "Avocado — 1/2, if on hand")}
        </div>

        {textArea("Instructions (one step per line)", form.instructions, (v) => set("instructions", v))}

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : form.id ? "Save changes" : "Add recipe"}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {recipes.length === 0 && (
          <p className="text-sm italic text-neutral-500">No recipes yet — add your first one above.</p>
        )}
        {recipes.map((r) => {
          const expanded = expandedId === r.id;
          return (
            <div key={r.id} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setExpandedId(expanded ? null : r.id)}
                  className="flex-1 text-left"
                >
                  <span className="font-medium text-neutral-900">
                    {r.name}
                    {r.code && <span className="text-neutral-400"> ({r.code})</span>}
                  </span>
                  <span className="block font-mono text-xs text-neutral-500">
                    {r.minutes} min · {r.tag}
                    {r.main_protein && ` · ${r.main_protein}`}
                    {r.day_lock && ` · ${r.day_lock} only`} · max {r.max_per_week}/wk
                  </span>
                </button>
                <button
                  onClick={() => startEdit(r)}
                  className="shrink-0 rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600 hover:border-neutral-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="shrink-0 rounded px-2 py-1 text-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
                  aria-label={`Remove ${r.name}`}
                >
                  ×
                </button>
              </div>

              {expanded && (
                <div className="mt-3 flex flex-wrap gap-5 border-t border-dashed border-neutral-200 pt-3 text-sm">
                  {[
                    ["Protein", r.protein],
                    ["Carbs", r.carbs],
                    ["Vegetables", r.vegetables],
                    ["Other", r.other],
                    ["Optional add-ins", r.optional],
                  ]
                    .filter(([, list]) => (list as string[]).length > 0)
                    .map(([label, list]) => (
                      <div key={label as string} className="min-w-[140px]">
                        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                          {label}
                        </div>
                        <ul className="list-disc pl-4 text-neutral-700">
                          {(list as string[]).map((line, i) => (
                            <li key={i}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  <div className="min-w-[140px]">
                    <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">
                      Instructions
                    </div>
                    {r.instructions.length ? (
                      <ol className="list-decimal pl-4 text-neutral-700">
                        {r.instructions.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ol>
                    ) : (
                      <span className="italic text-neutral-400">None added</span>
                    )}
                  </div>
                  {r.notes && (
                    <div className="min-w-[140px]">
                      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Notes</div>
                      <p className="text-neutral-700">{r.notes}</p>
                    </div>
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
