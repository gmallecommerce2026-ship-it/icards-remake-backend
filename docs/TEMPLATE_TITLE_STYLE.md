# Kiểu chữ tên danh mục mẫu thiệp (font riêng cho từng danh mục)

Tên danh mục hiện trên khối "Những dịp lan tỏa niềm vui" (trang chủ). Mỗi khối có thể cài một font riêng.
Kiểu chữ nằm ngay trong khóa `template.blocks` (site_content), ở trường `titleStyle` của từng khối. Không cần đổi cấu trúc bảng nên không cần migration tay. Khi nâng lên `SEED_VERSION` 7, migration tự thêm kiểu mặc định cho các khối đang có.

Kiểu chữ theo từng mẫu thiệp ("mẫu thiệp nổi bật") đã bỏ: thẻ mẫu dùng một kiểu chữ chung trên toàn trang.

## Định dạng

```json
{
  "slug": "wedding",
  "title": "Thiệp cưới",
  "isActive": true,
  "templateSlugs": ["..."],
  "titleStyle": { "font": "script", "weight": 400, "size": 26, "color": "#3b2f2a", "align": "center" }
}
```

Trường `titleStyle` có thể bỏ trống. Khi bỏ trống, FE dùng kiểu mặc định của khối (sans, 600, 14px, chữ hoa, màu #222222).
Các trường không ghi thì cũng lấy mặc định, nên có thể chỉ ghi `font` và `color`.

## Trường

| Trường | Giá trị |
| --- | --- |
| `font` | `sans` · `serif` · `script` · `display` · `mono` |
| `weight` | 100 đến 900, bước 100 |
| `size` | 12 đến 40 (px) |
| `color` | `#rgb`, `#rrggbb`, `#rrggbbaa` |
| `align` | `left` · `center` · `right` |
| `uppercase` | `true` / `false` |
| `letterSpacing` | -0.05 đến 0.3 (em) |

Giá trị ngoài danh sách bị bỏ khi đọc (`sanitizeTitleStyle` trong `src/templates/title-style.ts`). API `GET /template-blocks` trả về `titleStyle` đã lọc.

## Điểm mở rộng cho dashboard

Mọi đọc/ghi khối dịp đi qua `TemplateBlocksService` (`src/templates/template-blocks.service.ts`). Chưa có route ghi và chưa có UI, nên hiện chưa có gì đổi dữ liệu từ bên ngoài. Khi làm dashboard, chỉ cần thêm controller admin (có `RolesGuard`) gọi các hàm sau:

- `getBlocks()`: đọc toàn bộ khối, đã chuẩn hóa.
- `saveBlocks(blocks)`: ghi cả danh sách. Kiểm tra từng khối, từ chối slug trùng (400).
- `setTitleStyle(slug, style)`: đổi kiểu chữ một danh mục. `style = null` để xóa và về mặc định. Font lạ hoặc slug không có thì trả 400 / 404.

Dữ liệu luôn đi qua `sanitizeTitleStyle` trước khi lưu, nên dashboard không thể chèn CSS tùy ý.
Test: `src/templates/template-blocks.service.spec.ts` (chạy bằng `npx vitest run`).

## Thêm font mới

1. Thêm khóa vào `TITLE_FONT_KEYS` (`src/catalog/catalog.types.ts`).
2. Thêm khóa và tên font vào `TITLE_FONTS` (`src/lib/title-style.ts` ở FE).
3. Nạp font ở FE: thêm vào `FONTS` trong `scripts/build-local-fonts.mjs`, chạy `npm run fonts:build`, commit `public/fonts` và `src/styles/local-fonts.css`.
