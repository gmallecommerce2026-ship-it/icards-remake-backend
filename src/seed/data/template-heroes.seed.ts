// Hero 3D mặc định cho từng danh mục gốc trên site. Nội dung chỉ là chữ và màu nhấn; ảnh để trống,
// admin tải ảnh lên ở dashboard (mục Hero 3D theo danh mục). Ô chưa có ảnh sẽ hiện màu nhấn.
import type { HeroPreset, TemplateHeroes } from '../../templates/template-heroes.js';

const hero = (preset: HeroPreset, accent: string, subtitle: string) => ({
  preset,
  title: '',
  subtitle,
  accent,
  speed: 1,
  images: [] as string[],
});

export const TEMPLATE_HEROES_SEED: TemplateHeroes = {
  wedding: hero('envelope', '#A3152F', 'Trân trọng kính mời bạn đến chung vui trong ngày trọng đại của chúng mình.'),
  engagement: hero('book', '#B7791F', 'Hai họ hân hạnh báo tin lễ ăn hỏi, đính hôn của hai con.'),
  birthday: hero('cube', '#E76F51', 'Cùng nhau thổi nến, cùng nhau cười thật to nhé!'),
  baby: hero('flower', '#E0839B', 'Ba mẹ mời bạn đến mừng bé yêu tròn tháng, tròn năm.'),
  event: hero('fan', '#1F4E79', 'Rất mong được đón tiếp bạn. Vui lòng xác nhận tham dự để chúng tôi chuẩn bị chu đáo.'),
  opening: hero('cube', '#0F766E', 'Kính mời quý khách đến dự lễ khai trương và nhận quà tặng đặc biệt trong ngày đầu.'),
  housewarming: hero('flower', '#4C7A3D', 'Gia đình trân trọng kính mời bạn đến chung vui trong ngày nhập trạch.'),
  graduation: hero('envelope', '#1E3A5F', 'Hãy đến chia vui cùng mình trong ngày khép lại một chặng đường và mở ra chặng mới.'),
  anniversary: hero('fan', '#8B1E3F', 'Cùng chúng tôi nhìn lại chặng đường đã qua và đón một mốc son mới.'),
  festive: hero('book', '#C0392B', 'Mời bạn cùng quây quần đón một mùa lễ ấm áp bên gia đình và bạn bè.'),
};
