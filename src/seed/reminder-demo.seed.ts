// Dữ liệu demo để xem tính năng NHẮC LỊCH trên trang quản lý thiệp (tab Sự kiện) và email nhắc thật.
// Chạy riêng, KHÔNG đụng tới danh mục/mẫu thiệp. Chạy lại sẽ xoá thiệp demo cũ rồi tạo lại.
//
// Cách chạy trên VPS (sau khi backend đã chạy ít nhất một lần để tạo bảng):
//   npm run build:once && node --env-file-if-exists=.env dist/seed/reminder-demo.seed.js
//
// Biến môi trường (đặt trong .env hoặc ghi trước lệnh):
//   SEED_OWNER_EMAIL=...        (bắt buộc) email tài khoản sẽ sở hữu thiệp demo
//   SEED_OWNER_PASSWORD=...     (chỉ cần nếu tài khoản đó CHƯA tồn tại; tối thiểu 8 ký tự)
//   SEED_OWNER_USERNAME=...     (tuỳ chọn, mặc định demo-owner, dùng khi tạo tài khoản mới)
//   Email nhận nhắc lịch được CỐ ĐỊNH trong file này: chỉ một khách (Nguyễn Văn An) có email,
//   nên chỉ có đúng một địa chỉ nhận thư. Các khách khác không có email và sẽ không được gửi.
//   SEED_SEND_NOW=true          (tuỳ chọn) đặt sẵn một lịch nhắc đã đến giờ (7 ngày trước) để bộ gửi của
//                               backend gửi NGAY ở lần quét kế tiếp (mặc định 10 phút/lần).
//                               Khi bật, sự kiện diễn ra sau 7 ngày để nội dung email khớp.
//   FRONTEND_URL / PUBLIC_EVENT_PATH: dùng để in link thử nghiệm cuối lần chạy (đọc từ .env như backend).
//
// Lưu ý: gửi email thật cần EMAIL_USER / EMAIL_PASS trong .env. Nếu để trống, backend chỉ ghi email ra log (DRY-RUN).
import 'reflect-metadata';
import { randomBytes } from 'node:crypto';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema.js';
import { Invitation, DEFAULT_SETTINGS } from '../invitations/schemas/invitation.schema.js';
import { Guest } from '../guests/schemas/guest.schema.js';
import { EventReminder } from '../reminders/schemas/event-reminder.schema.js';

const DEMO_SLUG = 'demo-nhac-lich';
const DAYS_BEFORE = [7, 3, 1];
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const VN_OFFSET_MS = 7 * HOUR;

/** Giống RemindersService.computeSendAt: 08:00 giờ Việt Nam, daysBefore ngày trước ngày diễn ra. */
function computeSendAt(eventDate: Date, daysBefore: number): Date {
  const v = new Date(eventDate.getTime() + VN_OFFSET_MS);
  return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate() - daysBefore, 1));
}

/** Ngày 17:00 giờ Việt Nam, cách hiện tại `days` ngày. */
function eventAt17hVN(days: number): Date {
  const v = new Date(Date.now() + days * DAY + VN_OFFSET_MS);
  return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate(), 17) - VN_OFFSET_MS);
}

function required(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Thiếu biến môi trường ${name}`);
  return v;
}

/** Địa chỉ DUY NHẤT nhận email demo. */
const RECIPIENT = 'an.nguyenthien112802@gmail.com';

const PEOPLE: { name: string; status: 'pending' | 'attending' | 'declined'; email: string | null; companions?: number; rsvpMessage?: string }[] = [
  { name: 'Nguyễn Văn An', status: 'pending', email: RECIPIENT },
  { name: 'Trần Thị Bích', status: 'pending', email: null },
  { name: 'Lê Hoàng Long', status: 'pending', email: null },
  { name: 'Phạm Thu Hà', status: 'pending', email: null },
  { name: 'Võ Minh Tuấn', status: 'pending', email: null },
  { name: 'Đặng Ngọc Mai', status: 'attending', email: null, companions: 1, rsvpMessage: 'Mình sẽ đến cùng chồng nhé!' },
  { name: 'Bùi Quốc Khánh', status: 'declined', email: null, rsvpMessage: 'Rất tiếc mình bận công tác.' },
  { name: 'Hoàng Gia Huy', status: 'pending', email: null }, // không có email: không được nhắc
];

/** Tạo bảng event_reminders nếu chưa có. Chỉ tạo đúng một bảng này, không đụng các bảng khác. */
const CREATE_EVENT_REMINDERS = [
  'CREATE TABLE IF NOT EXISTS event_reminders (',
  '  _id char(24) NOT NULL PRIMARY KEY,',
  '  createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),',
  '  updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),',
  '  invitation char(24) NOT NULL,',
  '  owner char(24) NOT NULL,',
  '  daysBefore int NOT NULL,',
  '  enabled tinyint(1) NOT NULL DEFAULT 1,',
  "  status enum('scheduled','sending','sent','skipped') NOT NULL DEFAULT 'scheduled',",
  '  sendAt datetime NULL,',
  '  claimedAt datetime NULL,',
  '  `cursor` char(24) NULL,',
  '  sentCount int NOT NULL DEFAULT 0,',
  '  failedCount int NOT NULL DEFAULT 0,',
  '  sentAt datetime NULL,',
  '  INDEX IDX_event_reminders_status_sendAt (status, sendAt),',
  '  UNIQUE INDEX UQ_event_reminders_invitation_daysBefore (invitation, daysBefore)',
  ") DEFAULT CHARSET=utf8mb4",
].join('\n');

async function ensureEventRemindersTable(ds: DataSource): Promise<void> {
  await ds.query(CREATE_EVENT_REMINDERS);
  console.log('Bảng event_reminders đã sẵn sàng.');
}

async function main() {
  const ownerEmail = required('SEED_OWNER_EMAIL').toLowerCase();
  const ownerUsername = (process.env.SEED_OWNER_USERNAME ?? 'demo-owner').trim();
  const sendNow = process.env.SEED_SEND_NOW === 'true';
  const frontend = (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',')[0].trim().replace(/\/+$/, '');
  const publicPath = process.env.PUBLIC_EVENT_PATH ?? '/events/view';

  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    charset: 'utf8mb4',
    timezone: 'Z',
    entities: [User, Invitation, Guest, EventReminder],
    synchronize: false,
  });
  await ds.initialize();
  await ensureEventRemindersTable(ds);

  try {
    const userRepo = ds.getRepository(User);
    const invRepo = ds.getRepository(Invitation);
    const guestRepo = ds.getRepository(Guest);
    const remRepo = ds.getRepository(EventReminder);

    // 1) Tài khoản chủ thiệp: dùng tài khoản có sẵn, hoặc tạo mới nếu có SEED_OWNER_PASSWORD
    let owner = await userRepo.findOne({ where: { email: ownerEmail } });
    if (!owner) {
      const password = process.env.SEED_OWNER_PASSWORD?.trim() ?? '';
      if (password.length < 8) throw new Error(`Tài khoản ${ownerEmail} chưa tồn tại: cần SEED_OWNER_PASSWORD (tối thiểu 8 ký tự) để tạo mới`);
      const taken = await userRepo.findOne({ where: { username: ownerUsername } });
      if (taken) throw new Error(`Username "${ownerUsername}" đã có người dùng khác. Đặt SEED_OWNER_USERNAME khác.`);
      owner = await userRepo.save(
        userRepo.create({
          username: ownerUsername,
          email: ownerEmail,
          password: await bcrypt.hash(password, 12),
          fullName: 'Chủ thiệp demo',
          role: 'user',
          isActive: true,
        }),
      );
      console.log(`Đã tạo tài khoản chủ thiệp: ${ownerUsername}`);
    } else {
      console.log('Dùng tài khoản chủ thiệp có sẵn.');
    }

    // 2) Xoá thiệp demo cũ (nếu có) để chạy lại được
    const old = await invRepo.findOne({ where: { slug: DEMO_SLUG } });
    if (old) {
      if (old.owner !== owner._id) throw new Error(`Slug "${DEMO_SLUG}" đã thuộc tài khoản khác.`);
      await remRepo.delete({ invitation: old._id });
      await guestRepo.delete({ invitation: old._id });
      await invRepo.delete({ _id: old._id });
      console.log('Đã xoá thiệp demo cũ.');
    }

    // 3) Thiệp đã xuất bản, sự kiện trong tương lai
    const eventDate = eventAt17hVN(sendNow ? 7 : 10);
    const dateText = eventDate.toLocaleDateString('vi-VN', {
      weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
    });
    const title = 'Lễ thành hôn Minh Anh & Quốc Bảo';
    const inv = await invRepo.save(
      invRepo.create({
        owner: owner._id,
        title,
        slug: DEMO_SLUG,
        eventType: 'wedding',
        status: 'published',
        publishedAt: new Date(),
        eventDate,
        info: {
          title,
          description: 'Hai gia đình trân trọng kính mời bạn đến chung vui.',
          host: 'Gia đình Minh Anh & Quốc Bảo',
          date: dateText,
          time: '17:00',
          venue: 'Nhà hàng Sen Hồ',
          address: '12 Nguyễn Huệ, Quận 1, TP.HCM',
        },
        page: {},
        design: {},
        settings: {
          ...DEFAULT_SETTINGS,
          emailSubject: `Thiệp mời: ${title}`,
          emailMessage: 'Hai gia đình rất hân hạnh được đón bạn đến chung vui cùng chúng tôi.',
          salutationStyle: 'Trân trọng kính mời',
          maxCompanions: 2,
        },
        budget: {},
        tasks: [],
        views: 0,
      }),
    );

    // 4) Khách mời (mỗi khách có token riêng cho link cá nhân hoá)
    const guests: { name: string; email: string | null; token: string; status: string }[] = [];
    for (const p of PEOPLE) {
      const email = p.email;
      const token = randomBytes(16).toString('hex');
      await guestRepo.save(
        guestRepo.create({
          invitation: inv._id,
          owner: owner._id,
          name: p.name,
          email,
          status: p.status,
          companions: p.companions ?? 0,
          giftAmount: 0,
          rsvpMessage: p.rsvpMessage ?? null,
          respondedAt: p.status === 'pending' ? null : new Date(),
          token,
          emailStatus: 'not-sent',
          emailAttempts: 0,
        }),
      );
      guests.push({ name: p.name, email, token, status: p.status });
    }

    // 5) Lịch nhắc 7 / 3 / 1 ngày trước (giống khi chủ thiệp bấm "Thêm lịch nhắc" và lưu)
    for (const d of DAYS_BEFORE) {
      let sendAt = computeSendAt(eventDate, d);
      if (sendNow && d === 7) sendAt = new Date(Date.now() - 60_000); // đã đến giờ -> bộ gửi nhận ở lần quét kế tiếp
      await remRepo.save(
        remRepo.create({
          invitation: inv._id,
          owner: owner._id,
          daysBefore: d,
          enabled: true,
          status: 'scheduled',
          sendAt,
          sentCount: 0,
          failedCount: 0,
        }),
      );
    }

    // 6) Tóm tắt
    const reminderCount = DAYS_BEFORE.length;
    console.log('\n=== Đã tạo thiệp demo nhắc lịch ===');
    console.log(`Chủ thiệp: ${ownerEmail}`);
    console.log(`Thiệp: "${title}" (slug: ${DEMO_SLUG})`);
    console.log(`Sự kiện: ${dateText} lúc 17:00 (giờ Việt Nam)`);
    console.log(`Khách: ${guests.length} người, ${guests.filter((g) => g.status === 'pending' && g.email).length} khách chưa trả lời có email sẽ được nhắc.`);
    console.log(`Lịch nhắc: ${reminderCount} lịch (${DAYS_BEFORE.join(', ')} ngày trước), gửi lúc 08:00 giờ Việt Nam.`);
    console.log(sendNow ? 'Chế độ SEND_NOW: lịch 7 ngày sẽ được gửi ở lần quét kế tiếp của backend (mặc định 10 phút).' : 'Các lịch sẽ tự gửi đúng ngày.');
    console.log(`\nĐường dẫn thử (xem thiệp như khách):`);
    for (const g of guests) console.log(`  - ${g.name} [${g.status}]: ${frontend}${publicPath}?id=${DEMO_SLUG}&guestId=${g.token}`);
    console.log('\nLưu ý: gửi email thật cần EMAIL_USER và EMAIL_PASS trong .env. Để trống, backend chỉ ghi email ra log.');
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Seed demo nhắc lịch lỗi:', err instanceof Error ? err.message : err);
  process.exit(1);
});
