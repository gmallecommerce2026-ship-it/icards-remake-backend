import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvitationTemplate } from '../templates/schemas/invitation-template.schema.js';
import { TemplateCategoryNode } from '../templates/schemas/template-category-node.schema.js';
import { toTemplateDto } from '../templates/templates.service.js';
import { SettingsService } from '../settings/settings.service.js';
import { ENVELOPES_KEY, resolveEnvelope, sanitizeEnvelope } from '../templates/envelope.js';
import {
  ENVELOPE_PRESETS_KEY,
  ENVELOPE_PRESETS_SEED,
  sanitizePresets,
  type EnvelopePresets,
} from '../templates/envelope-presets.js';
import {
  cleanDesign,
  cleanEnvelopeAssignment,
  cleanPresets,
  cleanTemplateInput,
  type TemplateInput,
} from './admin-templates.validator.js';
import type { TitleStyleMap } from '../templates/title-style.js';

const DEFAULT_PALETTE = { bg: '#F6EEE6', ink: '#3B2A1E', accent: '#B5651D', soft: '#E7D3BD' };
const DEFAULT_SAMPLE = {
  kicker: 'Trân trọng kính mời',
  titleLines: ['Tên cô dâu', '&', 'Tên chú rể'],
  date: 'Chủ nhật, 20.12.2026',
  time: '10:00',
  place: 'Địa điểm tổ chức',
  address: 'Địa chỉ',
  message: 'Rất hân hạnh được đón tiếp bạn.',
};

/** Quản trị mẫu thiệp (thông tin, thiết kế, nhóm), phong bì và lớp lót. Chỉ role=admin (xem controller). */
@Injectable()
export class AdminTemplatesService {
  constructor(
    @InjectRepository(InvitationTemplate) private readonly templates: Repository<InvitationTemplate>,
    @InjectRepository(TemplateCategoryNode) private readonly nodes: Repository<TemplateCategoryNode>,
    private readonly settings: SettingsService,
  ) {}

  private async nodeMaps() {
    const rows = await this.nodes.find();
    const byId = new Map(rows.map((n) => [n._id, n]));
    /** Nhãn đầy đủ của nút, vd "Thiệp cưới › Phong cách › Cổ điển". */
    const pathOf = (n: TemplateCategoryNode | undefined | null): string | null => {
      if (!n) return null;
      const labels: string[] = [];
      let cur: TemplateCategoryNode | undefined = n;
      while (cur) {
        labels.unshift(cur.label);
        cur = cur.parentId ? byId.get(cur.parentId) : undefined;
      }
      return labels.join(' › ');
    };
    return { rows, byId, pathOf };
  }

  async listTemplates() {
    const [rows, { byId, pathOf }, envMap] = await Promise.all([
      this.templates.find({ order: { popularity: 'DESC', slug: 'ASC' } }),
      this.nodeMaps(),
      this.settings.getContent<Record<string, unknown>>(ENVELOPES_KEY, {}),
    ]);
    return rows.map((t) => {
      const node = t.categoryId ? byId.get(t.categoryId) : undefined;
      return {
        _id: t._id,
        slug: t.slug,
        name: t.name,
        category: t.category,
        categorySlug: node?.slug ?? null,
        categoryPath: pathOf(node),
        tagline: t.tagline,
        price: t.price,
        format: t.format,
        orientation: t.orientation,
        isPublished: t.isPublished,
        popularity: t.popularity,
        hasDesign: !!t.design,
        envelope: resolveEnvelope(envMap, t.slug) ?? null,
      };
    });
  }

  async getTemplate(id: string) {
    const t = await this.findById(id);
    const [styles, envelopes] = await Promise.all([
      this.settings.getContent<TitleStyleMap>('template.titleStyles', {}),
      this.settings.getContent<Record<string, unknown>>(ENVELOPES_KEY, {}),
    ]);
    const { byId } = await this.nodeMaps();
    const node = t.categoryId ? byId.get(t.categoryId) : undefined;
    return {
      ...toTemplateDto(t, styles, envelopes),
      _id: t._id,
      isPublished: t.isPublished,
      categorySlug: node?.slug ?? null,
      design: t.design ?? null,
    };
  }

  async createTemplate(body: unknown) {
    const input = cleanTemplateInput(body, true);
    await this.assertSlugFree(input.slug as string);
    const categoryId = await this.resolveCategory(input.categorySlug);
    const row = this.templates.create({
      slug: input.slug as string,
      name: input.name as string,
      category: input.category as InvitationTemplate['category'],
      categoryId,
      tagline: input.tagline as string,
      description: input.description as string,
      price: input.price ?? 0,
      popularity: 0,
      releasedOn: new Date().toISOString().slice(0, 10),
      features: input.features ?? [],
      motif: 'arch',
      palette: DEFAULT_PALETTE,
      sample: DEFAULT_SAMPLE,
      format: input.format ?? 'folding',
      orientation: input.orientation ?? 'portrait',
      isPublished: input.isPublished ?? false,
      design: null,
    });
    const saved = await this.templates.save(row);
    return { _id: saved._id, slug: saved.slug };
  }

  async updateTemplate(id: string, body: unknown) {
    const t = await this.findById(id);
    const input: TemplateInput = cleanTemplateInput(body, false);
    if (input.slug !== undefined && input.slug !== t.slug) await this.assertSlugFree(input.slug, t._id);
    if (input.categorySlug !== undefined) t.categoryId = await this.resolveCategory(input.categorySlug);
    const { categorySlug: _ignored, ...rest } = input;
    void _ignored;
    Object.assign(t, rest);
    await this.templates.save(t);
    return { ok: true };
  }

  async saveDesign(id: string, body: unknown) {
    const t = await this.findById(id);
    const raw = body && typeof body === 'object' && 'design' in (body as object) ? (body as { design: unknown }).design : body;
    t.design = cleanDesign(raw);
    await this.templates.save(t);
    return { ok: true, savedAt: new Date().toISOString() };
  }

  async saveEnvelope(id: string, body: unknown) {
    const t = await this.findById(id);
    const a = cleanEnvelopeAssignment(body);
    const presets = await this.presets();
    if (a.envId && !presets.envelopes.some((e) => e.id === a.envId)) throw new BadRequestException('Phong bì không có trong danh mục');
    if (a.linerId && !presets.liners.some((l) => l.id === a.linerId)) throw new BadRequestException('Lớp lót không có trong danh mục');

    const map = { ...(await this.settings.getContent<Record<string, unknown>>(ENVELOPES_KEY, {})) };
    const next = sanitizeEnvelope({ envId: a.envId ?? undefined, linerId: a.linerId ?? undefined });
    if (next) map[t.slug] = next;
    else delete map[t.slug];
    await this.settings.setContent(ENVELOPES_KEY, map);
    return { envelope: resolveEnvelope(map, t.slug) ?? null };
  }

  /** Danh mục phong bì và lớp lót hiện tại (đã kiểm tra định dạng). */
  async presets(): Promise<EnvelopePresets> {
    return sanitizePresets(await this.settings.getContent<unknown>(ENVELOPE_PRESETS_KEY, ENVELOPE_PRESETS_SEED));
  }

  async savePresets(body: unknown) {
    const clean = cleanPresets(body);
    await this.settings.setContent(ENVELOPE_PRESETS_KEY, clean);
    return clean;
  }

  /** Các nút trong cây danh mục để chọn nhóm cho mẫu, kèm nhãn đầy đủ. */
  async listCategories() {
    const { rows, pathOf } = await this.nodeMaps();
    return rows
      .map((n) => ({ slug: n.slug, label: n.label, path: pathOf(n) ?? n.label, sortOrder: n.sortOrder }))
      .sort((a, b) => a.path.localeCompare(b.path, 'vi'));
  }

  private async findById(id: string): Promise<InvitationTemplate> {
    const t = await this.templates.findOne({ where: { _id: id } });
    if (!t) throw new NotFoundException('Không tìm thấy mẫu thiệp');
    return t;
  }

  private async assertSlugFree(slug: string, exceptId?: string) {
    const other = await this.templates.findOne({ where: { slug } });
    if (other && other._id !== exceptId) throw new BadRequestException('Mã mẫu (slug) đã tồn tại');
  }

  /** Nhóm theo mã nút (slug) -> _id. null/undefined = không gán nhóm. */
  private async resolveCategory(slug: string | null | undefined): Promise<string | null> {
    if (!slug) return null;
    const node = await this.nodes.findOne({ where: { slug } });
    if (!node) throw new BadRequestException('Nhóm danh mục không tồn tại');
    return node._id;
  }
}
