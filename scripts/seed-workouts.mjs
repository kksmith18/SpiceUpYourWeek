// One-time import of Workouts.xlsx (13 workouts, one per column).
// Highlighted cells in the sheet mark exercises that need a nicer gym; the
// sheet's own footnotes (rows 8/9/15) give the home-gym substitute for each.
// User confirmed (2026-09-15) they're not at a nicer gym right now, so every
// highlighted exercise below has already been swapped for its footnoted
// substitute rather than the original.
// Run with: node scripts/seed-workouts.mjs

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

const rows = [
  {
    name: "Leg Day 1",
    tag: "Legs",
    exercises: [
      "Stretch/Abs",
      "3x8 Backsquat",
      "Hamstring curls- RDLs or manual hamstring curls", // was: 2x12 Hamstring Curls (highlighted)
      "3x12 Jumping Lunges",
      "2x15 Calf Raises",
    ],
  },
  {
    name: "Leg Day 2",
    tag: "Legs",
    exercises: [
      "Stretch/Abs",
      "2x8-12 Heavy RDL's",
      "2x8-12 Bulgarian Split Squats",
      "Kettlebell swings- either w/ db or explosive goblet squats", // was: 2x15 Kettlebell Swings (highlighted)
      "Leg extensions- with ankle through cable or slow and controlled plate squats with hard squeeze at top", // was: 3x15 Leg Extensions (highlighted)
    ],
  },
  {
    name: "Leg Day 3",
    tag: "Legs",
    exercises: [
      "Stretch/Abs",
      "3x12 Jumping Squats",
      "Leg press- slow plate squats barbell, front, or goblet", // was: 2x15 Leg Press (highlighted)
      "2x12 Walking Lunges",
      "Leg extensions- with ankle through cable or slow and controlled plate squats with hard squeeze at top", // was: 2x15 Leg Extensions (highlighted)
    ],
  },
  {
    name: "Push 1",
    tag: "Push",
    exercises: [
      "Stretch/Abs",
      "2x12 Cable Chest Flys",
      "3x8 Incline DB Bench Press",
      "3x12-15 Tricep Extensions superset with 3x12-15 overhead rope tricep extensions",
      "2x25 Pushups",
    ],
  },
  {
    name: "Push 2",
    tag: "Push",
    exercises: [
      "Stretch/Abs",
      "2x25 Pushups",
      "3x8 Bench Press",
      "JM Press- db together incline tricep bench or close grip bench or close grip incline bench", // was: 2x8 JM Press superset with 2x8 tricep pushdown (highlighted)
      "Skullcrushers- do with db", // was: 2x10 EZ bar Skullcrushers (highlighted)
    ],
  },
  {
    name: "Pull 1",
    tag: "Pull",
    exercises: [
      "Stretch/Abs",
      "3x8 Barbell Rows superset with 3x12 pull-ups",
      "3x12-15 Slow Cable Bicep Curls superset with 3x12 DB Hammer Curls",
      "2x8 Chinups ss w/ 2x12 lat rope pull downs",
    ],
  },
  {
    name: "Pull 2",
    tag: "Pull",
    exercises: [
      "Stretch/Abs",
      "Lat pull downs- cable lat push downs or pull ups", // was: 3x12 Lat Pull Downs (highlighted)
      "3x12 Cable Rows",
      "3x15 Cable Rope Bicep/Forearm Hammer Curls",
      "2x12 DB Incline Curls",
    ],
  },
  {
    name: "SARMs 1",
    tag: "SARMs",
    exercises: [
      "Stretch/Abs",
      "3x10 Arnold Press superset with 3x18 lateral raises",
      "2x12-15 Tricep Extensions superset with 2x12-15 overhead rope tricep extensions",
      "2x15 Barbell or EZ Bar Curls superset with 2x8-10 heavy DB curls",
    ],
  },
  {
    name: "SARMs 2",
    tag: "SARMs",
    exercises: [
      "Stretch/Abs",
      "3x8 Shoulder Press superset with 3x18 lateral raises",
      "3x15 DB shrugs superset with 3x12 DB bicep curls",
      "3x15 Rear Delt Flies",
      "3x12 Tricep Push Downs",
    ],
  },
  {
    name: "Arnold 1",
    tag: "Arnold",
    exercises: [
      "Stretch/Abs",
      "3x12 1-Arm Rope Lat Rows",
      "Close grip lat pull downs- bench and cable lat pull", // was: 2x12 Close Grip Lat Pulldowns (highlighted)
      "Smith machine incline bench- slow and controlled incline barbell or db bench", // was: 3x10 Smith Machine Incline Bench (highlighted)
      "2x8 DB Bench",
    ],
  },
  {
    name: "Arnold 2",
    tag: "Arnold",
    exercises: ["Stretch/Abs", "3x12 Pullups", "2x10 Cable Rows", "3x8 Incline Barbell Bench", "3x12 Cable Chest Flys"],
  },
  {
    name: "Calisthenics",
    tag: "Calisthenics",
    exercises: ["Stretch/Abs", "3x5 1-leg squats", "3x10 sec L-sit holds", "3x15 Pullups", "3x34 Pushups"],
  },
  {
    name: "Shoulders",
    tag: "Shoulders",
    exercises: [
      "Stretch/Abs",
      "2x8 Standing Barbell Press",
      "4x25 Lateral Raises superset with 4x25 Shrugs",
      "2x12 Rope Facepulls",
      "2x15 Rear Delt Flies",
    ],
  },
];

const payload = rows.map((r) => ({
  name: r.name,
  tag: r.tag,
  minutes: 45,
  day_lock: "",
  max_per_week: 1,
  exercises: r.exercises,
}));

const { data, error } = await supabase.from("workouts").insert(payload).select("id, name");

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

console.log(`Inserted ${data.length} workouts.`);
