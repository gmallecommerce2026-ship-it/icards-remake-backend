# iCards API — Contract (Phase 1)

Base URL: `{HOST}/api` (global prefix `api`). Swagger: `{HOST}/docs`.
Auth: JWT trong **cookie httpOnly** `icards_token` (hoặc `Authorization: Bearer`). FE axios đã có `withCredentials: true`.
Lỗi: `{ statusCode, message: string | string[], error }` (chuẩn NestJS). 401 = chưa đăng nhập, 404 = không tồn tại *hoặc không phải của bạn*.
🔒 = cần đăng nhập · 🌐 = công khai.

## Luồng gửi thiệp (phần FE đang bị cụt)
```
Studio "Tiếp theo" → EventDetailsEditor "Thêm khách mời"
  1. POST /invitations (multipart)                    → { _id, slug, ... }
  2. router.push(/invitation-management/{_id}/guests)
  3. GET  /invitations/{id}/guests  · POST …/guests · POST …/guests/bulk · GET …/guest-groups
  4. PUT  …/guests/{gid}/send-email   hoặc   POST …/guests/bulk-send-email   (tự công khai thiệp)
  5. Khách mở email → {FRONTEND_URL}/events/view?id={slug}&guestId={token}
        GET /invitations/public/{slug}?guestId={token}        → dữ liệu thiệp + guest
        PUT /invitations/{slug}/guests/{token}/rsvp           → xác nhận tham dự
        POST /wishes/public/{slug}                            → gửi lời chúc
```
`guestId` trong link công khai là **token bí mật** của khách (`guest.token`), KHÔNG phải `_id` Mongo.
`{id}` công khai nhận cả `_id` lẫn `slug`.

## Auth 🌐 (`/auth`)
| Method | Path | Body | Trả về |
|---|---|---|---|
| POST | /auth/register | `{username, email, password≥8}` | `{user}` + set cookie |
| POST | /auth/login | `{login (username|email), password}` | `{user}` + set cookie |
| POST | /auth/logout | – | `{message}` (xoá cookie) |
| POST | /auth/forgot-password | `{email}` | `{message}` (luôn 200) |
| PATCH | /auth/reset-password/:token | `{password}` | `{message}` — link mail: `{FRONTEND_URL}/reset-password?token=…` |

`user` = `{_id, username, email, fullName?, phone?, avatar?, role, createdAt}`

## Users 🔒 (`/users`)
GET `/users/me` → user · PUT `/users/me` `{fullName?, phone?, email?}` · PUT `/users/me/avatar` (multipart, field `avatar`) → `{avatar}` ·
PUT `/users/me/change-password` `{currentPassword, newPassword}` · GET `/users/me/personal-images` → `{images:string[]}` ·
POST `/users/me/upload-images` (multipart, field `images`, ≤10 file ≤5MB) → `{uploaded, images}` · DELETE `/users/me/personal-images` body `{urls:string[]}` → `{images}`

## Invitations (`/invitations`)
| | Method | Path | Ghi chú |
|---|---|---|---|
| 🌐 | GET | /invitations/public/:idOrSlug?guestId=token | `{_id,slug,title,eventType,templateSlug,eventDate,cover,info,page,design,settings,guest:{name,status,companions}|null}`; chỉ thiệp `published` |
| 🔒 | GET | /invitations | danh sách của tôi, mỗi item có `stats` |
| 🔒 | POST | /invitations | **multipart** (xem dưới) |
| 🔒 | GET | /invitations/:id | đầy đủ + `stats` |
| 🔒 | PUT | /invitations/:id | multipart, mọi field tuỳ chọn |
| 🔒 | DELETE | /invitations/:id | xoá luôn khách, nhóm, lời chúc |
| 🔒 | PUT | /invitations/:id/publish | `{published:boolean}` *(mới, FE api chưa có)* |
| 🔒 | PUT | /invitations/:id/settings | `{allowRsvp?, allowWishes?, moderateWishes?, showGuestList?, maxCompanions?(0-20), rsvpDeadline?}` |
| 🔒 | PUT | /invitations/:id/budgetRequest | `{total?, items?:[{name,estimate?,actual?,paid?,note?}]}` *(giả định cấu trúc — chỉnh khi làm tab Ngân sách)* |
| 🔒 | GET/PUT | /invitations/:id/tasks | PUT body `{tasks:[{_id?,title,done?,dueDate?,category?,note?}]}` (thay toàn bộ) |

**POST/PUT /invitations (multipart/form-data hoặc JSON):**
`title`* · `eventType` (wedding|birthday|baby|event) · `templateSlug` · `eventDate` (ISO) · `status` (draft|published) · `coverUrl` · file `cover` ·
`info` = JSON string của `EventPageData.info` · `page` = JSON `{styleId, accent, bg, blocks}` · `design` = JSON `{pages, backdrops, envelope:{color,liner,stampId,recipientName}}`.
Ảnh data-URL trong `info/page/design` được tự đẩy lên R2 và thay bằng URL (khi R2 đã cấu hình).
`stats` = `{totalGuests, attending, declined, pending, giftTotal, headcount, emailSent, emailFailed}`.

## Khách mời 🔒 (`/invitations/:id/…`)
| Method | Path | Body / Query |
|---|---|---|
| GET | /guests | `?page&limit&search&groupId&status(pending|attending|declined|not-attending)&emailStatus(sent|failed|not-sent)` → `{items,total,page,limit,pages,stats}` |
| POST | /guests | `{name*, email?, phone?, group? (TÊN nhóm, tự tạo), groupId?, companions?, giftAmount?, note?}` — khớp `AddGuestModal` |
| POST | /guests/bulk | `{guests:[…như trên]}` ≤500 → `{created, skipped:[{index,name,reason}], guests}` |
| PUT | /guests/bulk-update | `{ids:[…], update:{groupId?|null, status?, companions?, giftAmount?}}` → `{matched,modified}` |
| POST | /guests/bulk-delete | `{ids}` → `{deleted}` |
| POST | /guests/bulk-send-email | `{ids?, onlyUnsent?, message?}` ≤300 → `{total,sent,failed,skipped,results[]}` |
| PUT | /guests/:gid | cập nhật (kèm `status` để xác nhận hộ) |
| DELETE | /guests/:gid | |
| PUT | /guests/:gid/send-email | `{message?}` → guest; 502 nếu SMTP lỗi |
| GET/POST | /guest-groups | `{name*, color?}`; GET trả kèm `guestCount` |
| PUT/DELETE | /guest-groups/:groupId | xoá nhóm → khách về "không nhóm" |
| GET | /master-guests | 🔒 `?page&limit&search` danh bạ tự động tích luỹ từ mọi thiệp |
| PUT | 🌐 /invitations/:idOrSlug/guests/:token/rsvp | `{status: attending|declined, companions?, message?}` → `{name,status,companions}` |

Guest: `{_id,name,email,phone,group:{_id,name,color}|null,status,companions,giftAmount,note,emailStatus(not-sent|sent|failed),emailSentAt,emailError,token}`.

## Lời chúc (`/wishes`)
🌐 GET `/wishes/public/:idOrSlug` (chỉ đã duyệt) · 🌐 POST `/wishes/public/:idOrSlug` `{name, message, guestId?(token)}` (5 lần/phút) ·
🔒 GET `/wishes/admin/:invitationId?page&limit` → `{items,total,pending,…}` · 🔒 PUT `/wishes/:wishId` `{isApproved?, message?}` · 🔒 DELETE `/wishes/:wishId`

## Chưa làm (Phase 2): `/invitation-templates`, `/template-blocks`, `/fonts`, `/design-assets`, `/products`, `/pages`, `/public/*`, social login.
