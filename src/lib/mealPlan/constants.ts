// OffSlots are dinners that don't come from the recipe pool — eating out, a
// roommate cooking, a planned rest night. They're a separate type on purpose:
// a zero-minute "recipe" would still count toward variety/repeat tracking in
// the shuffler, which is wrong for a night with no dish at all.
export type OffSlot = {
  id: string;
  name: string;
};

export const OFF_SLOTS: OffSlot[] = [
  { id: "eating-out", name: "Eating Out" },
  { id: "dinner-from-julian", name: "Dinner from Julian" },
];

// Same OffSlot shape, reused for workout rest days.
export const WORKOUT_OFF_SLOTS: OffSlot[] = [{ id: "rest-day", name: "Rest day" }];

// Same breakfast/lunch combo (oats or a shake) most days, so it's a flat
// weekly grocery add rather than something scheduled or shuffled.
export const STANDING_ITEMS: string[] = [
  "Oats",
  "Milk",
  "Momentum protein powder",
  "Frozen fruit",
  "Spinach",
  "Honey",
  "Cinnamon",
  "Apples",
  "Chia or flax seeds",
  "Peanut or almond butter",
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = (typeof DAYS)[number];

export const DEFAULT_ACTIVE_WORKOUT_DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
