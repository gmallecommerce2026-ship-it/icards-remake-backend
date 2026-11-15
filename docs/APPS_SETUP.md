# Cấu hình Ứng dụng trong trình thiết kế

Panel **Ứng dụng** ở sidebar trình thiết kế gồm ba nhóm. Tài liệu này hướng dẫn bật từng tính năng thật sự trên máy chủ.

| Ứng dụng | Trạng thái trong code | Cần gì để chạy |
|---|---|---|
| Mã QR | Đã chạy (không cần cấu hình) | Không |
| Biểu tượng cảm xúc | Đã chạy (không cần cấu hình) | Không |
| **AI viết lời chúc** | **Đã có backend và giao diện** | Khóa API Anthropic (hướng dẫn bên dưới) |
| AI tạo hình ảnh, AI xóa nền | Chưa có code | Nhà cung cấp và code mới |
| Google Drive, Pinterest, Dropbox, Figma | Chưa có code | OAuth và lưu token theo người dùng, xem phần cuối |

---

## 1. Bật AI viết lời chúc

### Bước 1: Lấy khóa API
1. Đăng nhập tại https://console.anthropic.com.
2. Vào **Settings → Billing**, nạp tiền hoặc thêm thẻ. Tính năng không chạy nếu tài khoản chưa có số dư.
3. Vào **Settings → API Keys → Create Key**, đặt tên ví dụ `icards-prod`.
4. Sao chép khóa (bắt đầu bằng `sk-ant-...`). Khóa chỉ hiện một lần.

### Bước 2: Đặt khóa trên máy chủ
Trên VPS, mở file `.env` của backend:
```bash
cd ~/icards-backend
nano .env
```
Thêm hoặc sửa hai dòng:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
AI_MODEL=claude-haiku-5-5
```
`AI_MODEL` có thể để trống, khi đó dùng `claude-haiku-5-5`. Model nhanh và rẻ, đủ cho lời chúc. Muốn chất lượng cao hơn, dùng một model lớn hơn trong danh sách model của Anthropic.

**Không** đưa khóa vào mã nguồn, không commit `.env` lên git, và không gửi khóa qua chat.

### Bước 3: Build lại và khởi động lại API
```bash
npm run build:once
pm2 restart icards-api
pm2 logs icards-api --lines 20 --nostream
```

### Bước 4: Kiểm tra bằng lệnh
Thay `EMAIL` và `MATKHAU` bằng tài khoản admin của bạn:
```bash
curl -s -c /tmp/j.txt -H 'Content-Type: application/json' \
  -d '{"login":"EMAIL","password":"MATKHAU"}' http://127.0.0.1:5000/api/auth/login > /dev/null

curl -s -b /tmp/j.txt -H 'Content-Type: application/json' \
  -d '{"occasion":"Đám cưới","recipient":"Anh Minh và chị Lan","tone":"lang-man","count":3}' \
  http://127.0.0.1:5000/api/apps/ai/text
```
Kết quả đúng là JSON dạng `{"suggestions":["...","...","..."]}`.

### Bước 5: Kiểm tra trong trình thiết kế
Mở studio, chọn **Ứng dụng → Trợ lý AI → AI viết lời chúc**, nhập dịp rồi bấm **Tạo gợi ý**. Bấm **Chèn** để đưa lời chúc vào thiệp.

---

## 2. Bảng xử lý lỗi

| Thông báo trên giao diện | Nguyên nhân | Cách xử lý |
|---|---|---|
| Chưa cấu hình AI trên máy chủ (503) | Chưa điền `ANTHROPIC_API_KEY` hoặc chưa restart | Kiểm tra `.env`, chạy `pm2 restart icards-api` |
| Dịch vụ AI trả lỗi (401) | Khóa sai hoặc đã bị thu hồi | Tạo khóa mới trên console, cập nhật `.env` |
| Dịch vụ AI trả lỗi (402 hoặc 403) | Hết số dư hoặc không có quyền dùng model | Nạp tiền, hoặc đổi `AI_MODEL` sang model được cấp quyền |
| Dịch vụ AI trả lỗi (429) | Vượt giới hạn tốc độ của Anthropic | Đợi một lúc, hoặc nâng hạn mức trên console |
| Không kết nối được dịch vụ AI (502) | Máy chủ không ra được api.anthropic.com | Kiểm tra firewall và DNS của VPS |
| Too Many Requests (429 từ API icards) | Một người dùng gọi quá 10 lần mỗi phút | Bình thường, chờ rồi thử lại |

## 3. Chi phí và giới hạn
- Mỗi lần bấm **Tạo gợi ý** là một lượt gọi AI tính tiền theo token. Với model nhỏ, chi phí rất thấp, nhưng vẫn là chi phí thật.
- Backend giới hạn **10 lượt mỗi phút cho mỗi IP**. Để kiểm soát tổng chi phí, hãy đặt **usage limit** trên console Anthropic.
- Khóa API không bao giờ được gửi xuống trình duyệt. Trình duyệt chỉ gọi `/api/apps/ai/text`.

---

## 4. Các tính năng còn lại (chưa có code)

### Google Drive
Cần làm theo thứ tự:
1. Tạo project tại https://console.cloud.google.com, bật **Google Drive API**.
2. Vào **OAuth consent screen**, chọn External, thêm scope `drive.readonly`.
3. Vào **Credentials → Create OAuth client ID**, loại **Web application**, thêm redirect URI `https://api.<domain>/api/apps/gdrive/callback`.
4. Đặt `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET` trong `.env`.

Sau đó cần code mới: luồng OAuth, lưu refresh token theo từng người dùng (cần bảng mới), và API liệt kê ảnh trong Drive. Chưa làm trong bản này.

### Pinterest
Cần tài khoản Pinterest Developer, tạo app, và xin quyền đọc ghim. Pinterest duyệt app mất vài tuần. Chỉ làm sau khi có quyền được duyệt.

### Dropbox, Figma
Cùng mô hình OAuth như Google Drive. Làm sau Google Drive.

Khi cần, báo lại để tiếp tục làm phần Google Drive.
