// Cây danh mục mẫu thiệp nhiều cấp + các mẫu bổ sung (sinh bằng hàm, không viết tay từng mẫu).
// Mẫu gốc (8 mẫu trong catalog.seed.ts) được xếp vào cây qua `existing`. Chỉ THÊM, không sửa mẫu cũ.
// Cột `category` của bảng là enum 4 giá trị, nên mỗi danh mục gốc ánh xạ về một trong 4 giá trị đó (`base`).
import type { TemplateCategory, TemplateMotif } from '../../catalog/catalog.types.js';
import type { TemplateSeed } from '../catalog.seed-types.js';
import type { TemplateTreeNode } from '../../settings/site-config.types.js';

interface GroupDef {
  id: string;
  label: string;
  existing?: string[]; // slug mẫu đã có sẵn
  names?: string[]; // tên các mẫu mới
  children?: GroupDef[]; // nhóm con (cấp sâu hơn)
}
interface RootDef {
  id: string;
  label: string;
  base: TemplateCategory;
  prefix: string;
  kicker: string;
  titles: string[][];
  place: string;
  address: string;
  message: string;
  features: string[];
  groups: GroupDef[];
}

const ROOTS: RootDef[] = [
  {
    id: 'wedding', label: 'Thiệp cưới', base: 'wedding', prefix: 'cuoi', kicker: 'Trân trọng kính mời',
    titles: [['Minh Anh', '&', 'Quốc Bảo'], ['Thu Hà', '&', 'Đức Huy'], ['Lan Chi', '&', 'Gia Bảo']],
    place: 'Trung tâm tiệc cưới Hương Giang', address: '12 Lê Lợi, Huế',
    message: 'Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình trong ngày trọng đại này.',
    features: ['Ảnh bìa và lời mời', 'Đếm ngược đến ngày cưới', 'Album ảnh', 'Bản đồ chỉ đường', 'Xác nhận tham dự', 'Sổ lưu bút'],
    groups: [
      { id: 'wedding-classic', label: 'Cổ điển - Truyền thống', names: ['Cẩm Tú', 'Trầm Hương', 'Đài Các'] },
      { id: 'wedding-modern', label: 'Hiện đại - Tối giản', existing: ['som-mai'], names: ['Ánh Dương', 'Mộc Lam'] },
      { id: 'wedding-romantic', label: 'Lãng mạn - Hoa', existing: ['nu-hong'], names: ['Thủy Tiên', 'Vườn Xuân'] },
      {
        id: 'wedding-outdoor', label: 'Cưới ngoài trời',
        children: [
          { id: 'wedding-beach', label: 'Cưới biển', existing: ['gio-bien'], names: ['Hoàng Hôn Biển'] },
          { id: 'wedding-forest', label: 'Cưới rừng - đồng cỏ', existing: ['rung-thong'], names: ['Đồng Cỏ'] },
        ],
      },
    ],
  },
  {
    id: 'engagement', label: 'Lễ hỏi - Đính hôn', base: 'wedding', prefix: 'hoi', kicker: 'Trân trọng kính mời',
    titles: [['Thanh Trúc', '&', 'Hoàng Nam'], ['Mỹ Linh', '&', 'Tuấn Kiệt']],
    place: 'Tư gia nhà gái', address: '45 Trần Phú, Đà Nẵng',
    message: 'Gia đình chúng tôi trân trọng kính mời quý khách đến chung vui trong buổi lễ của hai con.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự', 'Sổ lưu bút'],
    groups: [
      { id: 'engagement-anhoi', label: 'Lễ ăn hỏi', names: ['Trầu Cau', 'Sính Lễ', 'Đôi Ta'] },
      { id: 'engagement-dinhhon', label: 'Lễ đính hôn', names: ['Nhẫn Đôi', 'Lời Hẹn'] },
      { id: 'engagement-vuquy', label: 'Lễ vu quy', names: ['Hoa Vu Quy', 'Nhà Gái'] },
    ],
  },
  {
    id: 'birthday', label: 'Sinh nhật', base: 'birthday', prefix: 'sn', kicker: 'Bạn được mời đến tiệc sinh nhật',
    titles: [['Bé Bon'], ['Gia Hân'], ['Anh Khoa']],
    place: 'Nhà hàng Sao Mai', address: '88 Nguyễn Huệ, TP. Hồ Chí Minh',
    message: 'Hãy đến cùng chung vui, cười thật to và ăn thật nhiều bánh kem nhé!',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự', 'Danh sách quà gợi ý'],
    groups: [
      { id: 'birthday-kids', label: 'Sinh nhật bé', existing: ['be-cuoi'], names: ['Sắc Màu', 'Vũ Trụ Nhỏ'] },
      { id: 'birthday-adult', label: 'Sinh nhật người lớn', existing: ['tiec-dem'], names: ['Rượu Vang', 'Tuổi Ba Mươi'] },
      { id: 'birthday-theme', label: 'Tiệc theo chủ đề', names: ['Bãi Biển', 'Hóa Trang', 'Thập Niên 90'] },
    ],
  },
  {
    id: 'baby', label: 'Đầy tháng, thôi nôi', base: 'baby', prefix: 'be', kicker: 'Lễ mừng bé',
    titles: [['Bé Na'], ['Bé Sóc'], ['Bé Bông']],
    place: 'Tư gia, nhà ông bà nội', address: '15 Phan Bội Châu, Huế',
    message: 'Ba mẹ và gia đình mời bạn đến dự bữa cơm thân mật mừng bé yêu.',
    features: ['Ảnh bìa và lời mời', 'Album ảnh bé', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      { id: 'baby-month', label: 'Đầy tháng', existing: ['mam-nho'], names: ['Nụ Cười', 'Bé Yêu'] },
      { id: 'baby-year', label: 'Thôi nôi', names: ['Bé Lên Một', 'Trăng Tròn', 'Chuyến Bay Đầu'] },
    ],
  },
  {
    id: 'event', label: 'Sự kiện', base: 'event', prefix: 'sk', kicker: 'Trân trọng kính mời',
    titles: [['Họp mặt cuối năm'], ['Hội nghị khách hàng'], ['Gặp gỡ đối tác']],
    place: 'Khách sạn Riverside', address: '1 Hùng Vương, Huế',
    message: 'Rất mong được đón tiếp bạn. Vui lòng xác nhận tham dự để chúng tôi chuẩn bị chu đáo.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự', 'Danh sách người tham dự'],
    groups: [
      { id: 'event-reunion', label: 'Họp lớp - Họp mặt', existing: ['hop-lop'], names: ['Bạn Cũ', 'Tình Đồng Môn'] },
      { id: 'event-corporate', label: 'Hội nghị - Doanh nghiệp', names: ['Khai Mạc', 'Đối Tác', 'Hội Thảo'] },
      { id: 'event-party', label: 'Tiệc - Giao lưu', names: ['Đêm Giao Lưu', 'Tiệc Trà'] },
    ],
  },
  {
    id: 'opening', label: 'Khai trương', base: 'event', prefix: 'kt', kicker: 'Lễ khai trương',
    titles: [['Cửa hàng An Nhiên'], ['Quán Cà Phê Nắng'], ['Công ty Khởi Đầu']],
    place: 'Địa điểm khai trương', address: '23 Lý Thường Kiệt, Hà Nội',
    message: 'Kính mời quý khách đến dự lễ khai trương và nhận quà tặng đặc biệt trong ngày đầu.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      { id: 'opening-shop', label: 'Cửa hàng - Quán', names: ['Mở Cửa', 'Chào Hè', 'Nắng Mới'] },
      { id: 'opening-office', label: 'Văn phòng - Công ty', names: ['Cột Mốc', 'Khởi Đầu'] },
    ],
  },
  {
    id: 'housewarming', label: 'Tân gia', base: 'event', prefix: 'tg', kicker: 'Lễ tân gia',
    titles: [['Gia đình Minh Khang'], ['Gia đình Thu Trang']],
    place: 'Nhà mới', address: '9 Ngô Quyền, Hải Phòng',
    message: 'Gia đình trân trọng kính mời bạn đến chung vui trong ngày nhập trạch.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      { id: 'housewarming-new', label: 'Nhà mới', names: ['Mái Ấm', 'Cửa Sổ Xanh', 'Ngày Dọn Nhà'] },
      { id: 'housewarming-ritual', label: 'Lễ nhập trạch', names: ['Nhập Trạch', 'An Cư'] },
    ],
  },
  {
    id: 'graduation', label: 'Tốt nghiệp', base: 'event', prefix: 'tn', kicker: 'Lễ tốt nghiệp',
    titles: [['Ngọc Hân'], ['Đăng Khoa']],
    place: 'Hội trường Đại học', address: '3 Nguyễn Văn Cừ, Cần Thơ',
    message: 'Hãy đến chia vui cùng mình trong ngày khép lại một chặng đường và mở ra chặng mới.',
    features: ['Ảnh bìa và lời mời', 'Album ảnh', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      { id: 'graduation-uni', label: 'Tốt nghiệp đại học', names: ['Mũ Cử Nhân', 'Khởi Hành'] },
      { id: 'graduation-school', label: 'Tổng kết - Chia tay lớp', names: ['Lời Tạm Biệt', 'Ngày Hè'] },
    ],
  },
  {
    id: 'anniversary', label: 'Kỷ niệm - Mừng thọ', base: 'event', prefix: 'kn', kicker: 'Trân trọng kính mời',
    titles: [['Kỷ niệm 10 năm'], ['Mừng thọ 80 tuổi']],
    place: 'Nhà hàng Phúc Lộc', address: '60 Hai Bà Trưng, Nha Trang',
    message: 'Mời bạn đến cùng gia đình ôn lại những kỷ niệm đẹp và chung vui.',
    features: ['Ảnh bìa và lời mời', 'Album ảnh', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      { id: 'anniversary-wedding', label: 'Kỷ niệm ngày cưới', names: ['Bạc Đầu', 'Mười Năm'] },
      { id: 'anniversary-longevity', label: 'Mừng thọ', names: ['Phúc Thọ', 'Tùng Hạc'] },
    ],
  },
  {
    id: 'festive', label: 'Tết - Lễ hội', base: 'event', prefix: 'le', kicker: 'Trân trọng kính mời',
    titles: [['Tất niên'], ['Giáng sinh']],
    place: 'Nhà văn hóa', address: '5 Lê Duẩn, Vinh',
    message: 'Cùng nhau đón một mùa lễ hội ấm áp và đầy ắp tiếng cười.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      { id: 'festive-tet', label: 'Tất niên - Tân niên', names: ['Xuân Đoàn Viên', 'Tất Niên Ấm'] },
      { id: 'festive-xmas', label: 'Giáng sinh - Năm mới', names: ['Đêm Bình An', 'Pháo Hoa'] },
    ],
  },
];

// bg, ink, accent, soft
const PALETTES: [string, string, string, string][] = [
  ['#F6EEE6', '#3B2A1E', '#B5651D', '#E7D3BD'], ['#EAF2EC', '#1D3A2A', '#2F7D4F', '#CFE3D5'],
  ['#F7EAEE', '#431D2B', '#B83A62', '#EFCBD7'], ['#EAEEF8', '#1B2540', '#3550A8', '#CBD3EC'],
  ['#FBF3E1', '#4A3510', '#C48A12', '#F0DDAE'], ['#EFEAF6', '#2D1F45', '#6B46A8', '#D8CBEA'],
  ['#E8F3F4', '#12383D', '#1F8A94', '#C6E1E4'], ['#F8ECE6', '#4A2216', '#C2512B', '#EFCFC2'],
  ['#EEF1E6', '#2A3318', '#6E8B2C', '#D7DFBE'], ['#F3EDEA', '#2E2420', '#8C6A5A', '#DDD0C9'],
];
const MOTIFS: TemplateMotif[] = ['arch', 'circle', 'frame', 'stripe'];

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const extra: TemplateSeed[] = [];
let n = 0;

function build(root: RootDef, g: GroupDef): TemplateTreeNode {
  const slugs: string[] = [...(g.existing ?? [])];
  for (const name of g.names ?? []) {
    const i = n++;
    const [bg, ink, accent, soft] = PALETTES[i % PALETTES.length];
    const day = String(1 + (i % 28)).padStart(2, '0');
    const slug = `${root.prefix}-${slugify(name)}`;
    extra.push({
      slug,
      name,
      category: root.base,
      tagline: `${g.label}, ${root.label.toLowerCase()}`,
      description: `Mẫu ${root.label.toLowerCase()} thuộc nhóm ${g.label.toLowerCase()}. Bố cục gọn, đọc tốt trên điện thoại. Thay chữ, màu và ảnh theo ý bạn rồi gửi link cho khách mời.`,
      price: i % 3 === 0 ? 0 : i % 3 === 1 ? 49000 : 79000,
      popularity: 3800 - i * 41,
      createdAt: `2026-${String(1 + (i % 10)).padStart(2, '0')}-${day}`,
      features: root.features,
      motif: MOTIFS[i % MOTIFS.length],
      palette: { bg, ink, accent, soft },
      sample: {
        kicker: root.kicker,
        titleLines: root.titles[i % root.titles.length],
        date: 'Chủ nhật, 20.12.2026',
        time: '10:00',
        place: root.place,
        address: root.address,
        message: root.message,
      },
    });
    slugs.push(slug);
  }
  const node: TemplateTreeNode = { id: g.id, label: g.label };
  if (slugs.length) node.templateSlugs = slugs;
  if (g.children?.length) node.children = g.children.map((c) => build(root, c));
  return node;
}

export const TEMPLATE_TREE_SEED: TemplateTreeNode[] = ROOTS.map((r) => ({
  id: r.id,
  label: r.label,
  children: r.groups.map((g) => build(r, g)),
}));

/** Mẫu bổ sung (không gồm 8 mẫu gốc). */
export const EXTRA_TEMPLATES: TemplateSeed[] = extra;

/** Danh mục gốc -> giá trị enum của cột category. FE dùng để lọc theo danh mục gốc. */
export const ROOT_BASE: Record<string, TemplateCategory> = Object.fromEntries(ROOTS.map((r) => [r.id, r.base]));
