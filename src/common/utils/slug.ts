import { randomBytes } from 'node:crypto';

/** "Lễ Thành Hôn Ân & Hân" -> "le-thanh-hon-an-han-k3f9" (không dấu, có hậu tố ngẫu nhiên để không trùng). */
export function slugify(input: string): string {
  const base = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${base || 'thiep'}-${randomBytes(2).toString('hex')}`;
}

export const randomToken = (bytes = 16) => randomBytes(bytes).toString('hex');
