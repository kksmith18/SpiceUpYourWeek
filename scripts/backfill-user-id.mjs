// One-time fix-up: every row inserted while auth was disabled has user_id =
// null. Assign them all to the real account now that one exists, so RLS
// (auth.uid() = user_id) can be safely re-enabled without orphaning the data.
// Run with: node scripts/backfill-user-id.mjs <user-uuid>

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

const userId = process.argv[2];
if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
  console.error("Usage: node scripts/backfill-user-id.mjs <user-uuid>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function backfill(table) {
  const { data, error, count } = await supabase
    .from(table)
    .update({ user_id: userId }, { count: "exact" })
    .is("user_id", null)
    .select("id");
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: assigned ${data.length} row(s) to ${userId}`);
}

await backfill("recipes");
await backfill("workouts");
await backfill("pantry_ignore");
