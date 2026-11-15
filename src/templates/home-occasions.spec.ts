import { describe, expect, it } from 'vitest';
import { DEFAULT_HOME_OCCASIONS, sanitizeHomeOccasions } from './home-occasions.js';

describe('sanitizeHomeOccasions', () => {
  it('dữ liệu rỗng hoặc sai kiểu trả về mặc định', () => {
    expect(sanitizeHomeOccasions(undefined)).toEqual(DEFAULT_HOME_OCCASIONS);
    expect(sanitizeHomeOccasions([])).toEqual(DEFAULT_HOME_OCCASIONS);
  });

  it('chỉ giữ font nằm trong danh sách cho phép và slug hợp lệ', () => {
    const out = sanitizeHomeOccasions({ fonts: { wedding: 'script', birthday: 'comic-sans', 'bad slug!': 'sans' } });
    expect(out.fonts).toEqual({ wedding: 'script' });
  });

  it('kẹp độ phủ trong 0..90 và bỏ slug nền lạ', () => {
    expect(sanitizeHomeOccasions({ overlay: 500 }).overlay).toBe(90);
    expect(sanitizeHomeOccasions({ overlay: -3 }).overlay).toBe(0);
    expect(sanitizeHomeOccasions({ backgroundTemplateSlug: '../etc/passwd' }).backgroundTemplateSlug).toBeNull();
    expect(sanitizeHomeOccasions({ backgroundTemplateSlug: 'cuoi-01' }).backgroundTemplateSlug).toBe('cuoi-01');
  });
});
