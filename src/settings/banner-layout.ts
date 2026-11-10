import type { BannerGroup, BannerItem, BannerLayout, BannerPage, BannerSlot, HomeBanner } from './site-config.types.js';

// Logic thuần (không phụ thuộc Nest) để có thể kiểm thử độc lập.
// Danh sách trang / bố cục phải khớp với FE: src/lib/banner-groups.ts.

export const BANNER_PAGES: readonly BannerPage[] = ['home', 'shop', 'services', 'professional'];
export const BANNER_SLOTS: readonly BannerSlot[] = ['top', 'bottom'];
export const BANNER_LAYOUTS: readonly BannerLayout[] = ['slider', 'stack', 'hero-pair', 'mosaic-2-1', 'grid-2', 'grid-3'];

export const isBannerPage = (v: unknown): v is BannerPage => (BANNER_PAGES as readonly unknown[]).includes(v);
export const isBannerSlot = (v: unknown): v is BannerSlot => (BANNER_SLOTS as readonly unknown[]).includes(v);
export const isBannerLayout = (v: unknown): v is BannerLayout => (BANNER_LAYOUTS as readonly unknown[]).includes(v);

const asObject = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

const readStr = (v: unknown, max: number): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : undefined;

const readId = (v: unknown): string | undefined =>
  typeof v === 'string' && /^[a-zA-Z0-9_-]{1,60}$/.test(v) ? v : undefined;

/** Chỉ nhận đường dẫn nội bộ (/...) hoặc https. Chặn javascript:, data:, http:... */
const readUrl = (v: unknown): string | undefined => {
  const s = readStr(v, 2000);
  if (!s) return undefined;
  if (s.startsWith('/') && !s.startsWith('//')) return s;
  if (/^https:\/\/\S+$/i.test(s)) return s;
  return undefined;
};

/* ---------- Nội dung mặc định (giữ nguyên chữ của bản cũ trong lib/banners.ts) ---------- */

const item = (
  id: string,
  eyebrow: string,
  title: string,
  text: string,
  ctaLabel: string,
  link: string,
): BannerItem => ({ id, name: title, eyebrow, title, text, ctaLabel, link, imgSrc: null, isEnabled: true });

/** Bộ mặc định khi chưa có dữ liệu. Hàm trả về bản mới mỗi lần gọi để tránh dùng chung object. */
export function defaultBannerGroups(): BannerGroup[] {
  return [
    {
      id: 'grp-home-top', name: 'Banner đầu trang', page: 'home', slot: 'top', layout: 'slider', isEnabled: true,
      banners: [
        item('home-1', 'Mẫu thiệp mới', 'Thiệp mở ra như một lá thư thật', 'Phong bì, lớp lót và tem đều có thể tuỳ chỉnh để thiệp của bạn thật riêng.', 'Xem mẫu thiệp', '/templates'),
        item('home-2', 'Khách mời', 'Theo dõi xác nhận tham dự theo thời gian thực', 'Danh sách khách và lời chúc được cập nhật ngay khi khách phản hồi.', 'Bắt đầu miễn phí', '/sign-up'),
        item('home-3', 'Dịch vụ', 'In ấn và quà tặng cho ngày trọng đại', 'Chọn thêm thiệp in, bảng đón khách hay quà lưu niệm từ cửa hàng iCards.', 'Xem cửa hàng', '/shop'),
      ],
    },
    {
      id: 'grp-home-bottom', name: 'Banner cuối trang', page: 'home', slot: 'bottom', layout: 'mosaic-2-1', isEnabled: true,
      banners: [
        item('home-bottom-1', 'Thiệp cưới', 'Trọn bộ thiệp cưới từ mẫu đến in ấn', 'Chọn mẫu, cá nhân hoá nội dung và đặt in thiệp cùng phong bì đồng bộ.', 'Chọn mẫu cưới', '/templates'),
        item('home-bottom-2', 'Sự kiện', 'Quản lý khách mời gọn gàng cho mọi buổi tiệc', 'Theo dõi xác nhận tham dự, lời chúc và chi phí trong một nơi duy nhất.', 'Dùng thử miễn phí', '/sign-up'),
        item('home-bottom-3', 'Dịch vụ', 'Đội ngũ iCards hỗ trợ bạn từ A đến Z', 'Từ tư vấn ý tưởng đến in ấn và giao hàng tận nơi.', 'Xem dịch vụ', '/services'),
      ],
    },
    {
      id: 'grp-shop-top', name: 'Banner cửa hàng', page: 'shop', slot: 'top', layout: 'slider', isEnabled: true,
      banners: [item('shop-1', 'Ưu đãi', 'Bộ in thiệp cưới trọn gói', 'Thiệp in, phong bì và tem đồng bộ với mẫu bạn đã chọn.', 'Khám phá', '/shop')],
    },
    {
      id: 'grp-services-top', name: 'Banner dịch vụ', page: 'services', slot: 'top', layout: 'slider', isEnabled: true,
      banners: [item('svc-1', 'Dịch vụ', 'Đội ngũ iCards hỗ trợ bạn từ A đến Z', 'Từ tư vấn ý tưởng đến in ấn và giao hàng tận nơi.', 'Xem dịch vụ', '/services')],
    },
    {
      id: 'grp-pro-top', name: 'Banner chuyên nghiệp', page: 'professional', slot: 'top', layout: 'hero-pair', isEnabled: true,
      banners: [
        item('pro-1', 'Chuyên nghiệp', 'Thiết kế bản sắc riêng cho sự kiện của bạn', 'Đồng hành cùng cá nhân cao cấp, doanh nghiệp và agency sự kiện.', 'Liên hệ tư vấn', '/contact'),
        item('pro-bottom-1', 'Thiệp cưới', 'Thiệp mời online đồng bộ với bộ thiệp in', 'Thiết kế một lần, dùng cho cả thiệp online lẫn thiệp in tận nơi.', 'Chọn mẫu thiệp', '/templates'),
        item('pro-bottom-2', 'Tư vấn', 'Thiết kế riêng cho sự kiện của bạn', 'Đội ngũ iCards lắng nghe câu chuyện và phác thảo thiệp độc bản cho bạn.', 'Liên hệ tư vấn', '/contact'),
      ],
    },
  ];
}

/**
 * Chuyển danh sách banner cũ (phẳng, theo displayPage) sang nhóm.
 * Banner trang chủ cũ thành băng chuyền đầu trang, giữ nguyên tên, ảnh, liên kết và trạng thái bật/tắt.
 * Các trang khác dùng bộ mặc định. Banner cũ của trang templates, blog, all không được hiển thị ở đâu nên bỏ qua.
 */
export function groupsFromLegacy(legacy: HomeBanner[] | undefined): BannerGroup[] {
  const groups = defaultBannerGroups();
  const legacyHome = (legacy ?? []).filter((b) => b && b.displayPage === 'home');
  if (legacyHome.length) {
    const top = groups.find((g) => g.id === 'grp-home-top');
    if (top) {
      top.banners = legacyHome.map((b, i) => ({
        id: readId(b.id) ?? `home-legacy-${i}`,
        name: readStr(b.name, 100) ?? `Banner ${i + 1}`,
        eyebrow: 'iCards',
        title: readStr(b.name, 120),
        text: 'Chọn mẫu, điền thông tin và gửi link cho khách mời trong vài phút.',
        ctaLabel: 'Xem mẫu thiệp',
        imgSrc: readUrl(b.imgSrc) ?? null,
        link: readUrl(b.link) ?? '/templates',
        isEnabled: b.isEnabled === true,
      }));
    }
  }
  return groups;
}

/**
 * Đọc nhóm banner từ cấu hình đã lưu. Đọc lỏng: bỏ qua mục hỏng thay vì ném lỗi, để một mục sai không làm sập trang.
 * Nếu chưa có bannerGroups (dữ liệu cũ) thì chuyển từ banners.
 */
export function normalizeBannerGroups(settings: { bannerGroups?: unknown; banners?: unknown }): BannerGroup[] {
  if (!Array.isArray(settings.bannerGroups)) {
    return groupsFromLegacy(Array.isArray(settings.banners) ? (settings.banners as HomeBanner[]) : undefined);
  }
  return settings.bannerGroups.flatMap((raw, gi): BannerGroup[] => {
    const o = asObject(raw);
    if (!isBannerPage(o.page)) return [];
    const id = readId(o.id) ?? `grp-${gi}`;
    const banners: BannerItem[] = Array.isArray(o.banners)
      ? o.banners.map((rawItem, bi) => {
          const it = asObject(rawItem);
          return {
            id: readId(it.id) ?? `${id}-${bi}`,
            name: readStr(it.name, 100) ?? 'Banner',
            eyebrow: readStr(it.eyebrow, 60),
            title: readStr(it.title, 120),
            text: readStr(it.text, 300),
            ctaLabel: readStr(it.ctaLabel, 40),
            imgSrc: readUrl(it.imgSrc) ?? null,
            link: readUrl(it.link),
            isEnabled: it.isEnabled === true,
          };
        })
      : [];
    return [
      {
        id,
        name: readStr(o.name, 100) ?? 'Nhóm banner',
        page: o.page,
        slot: isBannerSlot(o.slot) ? o.slot : 'top',
        layout: isBannerLayout(o.layout) ? o.layout : 'slider',
        isEnabled: o.isEnabled === true,
        banners,
      },
    ];
  });
}

/**
 * Bản công khai: chỉ giữ nhóm đang bật có ít nhất một banner đang bật, và chỉ các banner đang bật.
 * Thứ tự nhóm và banner giữ nguyên như admin đã sắp xếp.
 */
export function publicBannerGroups(groups: BannerGroup[]): BannerGroup[] {
  return groups
    .filter((g) => g.isEnabled)
    .map((g) => ({ ...g, banners: g.banners.filter((b) => b.isEnabled) }))
    .filter((g) => g.banners.length > 0);
}
