const DATA_URL = /^data:image\/(?:jpeg|png|webp|gif);base64,/;

function collect(v: unknown, out: Set<string>): void {
  if (typeof v === 'string') { if (DATA_URL.test(v)) out.add(v); }
  else if (Array.isArray(v)) v.forEach((x) => collect(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => collect(x, out));
}

function replace(v: unknown, map: Map<string, string>): unknown {
  if (typeof v === 'string') return map.get(v) ?? v;
  if (Array.isArray(v)) return v.map((x) => replace(x, map));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, replace(x, map)]));
  return v;
}

/**
 * Studio lưu ảnh người dùng dưới dạng data URL (base64) -> phình document Mongo.
 * Hàm này đẩy từng ảnh lên R2 và thay bằng URL. Lỗi 1 ảnh -> giữ nguyên ảnh đó.
 */
export async function externalizeDataUrls<T>(value: T, upload: (dataUrl: string) => Promise<string>, maxImages = 40): Promise<T> {
  const found = new Set<string>();
  collect(value, found);
  if (!found.size) return value;
  const list = [...found].slice(0, maxImages);
  const map = new Map<string, string>();
  for (let i = 0; i < list.length; i += 4) {
    await Promise.all(list.slice(i, i + 4).map(async (u) => {
      try { map.set(u, await upload(u)); } catch { /* giữ nguyên */ }
    }));
  }
  return replace(value, map) as T;
}
