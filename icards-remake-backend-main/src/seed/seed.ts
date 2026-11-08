// Nạp dữ liệu danh mục và giao diện vào DB.
//   npm run seed                → nạp phần còn thiếu (bỏ qua nếu đã đúng phiên bản seed)
//   npm run seed -- --force     → ghi đè toàn bộ về dữ liệu gốc (MẤT mọi chỉnh sửa đã làm trên dashboard)
// Cũng có thể bật SEED_ON_BOOT=true để tự nạp mỗi khi khởi động app.
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { InvitationTemplate } from '../templates/schemas/invitation-template.schema.js';
import { Product } from '../products/schemas/product.schema.js';
import { Service } from '../services/schemas/service.schema.js';
import { ServiceRequest } from '../services/schemas/service-request.schema.js';
import { Page } from '../pages/schemas/page.schema.js';
import { FaqItem } from '../pages/schemas/faq-item.schema.js';
import { SiteContent } from '../settings/schemas/site-content.schema.js';
import { seedAll } from './catalog-seeder.js';

const ENTITIES = [InvitationTemplate, Product, Service, ServiceRequest, Page, FaqItem, SiteContent];

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Thiếu biến môi trường ${name}`);
  return v;
}

async function main() {
  const force = process.argv.includes('--force');
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 3306),
    username: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    charset: 'utf8mb4',
    timezone: 'Z',
    entities: ENTITIES,
    synchronize: false,
  });
  await ds.initialize();
  try {
    // Tạo bảng nếu chưa có. Khi production đã tắt DB_SYNCHRONIZE thì bỏ qua.
    if (process.env.DB_SYNCHRONIZE !== 'false') await ds.synchronize();
    const summary = await ds.transaction((m) => seedAll(m, { force }));
    console.log('Seed xong:', JSON.stringify(summary));
  } finally {
    await ds.destroy();
  }
}

main().catch((err) => {
  console.error('Seed lỗi:', err);
  process.exit(1);
});
