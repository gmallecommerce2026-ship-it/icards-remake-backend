import { createHash } from 'node:crypto';

/**
 * _id ổn định theo khóa tự nhiên (vd slug). Seed chạy lại vẫn ra cùng _id nên không tạo bản ghi trùng.
 * Trả về chuỗi 24 ký tự hex, cùng định dạng ObjectId mà FE đang dùng.
 */
export const stableId = (namespace: string, key: string): string =>
  createHash('sha1').update(`${namespace}:${key}`).digest('hex').slice(0, 24);
