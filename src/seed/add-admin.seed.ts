// Tạo tài khoản admin, hoặc nếu đã có tài khoản cùng tên đăng nhập thì ghi đè mật khẩu.
// Với tài khoản đã có: chỉ đặt lại mật khẩu, role=admin và isActive=true (để đăng nhập được); các trường khác giữ nguyên.
// Không đụng tới tài khoản user khác hay dữ liệu khác. Nếu email đã thuộc tài khoản khác thì dừng, không ghi gì.
//   ADMIN_PASSWORD='Admin@2025' npm run seed:add-admin
// Tùy chọn: ADMIN_USERNAME (mặc định "admin"), ADMIN_EMAIL (mặc định "admin@icards.com.vn").
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import bcrypt from 'bcrypt';
import { User } from '../users/schemas/user.schema.js';

function required(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Thiếu biến môi trường ${name}`);
  return v;
}

async function main() {
  const username = (process.env.ADMIN_USERNAME ?? 'admin').trim();
  const email = (process.env.ADMIN_EMAIL ?? 'admin@icards.com.vn').trim().toLowerCase();
  const password = required('ADMIN_PASSWORD');
  if (password.length < 8 || password.length > 72) throw new Error('ADMIN_PASSWORD phải từ 8 đến 72 ký tự');
  if (username.length > 40) throw new Error('ADMIN_USERNAME tối đa 40 ký tự');

  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    charset: 'utf8mb4',
    timezone: 'Z',
    entities: [User],
    synchronize: false,
  });
  await ds.initialize();
  try {
    const repo = ds.getRepository(User);
    const byUsername = await repo.findOne({ where: { username } });
    const byEmail = await repo.findOne({ where: { email } });
    if (byEmail && byEmail._id !== byUsername?._id) {
      throw new Error(`ADMIN_EMAIL "${email}" đã thuộc tài khoản khác ("${byEmail.username}"), không ghi gì.`);
    }

    const hash = await bcrypt.hash(password, 12);
    if (byUsername) {
      await repo.update({ _id: byUsername._id }, { password: hash, role: 'admin', isActive: true });
      console.log(`Đã ghi đè mật khẩu của tài khoản "${username}" (role=admin, đang hoạt động).`);
    } else {
      await repo.insert({
        username,
        email,
        password: hash,
        fullName: 'Quản trị viên',
        role: 'admin',
        isActive: true,
      });
      console.log(`Đã tạo tài khoản admin mới "${username}" (${email}).`);
    }
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Thêm admin lỗi:', err instanceof Error ? err.message : err);
  process.exit(1);
});
