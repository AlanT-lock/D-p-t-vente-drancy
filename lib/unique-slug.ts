export async function ensureUniqueSlug(
  base: string,
  exists: (s: string) => Promise<boolean>,
): Promise<string> {
  let candidate = base;
  let i = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${i++}`;
  }
  return candidate;
}
