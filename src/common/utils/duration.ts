const UNIT: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };

/** "7d" | "12h" | "30m" | "3600" -> số giây. Giá trị sai trả về fallback. */
export function toSeconds(input: string | undefined, fallback = 7 * 86400): number {
  const m = /^(\d+)\s*([smhdw])?$/i.exec((input ?? '').trim());
  if (!m) return fallback;
  return Number(m[1]) * UNIT[(m[2] ?? 's').toLowerCase()];
}
