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


// Viết gọn: sub = nhóm con (cấp 3, chứa mẫu thiệp); grp = nhóm (cấp 2, chứa các nhóm con).
const sub = (id: string, label: string, names: string[] = [], existing: string[] = []): GroupDef => ({ id, label, names, existing });
const grp = (id: string, label: string, ...children: GroupDef[]): GroupDef => ({ id, label, children });

const ROOTS: RootDef[] = [
  {
    id: 'wedding', label: 'Thiệp cưới', base: 'wedding', prefix: 'cuoi', kicker: 'Trân trọng kính mời',
    titles: [['Minh Anh', '&', 'Quốc Bảo'], ['Thu Hà', '&', 'Đức Huy'], ['Lan Chi', '&', 'Gia Bảo']],
    place: 'Trung tâm tiệc cưới Hương Giang', address: '12 Lê Lợi, Huế',
    message: 'Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình trong ngày trọng đại này.',
    features: ['Ảnh bìa và lời mời', 'Đếm ngược đến ngày cưới', 'Album ảnh', 'Bản đồ chỉ đường', 'Xác nhận tham dự', 'Sổ lưu bút'],
    groups: [
      grp('wedding-style', 'Phong cách',
        sub('wedding-classic', 'Cổ điển', ['Cẩm Tú', 'Trầm Hương']),
        sub('wedding-vn', 'Truyền thống Việt', ['Đài Các', 'Áo Dài Đỏ']),
        sub('wedding-modern', 'Hiện đại - Tối giản', ['Ánh Dương', 'Mộc Lam'], ['som-mai'])),
      grp('wedding-flower', 'Hoa và lãng mạn',
        sub('wedding-rose', 'Hoa hồng', ['Vườn Xuân'], ['nu-hong']),
        sub('wedding-lavender', 'Hoa xanh - tím', ['Thủy Tiên', 'Oải Hương'])),
      grp('wedding-outdoor', 'Cưới ngoài trời',
        sub('wedding-beach', 'Cưới biển', ['Hoàng Hôn Biển'], ['gio-bien']),
        sub('wedding-forest', 'Cưới rừng - đồng cỏ', ['Đồng Cỏ'], ['rung-thong'])),
    ],
  },
  {
    id: 'engagement', label: 'Lễ hỏi - Đính hôn', base: 'wedding', prefix: 'hoi', kicker: 'Trân trọng kính mời',
    titles: [['Thanh Trúc', '&', 'Hoàng Nam'], ['Mỹ Linh', '&', 'Tuấn Kiệt']],
    place: 'Tư gia nhà gái', address: '45 Trần Phú, Đà Nẵng',
    message: 'Gia đình chúng tôi trân trọng kính mời quý khách đến chung vui trong buổi lễ của hai con.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự', 'Sổ lưu bút'],
    groups: [
      grp('engagement-anhoi', 'Lễ ăn hỏi',
        sub('engagement-anhoi-trad', 'Ăn hỏi truyền thống', ['Trầu Cau', 'Sính Lễ']),
        sub('engagement-anhoi-modern', 'Ăn hỏi hiện đại', ['Đôi Ta', 'Hộp Quà Cưới'])),
      grp('engagement-dinhhon', 'Lễ đính hôn',
        sub('engagement-ring', 'Đính hôn nhẫn cưới', ['Nhẫn Đôi', 'Lời Hẹn']),
        sub('engagement-outdoor', 'Đính hôn ngoài trời', ['Chiều Vàng', 'Vườn Hẹn'])),
      grp('engagement-vuquy', 'Lễ vu quy',
        sub('engagement-vuquy-home', 'Vu quy tại nhà gái', ['Hoa Vu Quy', 'Nhà Gái']),
        sub('engagement-vuquy-min', 'Vu quy tối giản', ['Đóa Trắng', 'Chiếc Khăn Voan'])),
    ],
  },
  {
    id: 'birthday', label: 'Sinh nhật', base: 'birthday', prefix: 'sn', kicker: 'Bạn được mời đến tiệc sinh nhật',
    titles: [['Bé Bon'], ['Gia Hân'], ['Anh Khoa']],
    place: 'Nhà hàng Sao Mai', address: '88 Nguyễn Huệ, TP. Hồ Chí Minh',
    message: 'Hãy đến cùng chung vui, cười thật to và ăn thật nhiều bánh kem nhé!',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự', 'Danh sách quà gợi ý'],
    groups: [
      grp('birthday-kids', 'Sinh nhật bé',
        sub('birthday-boy', 'Bé trai', ['Vũ Trụ Nhỏ', 'Siêu Nhân Nhí']),
        sub('birthday-girl', 'Bé gái', ['Sắc Màu', 'Công Chúa Nhỏ']),
        sub('birthday-allkids', 'Cho mọi bé', ['Bóng Bay'], ['be-cuoi'])),
      grp('birthday-adult', 'Sinh nhật người lớn',
        sub('birthday-fancy', 'Tiệc sang trọng', ['Rượu Vang'], ['tiec-dem']),
        sub('birthday-milestone', 'Tuổi tròn', ['Tuổi Ba Mươi', 'Tuổi Bốn Mươi'])),
      grp('birthday-theme', 'Tiệc theo chủ đề',
        sub('birthday-outdoor', 'Ngoài trời', ['Bãi Biển', 'Cắm Trại']),
        sub('birthday-retro', 'Hóa trang - Retro', ['Hóa Trang', 'Thập Niên 90'])),
    ],
  },
  {
    id: 'baby', label: 'Đầy tháng, thôi nôi', base: 'baby', prefix: 'be', kicker: 'Lễ mừng bé',
    titles: [['Bé Na'], ['Bé Sóc'], ['Bé Bông']],
    place: 'Tư gia, nhà ông bà nội', address: '15 Phan Bội Châu, Huế',
    message: 'Ba mẹ và gia đình mời bạn đến dự bữa cơm thân mật mừng bé yêu.',
    features: ['Ảnh bìa và lời mời', 'Album ảnh bé', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      grp('baby-month', 'Đầy tháng',
        sub('baby-month-boy', 'Bé trai', ['Chú Gấu', 'Nụ Cười']),
        sub('baby-month-girl', 'Bé gái', ['Bé Yêu', 'Nàng Thỏ']),
        sub('baby-month-min', 'Tối giản', ['Mầm Xanh'], ['mam-nho'])),
      grp('baby-year', 'Thôi nôi',
        sub('baby-year-pick', 'Chọn đồ thôi nôi', ['Bé Lên Một', 'Bàn Chọn Đồ']),
        sub('baby-year-theme', 'Chủ đề thôi nôi', ['Trăng Tròn', 'Chuyến Bay Đầu'])),
    ],
  },
  {
    id: 'event', label: 'Sự kiện', base: 'event', prefix: 'sk', kicker: 'Trân trọng kính mời',
    titles: [['Họp mặt cuối năm'], ['Hội nghị khách hàng'], ['Gặp gỡ đối tác']],
    place: 'Khách sạn Riverside', address: '1 Hùng Vương, Huế',
    message: 'Rất mong được đón tiếp bạn. Vui lòng xác nhận tham dự để chúng tôi chuẩn bị chu đáo.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự', 'Danh sách người tham dự'],
    groups: [
      grp('event-reunion', 'Họp lớp - Họp mặt',
        sub('event-class', 'Họp lớp', ['Bạn Cũ'], ['hop-lop']),
        sub('event-family', 'Họp mặt đồng nghiệp, gia đình', ['Tình Đồng Môn', 'Sum Họp'])),
      grp('event-corporate', 'Hội nghị - Doanh nghiệp',
        sub('event-conference', 'Hội nghị - Hội thảo', ['Khai Mạc', 'Hội Thảo']),
        sub('event-client', 'Đối tác - Khách hàng', ['Đối Tác', 'Tri Ân Khách Hàng'])),
      grp('event-party', 'Tiệc - Giao lưu',
        sub('event-networking', 'Giao lưu', ['Đêm Giao Lưu', 'Kết Nối']),
        sub('event-tea', 'Tiệc trà', ['Tiệc Trà', 'Trà Chiều'])),
    ],
  },
  {
    id: 'opening', label: 'Khai trương', base: 'event', prefix: 'kt', kicker: 'Lễ khai trương',
    titles: [['Cửa hàng An Nhiên'], ['Quán Cà Phê Nắng'], ['Công ty Khởi Đầu']],
    place: 'Địa điểm khai trương', address: '23 Lý Thường Kiệt, Hà Nội',
    message: 'Kính mời quý khách đến dự lễ khai trương và nhận quà tặng đặc biệt trong ngày đầu.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      grp('opening-shop', 'Cửa hàng - Quán',
        sub('opening-cafe', 'Cà phê - Nhà hàng', ['Nắng Mới', 'Hương Cà Phê']),
        sub('opening-retail', 'Cửa hàng bán lẻ', ['Mở Cửa', 'Chào Hè'])),
      grp('opening-office', 'Văn phòng - Công ty',
        sub('opening-company', 'Công ty mới', ['Khởi Đầu', 'Hướng Mới']),
        sub('opening-branch', 'Chi nhánh - Văn phòng', ['Cột Mốc', 'Mở Rộng'])),
    ],
  },
  {
    id: 'housewarming', label: 'Tân gia', base: 'event', prefix: 'tg', kicker: 'Lễ tân gia',
    titles: [['Gia đình Minh Khang'], ['Gia đình Thu Trang']],
    place: 'Nhà mới', address: '9 Ngô Quyền, Hải Phòng',
    message: 'Gia đình trân trọng kính mời bạn đến chung vui trong ngày nhập trạch.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      grp('housewarming-new', 'Nhà mới',
        sub('housewarming-house', 'Nhà phố', ['Mái Ấm', 'Phố Nhỏ']),
        sub('housewarming-apt', 'Căn hộ', ['Cửa Sổ Xanh', 'Tầng Cao']),
        sub('housewarming-move', 'Dọn nhà', ['Ngày Dọn Nhà', 'Chìa Khóa Mới'])),
      grp('housewarming-ritual', 'Lễ nhập trạch',
        sub('housewarming-rite', 'Cúng nhập trạch', ['Nhập Trạch', 'An Cư']),
        sub('housewarming-party', 'Tiệc mừng nhà mới', ['Tiệc Sân Vườn', 'Bữa Cơm Đầu'])),
    ],
  },
  {
    id: 'graduation', label: 'Tốt nghiệp', base: 'event', prefix: 'tn', kicker: 'Lễ tốt nghiệp',
    titles: [['Ngọc Hân'], ['Đăng Khoa']],
    place: 'Hội trường Đại học', address: '3 Nguyễn Văn Cừ, Cần Thơ',
    message: 'Hãy đến chia vui cùng mình trong ngày khép lại một chặng đường và mở ra chặng mới.',
    features: ['Ảnh bìa và lời mời', 'Album ảnh', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      grp('graduation-uni', 'Tốt nghiệp đại học',
        sub('graduation-bachelor', 'Cử nhân - Kỹ sư', ['Mũ Cử Nhân', 'Khởi Hành']),
        sub('graduation-master', 'Thạc sĩ - Tiến sĩ', ['Học Vị', 'Chân Trời Mới'])),
      grp('graduation-school', 'Tổng kết - Chia tay lớp',
        sub('graduation-farewell', 'Chia tay lớp', ['Lời Tạm Biệt', 'Kỷ Yếu']),
        sub('graduation-year', 'Tổng kết năm học', ['Ngày Hè', 'Điểm Mười'])),
    ],
  },
  {
    id: 'anniversary', label: 'Kỷ niệm - Mừng thọ', base: 'event', prefix: 'kn', kicker: 'Trân trọng kính mời',
    titles: [['Kỷ niệm 10 năm'], ['Mừng thọ 80 tuổi']],
    place: 'Nhà hàng Phúc Lộc', address: '60 Hai Bà Trưng, Nha Trang',
    message: 'Mời bạn đến cùng gia đình ôn lại những kỷ niệm đẹp và chung vui.',
    features: ['Ảnh bìa và lời mời', 'Album ảnh', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      grp('anniversary-wedding', 'Kỷ niệm ngày cưới',
        sub('anniversary-gold', 'Cưới bạc - cưới vàng', ['Bạc Đầu', 'Vàng Son']),
        sub('anniversary-year', 'Kỷ niệm tròn năm', ['Mười Năm', 'Năm Thứ Năm'])),
      grp('anniversary-longevity', 'Mừng thọ',
        sub('anniversary-70', 'Thọ 70 - 80 tuổi', ['Phúc Thọ', 'Bát Tuần']),
        sub('anniversary-90', 'Thọ 90 - trăm tuổi', ['Tùng Hạc', 'Bách Niên'])),
    ],
  },
  {
    id: 'festive', label: 'Tết - Lễ hội', base: 'event', prefix: 'le', kicker: 'Trân trọng kính mời',
    titles: [['Tất niên'], ['Giáng sinh']],
    place: 'Nhà văn hóa', address: '5 Lê Duẩn, Vinh',
    message: 'Cùng nhau đón một mùa lễ hội ấm áp và đầy ắp tiếng cười.',
    features: ['Ảnh bìa và lời mời', 'Bản đồ chỉ đường', 'Xác nhận tham dự'],
    groups: [
      grp('festive-tet', 'Tất niên - Tân niên',
        sub('festive-tet-family', 'Tất niên gia đình', ['Xuân Đoàn Viên', 'Mâm Cỗ Cuối Năm']),
        sub('festive-tet-company', 'Tất niên công ty', ['Tất Niên Ấm', 'Năm Mới Thịnh Vượng'])),
      grp('festive-xmas', 'Giáng sinh - Năm mới',
        sub('festive-xmas-eve', 'Giáng sinh', ['Đêm Bình An', 'Ông Già Tuyết']),
        sub('festive-countdown', 'Countdown', ['Pháo Hoa', 'Giao Thừa Quốc Tế'])),
      grp('festive-other', 'Lễ hội khác',
        sub('festive-midautumn', 'Trung thu', ['Đêm Rằm', 'Lồng Đèn']),
        sub('festive-halloween', 'Halloween', ['Đêm Ma Quái', 'Bí Ngô'])),
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
