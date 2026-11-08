# Kiểu chữ tên mẫu thiệp (font riêng cho từng mẫu / danh mục)

Tên mẫu hiện trên thẻ "Mẫu thiệp nổi bật" (trang chủ). Kiểu chữ nằm ở `site_content`, khóa `template.titleStyles`.
Không cần đổi cấu trúc bảng nên không cần migration.

## Định dạng

```json
{
  "default":            { "font": "sans", "weight": 600, "size": 18, "color": "#ffffff", "align": "center" },
  "category:wedding":   { "font": "script", "weight": 400, "size": 30 },
  "cuoi-cam-tu":        { "font": "serif", "size": 24, "uppercase": true }
}
```

Thứ tự ưu tiên, theo từng trường: `default` < `category:<wedding|birthday|baby|event>` < `<slug mẫu>`.
Nghĩa là mẫu mới tạo trên dashboard chỉ cần ghi thêm một khóa theo slug của nó, các trường bỏ trống sẽ lấy từ danh mục rồi từ `default`.

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

Giá trị ngoài danh sách bị bỏ khi đọc (`src/templates/title-style.ts`). API trả về trường `titleStyle` trong mỗi mẫu thiệp.

## Dashboard sau này

Khi tạo hoặc sửa mẫu, đọc khóa `template.titleStyles`, đặt `map[slug] = style`, rồi ghi lại (nên dùng `sanitizeTitleStyle` để kiểm tra trước khi lưu).

## Thêm font mới

1. Thêm khóa vào `TITLE_FONT_KEYS` (`src/catalog/catalog.types.ts`).
2. Thêm khóa và tên font vào `TITLE_FONTS` (`src/lib/title-style.ts` ở FE).
3. Nạp font ở FE: thêm vào `FONTS` trong `scripts/build-local-fonts.mjs`, chạy `npm run fonts:build`, commit `public/fonts` và `src/styles/local-fonts.css`.
