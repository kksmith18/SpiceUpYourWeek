export function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function joinLines(arr: string[] | undefined | null): string {
  return (arr ?? []).join("\n");
}
