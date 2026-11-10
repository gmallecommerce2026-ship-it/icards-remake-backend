-- Cây danh mục mẫu thiệp chuyển sang bảng riêng; mẫu gắn nhóm qua categoryId (lọc theo nhóm ở backend).
-- Chỉ cần chạy khi DB_SYNCHRONIZE=false (production). Khi DB_SYNCHRONIZE=true, TypeORM tự làm việc này.
-- Sau khi chạy, khởi động lại API (SEED_ON_BOOT=true sẽ nạp phần còn thiếu) hoặc chạy:  npm run seed -- --repair
-- Seed v15 gán nhóm cho mẫu còn trống và cập nhật menu header (danh mục thiệp, rồi Chuyên nghiệp, Cửa hàng, Sự kiện, Tin tức).
-- Bảng site_content khóa 'templates.tree' không còn được dùng và có thể xóa sau khi kiểm tra.

CREATE TABLE IF NOT EXISTS `template_category_nodes` (
  `_id` char(24) NOT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `slug` varchar(100) NOT NULL,
  `label` varchar(200) NOT NULL,
  `parentId` char(24) DEFAULT NULL,
  `keyPath` varchar(500) NOT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`_id`),
  UNIQUE KEY `IDX_4bd4377f4da8c84f307857b522` (`slug`),
  KEY `IDX_6f3cb57c3a4e10e6164621993c` (`parentId`),
  KEY `IDX_b5d6750880242752129fa51406` (`keyPath`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `invitation_templates`
  ADD COLUMN `categoryId` char(24) DEFAULT NULL AFTER `slug`,
  ADD KEY `IDX_540f32a7581647b372355d11a1` (`categoryId`),
  ADD CONSTRAINT `FK_540f32a7581647b372355d11a1f` FOREIGN KEY (`categoryId`) REFERENCES `template_category_nodes` (`_id`) ON DELETE SET NULL ON UPDATE NO ACTION;
