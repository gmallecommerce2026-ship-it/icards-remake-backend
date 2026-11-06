export const isObjectId = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);
