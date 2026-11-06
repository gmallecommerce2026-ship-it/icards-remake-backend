# Lộ trình & prompt cho các task tiếp theo

## Đã xong trong gói này (Phase 1 — backend cho luồng gửi thiệp)
`auth` · `users` · `invitations` · `guests` (+ nhóm, danh bạ, gửi email, RSVP) · `wishes` · `mail` · `storage (R2)`.
Chi tiết endpoint: `docs/API_CONTRACT.md`.

## Phát hiện về FE (ảnh hưởng mọi task FE)
1. `next.config.mjs` đang `output: 'export'` + `basePath '/icards-remake'`: **không có rewrites** nên `baseURL "/backend-api"` trong `src/lib/api/http.ts` không bao giờ tới được backend; và route động `/invitation-management/[id]` **không chạy được** với ID thật khi export tĩnh. → Cần bỏ `output:'export'` (deploy Vercel/Node), rồi dùng `NEXT_PUBLIC_API_URL` trực tiếp (backend đã bật CORS + `credentials`, cookie `SameSite=None; Secure` ở production) hoặc thêm `rewrites`.
2. `AuthProvider` đang **mock** (`MOCK_USER`), còn `RequireAuth` lại đọc `loading` mà provider không có.
3. Studio (`EnvelopeDesigner.tsx`) chỉ ghi `localStorage` (`draftKey(slug)` và `icards:event:{slug}`), nút "Thêm khách mời" gọi `saveEvent` rồi `router.push(ROUTES.invitationManagement)` → **không có API nào tạo thiệp** — đây là chỗ cụt.
4. `src/lib/dashboard.ts` là mock; `[id]/page.tsx` là server component dùng mock; `guests/page.tsx` là UI tĩnh (thống kê = 0, bảng rỗng); `/events/view`, `/forgot-password`, `/reset-password` mới là `TODO`.
5. `lib/api/invitations.ts` thiếu `getGuests` và `publishInvitation`; `types.ts` mới là kiểu tối thiểu.

## Thứ tự khuyến nghị
`FE-1 → FE-2 → FE-3 → FE-4 → FE-5` là đường găng để luồng gửi thiệp chạy end-to-end. BE-5…BE-8 làm song song được.

| Task | Nội dung | Phụ thuộc | Đính kèm khi hỏi AI |
|---|---|---|---|
| FE-1 | Nền API + Auth thật | Phase 1 | `API_CONTRACT.md`, `src/lib/api/*`, `providers/AuthProvider.tsx`, `components/RequireAuth.tsx`, `next.config.mjs`, trang sign-in/sign-up |
| FE-2 | Studio → tạo thiệp qua API | FE-1 | `API_CONTRACT.md`, `EnvelopeDesigner.tsx`, `InvitationSendFlow.tsx`, `EventDetailsEditor.tsx` (dòng 100-240), `useEditorStore.ts` (đầu file) |
| FE-3 | Dashboard: danh sách/tổng quan/cài đặt/xoá | FE-1,2 | `API_CONTRACT.md`, `lib/dashboard.ts`, `app/(dashboard)/invitation-management/**` |
| FE-4 | Quản lý khách mời + gửi email | FE-3 | `API_CONTRACT.md`, `[id]/guests/page.tsx`, `AddGuestModal.tsx` |
| FE-5 | Trang thiệp công khai + RSVP + lời chúc | FE-1 | `API_CONTRACT.md`, `components/templates/InvitationPreview.tsx`, `CardFaceStatic.tsx`, `EventDetailsEditor.tsx` |
| FE-6 | Planner/Ngân sách/Profile/Ảnh cá nhân | FE-3 | `API_CONTRACT.md`, các trang tương ứng |
| BE-5 | Templates + design assets + seed | – | `src/lib/templates.ts` (FE), `src/templates/*` |
| BE-6 | Products + Pages(blog/FAQ) + Public settings | – | `src/lib/{shop,blog,faq,services}.ts` (FE) |
| BE-7 | Đăng nhập Google/Facebook | – | `src/auth/*` |
| BE-8 | Test + hardening + Docker | Phase 1 | toàn bộ `src/` |

---
## KHỐI NGỮ CẢNH — dán vào đầu MỌI prompt bên dưới
```
Dự án iCards (thiệp mời điện tử, tiếng Việt). Frontend: Next.js 16 App Router + React 19 + TypeScript + Tailwind 4 + zustand + axios.
Backend: NestJS (ESM, import nội bộ có đuôi .js) + Mongoose + JWT cookie httpOnly. API base: {HOST}/api. Tài liệu endpoint: file API_CONTRACT.md đính kèm — đó là NGUỒN SỰ THẬT, không tự bịa endpoint/field.
Quy tắc: giữ nguyên style code & tên biến hiện có; comment/chuỗi UI bằng tiếng Việt; không đổi route hiện có (src/lib/routes.ts); không thêm thư viện nếu không thật cần (nếu thêm phải nói rõ); không refactor ngoài phạm vi; mọi lời gọi API đi qua src/lib/api/*.
Cách trả lời: (1) liệt kê file sẽ sửa/tạo, (2) đưa TOÀN BỘ nội dung file đã sửa (không dùng "..."), (3) cuối cùng là checklist tự kiểm tra theo tiêu chí nghiệm thu. Nếu thiếu thông tin, hỏi tối đa 1 câu rồi vẫn làm theo giả định hợp lý và nêu rõ giả định.
```

---
## FE-1 — Nền API + Auth thật
**Mục tiêu:** FE nói chuyện được với backend và biết ai đang đăng nhập.
**Làm:**
1. `next.config.mjs`: bỏ `output:'export'` (giữ `images.unoptimized` nếu cần; quyết định giữ/bỏ `basePath` và nêu lý do). Biến môi trường `NEXT_PUBLIC_API_URL` (vd `http://localhost:5000/api`); `src/lib/api/http.ts` dùng nó cho cả browser lẫn SSR, bỏ `adminApi`/`/backend-api` hoặc để `adminApi` trỏ `NEXT_PUBLIC_ADMIN_API_URL` (chưa dùng). Giữ `withCredentials: true`. Interceptor 401 → phát sự kiện để AuthProvider xử lý.
2. `src/lib/api/types.ts`: thêm kiểu `User`, `Invitation` (+`InvitationStats`), `Guest`, `GuestGroup`, `Wish`, `Paginated<T>` đúng theo API_CONTRACT.
3. `src/lib/api/invitations.ts` thêm: `getGuests(id, params)`, `publishInvitation(id, published)` (PUT `/invitations/:id/publish`); `createInvitation`/`updateInvitation` nhận `FormData`.
4. `AuthProvider.tsx`: bỏ MOCK; state `{user, loading}`; mount → `authApi.getMe()` (401 = chưa đăng nhập, không phải lỗi); expose `login(login,password)`, `register(...)`, `logout()`, `refresh()`. Sửa kiểu của context để có `loading`. `RequireAuth` redirect `/sign-in?redirect=…` khi hết loading mà chưa có user.
5. Làm thật các trang `sign-in`, `sign-up`, `forgot-password`, `reset-password` (đọc `?token=`), hiển thị lỗi `message` từ API (có thể là mảng), sau đăng nhập redirect về `?redirect=` nếu có, mặc định `/invitation-management`.
**Nghiệm thu:** đăng ký → tự đăng nhập → F5 vẫn đăng nhập → logout xoá cookie → vào `/invitation-management` khi chưa đăng nhập bị đẩy về sign-in; `npm run build` không lỗi.

## FE-2 — Studio → tạo thiệp qua API (chỗ đang cụt)
**Mục tiêu:** bấm "Thêm khách mời" ở cuối luồng studio thì thiệp được lưu vào DB và chuyển sang trang khách mời của thiệp đó.
**Làm trong `EnvelopeDesigner.tsx` (+ file liên quan):**
1. Thay `onAddGuests` hiện tại (`saveEvent` + `router.push(ROUTES.invitationManagement)`) bằng: gom `{title, eventType (suy từ template.category, mặc định wedding), templateSlug, eventDate (ISO nếu parse được từ info.date+time, không thì bỏ), info: data.info, page: {styleId,accent,bg,blocks}, design: {pages, backdrops, envelope:{color: env.color, liner: liner.background, stampId, recipientName}}}` → `FormData` (field JSON phải `JSON.stringify`) → `invitationsApi.createInvitation`.
2. Lưu lại `_id` thiệp (state/ref hoặc `sessionStorage`) để lần bấm sau gọi `updateInvitation(id, …)` thay vì tạo trùng. Nếu mở studio với `?invitation=<id>` thì nạp thiệp qua `getInvitation` (hydrate `useEditorStore` bằng `design.pages/backdrops`) rồi cho sửa tiếp.
3. `onSave` của `EventDetailsEditor` (nếu có nút Lưu) cũng gọi API (debounce), vẫn giữ `localStorage` làm bản nháp dự phòng khi mất mạng.
4. Trạng thái: đang lưu / lỗi (hiện `message` API, có nút thử lại) / thành công; chặn bấm đúp. Thành công → `router.push(ROUTES.invitationTab(id, 'guests'))`.
5. Ảnh người dùng chèn vào thiệp có thể là data-URL: **không cần** upload riêng, backend tự đẩy lên R2; nhưng cảnh báo khi payload > ~10MB.
**Nghiệm thu:** tạo thiệp từ mẫu → Mongo có document với `design.pages`, `info`, `page`; refresh trang khách mời vẫn thấy thiệp; sửa lại và bấm tiếp không tạo bản trùng; chưa đăng nhập thì bị chặn bởi `RequireAuth`.

## FE-3 — Dashboard: danh sách / tổng quan / cài đặt / xoá
**Làm:** thay `lib/dashboard.ts` (mock) bằng API. Trang danh sách (`invitation-management/page.tsx`) → `getInvitations()` hiển thị `stats`, trạng thái `draft/published`; trang `[id]` → `getInvitation(id)` (do cần dữ liệu động + cookie nên chuyển thành client component hoặc fetch phía client; bỏ `generateMetadata` dựa trên mock). Nút công khai/huỷ công khai → `publishInvitation`; copy link công khai `${origin}/events/view?id=${slug}`; tab Cài đặt → `updateSettings` (allowRsvp, allowWishes, moderateWishes, showGuestList, maxCompanions, rsvpDeadline); tab Xoá → `deleteInvitation` có xác nhận gõ lại tên thiệp. Nút "Chỉnh sửa" mở studio với `?invitation=<id>`. Loading/empty/error state đầy đủ.
**Nghiệm thu:** không còn import `lib/dashboard.ts`; số liệu khớp DB; xoá thiệp xoá luôn khách; build sạch.

## FE-4 — Quản lý khách mời + gửi email
**Làm trên `[id]/guests/page.tsx`:** bảng khách mời nối `getGuests` (phân trang, tìm kiếm debounce, lọc nhóm / trạng thái tham gia / trạng thái email — nhớ FE dùng `not-attending`); 5 ô thống kê lấy từ `stats` (Tổng, Tham gia, Không tham gia, Không xác nhận, Tiền mừng); `AddGuestModal` gọi `addGuest` (modal đã gửi đúng `{name,email,phone,group}`; tải danh sách nhóm từ `getGuestGroups` thay cho 3 nhóm cứng); "Quản lý nhóm" (CRUD nhóm); "Nhập từ Excel" → đọc CSV/XLSX phía client (cột Tên/Email/SĐT/Nhóm) → `bulkAddGuests`, hiển thị `skipped`; "Thêm từ danh bạ" → `getMasterGuests` chọn nhiều → `bulkAddGuests`; "Xuất danh sách" → CSV phía client; checkbox chọn nhiều → xoá (`bulkDeleteGuests`), đổi nhóm/trạng thái (`bulkUpdateGuests` body `{ids, update}`); cột "Gửi thiệp": nút gửi 1 khách (`sendGuestEmail`) và nút "Gửi cho đã chọn / tất cả chưa gửi" (`bulkSendEmail` `{ids?, onlyUnsent}`) có tiến trình + báo `sent/failed/skipped` và badge email `sent/failed/not-sent` (rê chuột xem `emailError`). Gửi email sẽ tự công khai thiệp — hiện thông báo cho người dùng biết.
**Nghiệm thu:** thêm khách → email (hoặc log DRY-RUN ở console backend) có link `…/events/view?id=<slug>&guestId=<token>`; trạng thái email cập nhật; lọc/tìm/phân trang đúng; lỗi 409 trùng email hiển thị thân thiện.

## FE-5 — Trang thiệp công khai + RSVP + lời chúc
**Làm:** `app/(site)/events/view/page.tsx` (client, `useSearchParams`: `id`, `guestId`) → `getPublicInvitation(id,{guestId})`; dựng lại thiệp từ `design` (dùng lại `CardFaceStatic`/`FoldingCard`/`EnvelopeScene` với dữ liệu thật thay vì mẫu), phần "trang thiệp online" từ `info` + `page` (tái dùng phần hiển thị của `EventDetailsEditor` ở chế độ read-only — hãy tách thành `EventPageView`); lời chào theo `guest.name`; form RSVP (`submitRsvp(id, guestId, {status, companions ≤ settings.maxCompanions, message})`, khoá khi `!settings.allowRsvp` hoặc quá `rsvpDeadline`, nhớ trạng thái cũ từ `guest.status`); sổ lưu bút `app/(site)/events/view/wishes` dùng `getPublicWishes/createPublicWish` (chặn gửi liên tục, tôn trọng `allowWishes`). Tab "Quản lý lời chúc" trong dashboard `[id]/wishes`: `getWishesAdmin`, duyệt/ẩn/xoá (`updateWish`/`deleteWish`), hiện số chờ duyệt.
**Nghiệm thu:** mở link trong email ở cửa sổ ẩn danh thấy đúng thiệp + tên khách; RSVP xong dashboard cập nhật; link sai/thiệp chưa công khai → trang 404 thân thiện.

## FE-6 — Planner / Ngân sách / Profile / Ảnh cá nhân
`getTasks/updateTasks` (checklist có hạn, danh mục, tiến độ %), `updateBudgetRequest` (`{total, items[]}` — nếu UI cần thêm field, ghi rõ để cập nhật BE), `account-settings` & `profile` (`updateMe`, `updateAvatar`, `changePassword`), `getPersonalImages/uploadImages/deletePersonalImages` nối vào `ImageUploadField`/panel ảnh của editor (thay `readImage` data-URL bằng URL R2 khi đã đăng nhập).

---
## BE-5 — Templates + Design assets
**Mục tiêu:** `GET /invitation-templates` (`page,limit,category,search,sort`), `GET /invitation-templates/:idOrSlug`, `POST /invitation-templates/:id/view` (tăng `popularity`/`views`), cộng `GET /template-blocks`, `GET /template-blocks/slug/:slug`, `GET /fonts`, `GET /design-assets?type=icon|component|tag`.
**Làm:** schema `Template` bám đúng kiểu `InvitationTemplate` của FE (`slug` unique, `name`, `category: wedding|birthday|event|baby`, `tagline`, `description`, `price` (VND, 0 = miễn phí), `popularity`, `features[]`, `previewImage?`, `motif`, `palette{bg,ink,accent,soft}`, `sample{kicker,titleLines[],date,time,place,address,message}`, `isPublished`); scaffold hiện đang map controller `templates` → route `invitation-templates`; thêm các controller `template-blocks`, `fonts`, `design-assets` (schema đơn giản, chỉ GET công khai). Viết **script seed** `scripts/seed-templates.mjs` đọc 100% dữ liệu từ `TEMPLATES` trong file FE đính kèm (ghi ra JSON rồi nạp, idempotent bằng upsert theo `slug`). Endpoint ghi (POST/PUT/DELETE) chỉ cho `role=admin`: tạo `RolesGuard` + decorator `@Roles('admin')` dùng `JwtAuthGuard` có sẵn.
**Nghiệm thu:** seed 2 lần không nhân đôi; lọc theo category/search/sort `-popularity` đúng; trả đúng shape để FE thay `lib/templates.ts` mà không đổi component.

## BE-6 — Products + Pages + Public settings
**Mục tiêu:** `GET /products` (`category,limit,page,search,sort`), `GET /products/:idOrSlug`; `GET /pages` (`isBlog,isPublished,sort,limit,page`), `GET /pages/faq`, `GET /pages/:slug`, `GET /public/pages/:slug`, `GET /public/page-categories`, `GET /public/topics`; `GET /public/settings` (thông tin liên hệ/branding/SEO). Lưu ý FE hiện gọi settings qua `adminApi` (backend admin riêng) — thêm biến `ADMIN_API_URL` hoặc chuyển về backend này; nêu rõ phương án chọn.
**Làm:** schema bám các kiểu trong file FE đính kèm (`lib/shop.ts`, `lib/blog.ts`, `lib/faq.ts`, `lib/services.ts`); seed script từ dữ liệu FE; endpoint ghi chỉ admin (tái dùng `RolesGuard` của BE-5; nếu chưa có thì tạo). Controller `settings` trong scaffold đang ở route `public/settings`.
**Nghiệm thu:** FE đổi được từ mock sang API không sửa component; phân trang/sort/lọc đúng; chỉ trả `isPublished=true` cho public.

## BE-7 — Đăng nhập Google & Facebook
**Mục tiêu:** `GET /auth/google`, `GET /auth/google/callback`, `GET /auth/facebook`, `GET /auth/facebook/callback` dùng `passport-google-oauth20` / `passport-facebook` (đã có trong package.json). Callback → tìm/tạo user (liên kết theo `googleId`/`facebookId`, nếu trùng email thì gắn vào tài khoản hiện có), set cookie JWT **giống hệt `AuthService.issue`** rồi redirect `FRONTEND_URL` (kèm `?redirect=` đã lưu, dùng `state` chống CSRF, không dùng `SESSION_SECRET` nếu không cần session). Biến env: `CALLBACK_URL`, `GOOGLE_*`, `FACEBOOK_*`. Strategy chỉ khởi tạo khi đủ biến env (thiếu thì bỏ qua + log cảnh báo, không làm sập app). Cập nhật FE: nút "Đăng nhập với Google/Facebook" trỏ tới `${API}/auth/google`.
**Nghiệm thu:** đăng nhập lần đầu tạo user (username sinh unique, `password` rỗng); lần sau không tạo trùng; `changePassword` báo lỗi rõ cho tài khoản MXH.

## BE-8 — Test + Hardening + Docker
Vitest (đã cấu hình): unit test `AuthService`, `GuestsService` (bulk import trùng email, RSVP quá hạn/tắt, bulk-send với mail mock), `InvitationsService` (assertOwner 404, getPublic không lộ owner/budget/tasks, externalize ảnh); e2e bằng `mongodb-memory-server` + `supertest`: luồng register → create invitation (multipart) → add guest → send-email (dry-run) → RSVP công khai → wish → xoá thiệp. Lưu ý: esbuild của Vitest **không phát decorator metadata** → thêm `unplugin-swc` vào `vitest.config*.ts` để DI hoạt động. Hardening: `GET /api/health` (kèm ping Mongo), request-id + logger, lọc log không chứa token/email, bật `NestJS Observe` theo `AGENTS.md` nếu có key, `Dockerfile` đa tầng + `docker-compose.yml` (api + mongo), CI GitHub Actions (lint → test → build), rà soát index Mongo, và liệt kê các thay đổi để chạy được trên môi trường production (CORS, cookie `SameSite=None`, `trust proxy`).
