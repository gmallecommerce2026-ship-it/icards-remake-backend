# Chuyển backend từ MongoDB sang MySQL (TypeORM)

## File thay đổi (ghi đè các file này)
- package.json, package-lock.json  (bỏ @nestjs/mongoose, mongoose; thêm @nestjs/typeorm, typeorm, mysql2)
- .env.example, README.md
- src/app.module.ts
- src/common/entities/base.entity.ts        (MỚI)
- src/common/utils/object-id.ts
- src/mail/mail.service.ts                  (sửa kiểu Transporter)
- src/auth/auth.module.ts, src/auth/auth.service.ts, src/auth/strategies/jwt.strategy.ts
- src/users/users.module.ts, src/users/users.service.ts, src/users/schemas/user.schema.ts
- src/invitations/invitations.module.ts, invitations.service.ts, schemas/invitation.schema.ts
- src/guests/guests.module.ts, guests.service.ts, schemas/guest.schema.ts,
  schemas/guest-group.schema.ts, schemas/master-guest.schema.ts
- src/wishes/wishes.module.ts, wishes.service.ts, schemas/wish.schema.ts

Không đổi: controller, dto, pipe, guard, storage, mail (ngoài kiểu), templates, pages, products, settings, main.ts.

## Trên server
1. Cài MariaDB/MySQL (cần root), tạo DB và user:
   CREATE DATABASE icards CHARACTER SET utf8mb4;
   CREATE USER 'icards'@'localhost' IDENTIFIED BY '<mat-khau>';
   GRANT ALL ON icards.* TO 'icards'@'localhost';
2. Trong .env: thêm DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SYNCHRONIZE=true; có thể xoá MONGO_URI.
3. npm ci && npm run build && pm2 restart icards-api (hoặc pm2 start ecosystem.config.cjs)
4. Sau lần chạy đầu thành công (bảng đã được tạo), đổi DB_SYNCHRONIZE=false.

## Lưu ý
- _id vẫn là chuỗi 24 ký tự hex như ObjectId cũ, nên frontend không phải sửa.
- Dữ liệu Mongo cũ KHÔNG được chuyển sang. DB MySQL bắt đầu trống.
- Ảnh/thiết kế lưu trong cột JSON (giới hạn ~12MB/thiệp như trước).
