import { randomBytes } from 'node:crypto';

/** Sinh chuỗi 24 ký tự hex giống ObjectId của Mongo, để _id không đổi định dạng với frontend. */
export const newObjectId = (): string => randomBytes(12).toString('hex');

export const isObjectId = (v: unknown): v is string =>
  typeof v === 'string' && /^[a-f\d]{24}$/i.test(v);

/** Escape ký tự đặc biệt của LIKE trong MySQL. */
export const escapeLike = (s: string): string => s.replace(/[\\%_]/g, '\\$&');
