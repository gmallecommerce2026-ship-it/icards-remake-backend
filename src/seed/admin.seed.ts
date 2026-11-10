// Tạo hoặc cập nhật tài khoản quản trị. Không ghi mật khẩu vào mã nguồn: truyền qua biến môi trường.
//   ADMIN_EMAIL=... ADMIN_PASSWORD='...' [ADMIN_USERNAME=admin] npm run seed:admin
// Chạy lại sẽ đặt lại mật khẩu và bảo đảm role=admin, isActive=true.
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
  const email = required('ADMIN_EMAIL').toLowerCase();
  const password = required('ADMIN_PASSWORD');
  if (password.length < 8 || password.length > 72) throw new Error('ADMIN_PASSWORD phải từ 8 đến 72 ký tự');

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
    const hash = await bcrypt.hash(password, 12);
    const byUsername = await repo.findOne({ where: { username } });
    const byEmail = await repo.findOne({ where: { email } });
    if (byEmail && byEmail._id !== byUsername?._id) throw new Error(`ADMIN_EMAIL "${email}" đã thuộc tài khoản khác`);

    if (byUsername) {
      await repo.update({ _id: byUsername._id }, { email, password: hash, role: 'admin', isActive: true });
      console.log(`Đã cập nhật tài khoản admin "${username}" (đặt lại mật khẩu, role=admin).`);
    } else {
      await repo.save(
        repo.create({ username, email, password: hash, fullName: 'Quản trị viên', role: 'admin', isActive: true }),
      );
      console.log(`Đã tạo tài khoản admin "${username}".`);
    }
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Seed admin lỗi:', err instanceof Error ? err.message : err);
  process.exit(1);
});
