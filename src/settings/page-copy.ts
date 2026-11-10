// Chữ hiển thị trên các trang cửa hàng, dịch vụ, tin tức. Admin sửa ở tab tương ứng; giá trị mặc định là chữ hiện có.

export const PAGE_COPY_FIELDS = {
  shop: ['adTitle', 'adText', 'adCta', 'servicesHeading'],
  services: ['heroTitle', 'heroDescription', 'adTitle', 'adText', 'adCta', 'ctaTitle', 'ctaText', 'ctaButton'],
  blog: ['eyebrow', 'title', 'description', 'searchPlaceholder', 'footerTagline'],
} as const;

export interface BlogKeyword {
  keyword: string;
  blurb: string;
}

export interface BlogKeywordGroup {
  title: string;
  items: BlogKeyword[];
}

export interface PageCopy {
  shop: Record<(typeof PAGE_COPY_FIELDS.shop)[number], string>;
  services: Record<(typeof PAGE_COPY_FIELDS.services)[number], string>;
  blog: Record<(typeof PAGE_COPY_FIELDS.blog)[number], string> & { keywordGroups: BlogKeywordGroup[] };
}

export const DEFAULT_PAGE_COPY: PageCopy = {
  shop: {
    adTitle: 'Phong bì và hộp quà đồng bộ thiệp',
    adText: 'Chọn bộ sản phẩm đồng bộ cho ngày trọng đại của bạn.',
    adCta: 'Xem sản phẩm',
    servicesHeading: 'Dịch vụ',
  },
  services: {
    heroTitle: 'Dịch vụ tiện ích mở rộng',
    heroDescription: 'Hệ sinh thái công cụ hỗ trợ xuyên suốt từ bước mời khách đến khâu đón tiếp, giúp bạn tổ chức sự kiện thảnh thơi và trọn vẹn nhất.',
    adTitle: 'Tư vấn dịch vụ theo yêu cầu',
    adText: 'Cần một giải pháp riêng cho sự kiện? Gửi yêu cầu để đội ngũ iCards tư vấn.',
    adCta: 'Liên hệ tư vấn',
    ctaTitle: 'Bạn không tìm thấy dịch vụ mong muốn?',
    ctaText: 'iCards luôn sẵn sàng tinh chỉnh và xây dựng giải pháp riêng theo yêu cầu thực tế của sự kiện.',
    ctaButton: 'Yêu cầu dịch vụ riêng',
  },
  blog: {
    eyebrow: 'Cẩm nang iCards',
    title: 'Cẩm nang thiệp mời & ngày cưới',
    description: 'Cách làm thiệp, cách viết lời mời và kinh nghiệm chuẩn bị cho ngày vui của bạn.',
    searchPlaceholder: 'Tìm: lời mời, mẫu thiệp, ngân sách...',
    footerTagline: 'Cẩm nang làm thiệp mời, viết lời mời và chuẩn bị cho ngày vui của bạn.',
    keywordGroups: [
    {title: "Thiệp mời", items: [{keyword: "lời mời", blurb: "Cách viết lời mời đám cưới, sinh nhật và sự kiện trang trọng hay thân mật."}, {keyword: "mẫu thiệp", blurb: "Gợi ý phong cách thiệp theo chủ đề, màu sắc và bố cục dễ đọc."}, {keyword: "thiệp điện tử", blurb: "Thiệp online có nhạc, ảnh và bản đồ, gửi qua link chỉ với một chạm."}, {keyword: "thiệp đám cưới", blurb: "Mẫu thiệp cưới theo phong cách truyền thống, hiện đại và tối giản."}, {keyword: "thiệp sinh nhật", blurb: "Thiệp mời sinh nhật trẻ em, người lớn và tiệc bất ngờ."}]},
    {title: "Chuẩn bị sự kiện", items: [{keyword: "ngân sách", blurb: "Lập dự trù chi phí, phân bổ theo hạng mục và theo dõi chi thực tế."}, {keyword: "danh sách khách mời", blurb: "Cách chia nhóm khách, ưu tiên người thân và tránh bỏ sót."}, {keyword: "lời chúc", blurb: "Gợi ý câu chúc ngắn, ý nghĩa cho sổ lưu bút và thiệp cảm ơn."}, {keyword: "xác nhận tham dự", blurb: "Thiết lập hạn RSVP và cách nhắc khách trả lời đúng hạn."}, {keyword: "kế hoạch cưới", blurb: "Checklist từng mốc: đặt tiệc, chụp ảnh, trang trí và di chuyển."}]},
    {title: "Gửi & chia sẻ", items: [{keyword: "gửi thiệp online", blurb: "Cách gửi thiệp qua email hoặc tin nhắn để khách mở được trên điện thoại."}, {keyword: "link thiệp", blurb: "Đặt link dễ nhớ, chia sẻ đúng kênh và theo dõi lượt xem."}, {keyword: "email nhắc nhở", blurb: "Lịch nhắc trước sự kiện giúp khách không quên đến dự."}, {keyword: "QR code", blurb: "In mã QR lên thiệp giấy, standee để khách quét vào thiệp online."}, {keyword: "phong bì", blurb: "Chọn phong bì, in tên và cách đóng gói thiệp in an toàn."}]},
  ],
  },
};

/** Phẳng hoá nhóm từ khoá (dùng cho chân trang và trang chi tiết). */
export const flatKeywords = (groups: BlogKeywordGroup[]): BlogKeyword[] => groups.flatMap((g) => g.items);

/** Đọc chữ trang đã lưu, phần thiếu lấy từ mặc định. Chuỗi rỗng do admin cố ý để trống vẫn được giữ. */
export function resolvePageCopy(raw: unknown): PageCopy {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, Record<string, unknown>>;
  const pick = <K extends string>(src: Record<string, unknown> | undefined, keys: readonly K[], def: Record<K, string>) =>
    Object.fromEntries(keys.map((k) => [k, typeof src?.[k] === 'string' ? (src[k] as string) : def[k]])) as Record<K, string>;
  const blogSrc = o.blog ?? {};
  const groups = Array.isArray(blogSrc.keywordGroups)
    ? (blogSrc.keywordGroups as unknown[]).flatMap((g): BlogKeywordGroup[] => {
        const go = (g && typeof g === 'object' ? g : {}) as Record<string, unknown>;
        if (typeof go.title !== 'string') return [];
        const items = Array.isArray(go.items)
          ? (go.items as unknown[]).flatMap((it): BlogKeyword[] => {
              const io = (it && typeof it === 'object' ? it : {}) as Record<string, unknown>;
              return typeof io.keyword === 'string' ? [{ keyword: io.keyword, blurb: typeof io.blurb === 'string' ? io.blurb : '' }] : [];
            })
          : [];
        return [{ title: go.title, items }];
      })
    : DEFAULT_PAGE_COPY.blog.keywordGroups;
  return {
    shop: pick(o.shop, PAGE_COPY_FIELDS.shop, DEFAULT_PAGE_COPY.shop),
    services: pick(o.services, PAGE_COPY_FIELDS.services, DEFAULT_PAGE_COPY.services),
    blog: { ...pick(blogSrc, PAGE_COPY_FIELDS.blog, DEFAULT_PAGE_COPY.blog), keywordGroups: groups },
  };
}
