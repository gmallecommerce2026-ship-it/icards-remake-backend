// Thêm MỘT tài khoản admin mới. Chỉ INSERT: nếu tên đăng nhập hoặc email đã tồn tại thì KHÔNG sửa gì, chỉ báo và thoát.
// Không đụng tới user, dữ liệu, mật khẩu hay role của các tài khoản hiện có.
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
    const existing = await repo.findOne({ where: [{ username }, { email }] });
    if (existing) {
      console.log(
        `Không thêm: đã có tài khoản trùng tên đăng nhập hoặc email ` +
          `(username="${existing.username}", email="${existing.email}"). Dữ liệu hiện có được giữ nguyên.`,
      );
      return;
    }
    const hash = await bcrypt.hash(password, 12);
    await repo.insert({
      username,
      email,
      password: hash,
      fullName: 'Quản trị viên',
      role: 'admin',
      isActive: true,
    });
    console.log(`Đã thêm tài khoản admin mới "${username}" (${email}).`);
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Thêm admin lỗi:', err instanceof Error ? err.message : err);
  process.exit(1);
});
