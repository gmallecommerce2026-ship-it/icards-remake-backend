import { describe, expect, it, beforeEach } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TemplateBlocksService, TEMPLATE_BLOCKS_KEY } from './template-blocks.service.js';

/** SettingsService giả: chỉ giữ một kho key/value trong bộ nhớ. */
function fakeSettings(initial: Record<string, unknown> = {}) {
  const store = new Map<string, unknown>(Object.entries(initial));
  return {
    store,
    getContent: async <T>(key: string, fallback: T) => (store.has(key) ? (store.get(key) as T) : fallback),
    setContent: async (key: string, value: unknown) => {
      store.set(key, JSON.parse(JSON.stringify(value)));
    },
  };
}

describe('TemplateBlocksService', () => {
  let settings: ReturnType<typeof fakeSettings>;
  let svc: TemplateBlocksService;

  beforeEach(() => {
    settings = fakeSettings({
      [TEMPLATE_BLOCKS_KEY]: [
        { title: 'Thiệp cưới', slug: 'wedding', isActive: true, templateSlugs: ['a'] },
        { title: 'Sinh nhật', slug: 'birthday', isActive: false, templateSlugs: [] },
      ],
    });
    svc = new TemplateBlocksService(settings as never);
  });

  it('đọc khối và bỏ qua dữ liệu lỗi trong kho', async () => {
    settings.store.set(TEMPLATE_BLOCKS_KEY, [
      { title: 'Ok', slug: 'ok', isActive: true, templateSlugs: [] },
      { title: '', slug: 'bad', isActive: true, templateSlugs: [] },
      'rác',
    ]);
    const blocks = await svc.getBlocks();
    expect(blocks.map((b) => b.slug)).toEqual(['ok']);
  });

  it('setTitleStyle lưu kiểu hợp lệ và loại bỏ trường lạ', async () => {
    const b = await svc.setTitleStyle('wedding', { font: 'script', size: 26, color: '#3b2f2a', hack: 'x' });
    expect(b.titleStyle).toEqual({ font: 'script', size: 26, color: '#3b2f2a' });
    const saved = (await svc.getBlocks()).find((x) => x.slug === 'wedding');
    expect(saved?.titleStyle?.font).toBe('script');
  });

  it('setTitleStyle với null thì xóa kiểu, quay về mặc định', async () => {
    await svc.setTitleStyle('wedding', { font: 'serif' });
    await svc.setTitleStyle('wedding', null);
    const saved = (await svc.getBlocks()).find((x) => x.slug === 'wedding');
    expect(saved?.titleStyle).toBeUndefined();
  });

  it('setTitleStyle từ chối font lạ và slug không tồn tại', async () => {
    await expect(svc.setTitleStyle('wedding', { font: 'comic-sans' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.setTitleStyle('khong-co', { font: 'serif' })).rejects.toBeInstanceOf(NotFoundException);
  });

  it('saveBlocks từ chối slug trùng và dữ liệu sai', async () => {
    await expect(
      svc.saveBlocks([
        { title: 'A', slug: 'x', isActive: true, templateSlugs: [] },
        { title: 'B', slug: 'x', isActive: true, templateSlugs: [] },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.saveBlocks([{ slug: 'x' }])).rejects.toBeInstanceOf(BadRequestException);
    await expect(svc.saveBlocks('không phải mảng')).rejects.toBeInstanceOf(BadRequestException);
  });
});
