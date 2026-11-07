# iCards API (NestJS)

Backend cho iCards: thiệp mời điện tử. Tài liệu endpoint: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) · Lộ trình & prompt: [`docs/TASKS_AND_PROMPTS.md`](docs/TASKS_AND_PROMPTS.md) · Swagger: `/docs`.

## Chạy thử
```bash
cp .env.example .env      # điền DB_* (MySQL) và JWT_SECRET (≥32 ký tự)
npm install
npm run dev               # hoặc: npm run start:dev
```
- Chưa điền `EMAIL_USER/EMAIL_PASS` → gửi email ở chế độ **DRY-RUN**: link thiệp được in ra console backend.
- Chưa điền cấu hình R2 → upload ảnh bị tắt (ảnh data-URL trong thiết kế được giữ nguyên trong DB, tối đa ~12MB/thiệp).
- Cookie: dev `SameSite=Lax`; production mặc định `SameSite=None; Secure` (cần HTTPS). Đổi bằng `COOKIE_SAME_SITE`.

## Cấu trúc
```
src/
  common/       guard JWT, decorator, pipe, tiện ích (slug, duration, escape-html)
  mail/         nodemailer (email thiệp mời, quên mật khẩu)
  storage/      Cloudflare R2 (S3 API)
  auth/ users/  đăng ký/đăng nhập (cookie JWT), hồ sơ, ảnh cá nhân
  invitations/  thiệp (design/page/info JSON), cài đặt, ngân sách, kế hoạch, link công khai
  guests/       khách mời, nhóm, danh bạ, gửi email, RSVP công khai
  wishes/       sổ lưu bút (công khai + duyệt)
  templates/ pages/ products/ settings/   (còn là stub — Phase 2)
```

## Lưu ý quan trọng
- Link trong email: `{FRONTEND_URL}{PUBLIC_EVENT_PATH}?id=<slug>&guestId=<token>`; `guestId` là token bí mật của khách.
- Gửi email lần đầu sẽ tự chuyển thiệp sang `published`.
- Mã nguồn dùng ESM: mọi import nội bộ phải có đuôi `.js`.
