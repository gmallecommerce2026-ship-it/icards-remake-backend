-- Thêm kiểu thiệp 2 mặt (card) và kiểu dáng (ngang / vuông / dọc) cho bảng mẫu thiệp.
-- Chỉ cần chạy khi DB_SYNCHRONIZE=false (production). Khi DB_SYNCHRONIZE=true, TypeORM tự làm việc này.
-- Mẫu cũ tự nhận format='folding', orientation='portrait' nên không ảnh hưởng.
-- Sau khi chạy, khởi động lại API rồi nạp seed bổ sung:  npm run seed -- --repair

ALTER TABLE `invitation_templates`
  ADD COLUMN `format` ENUM('folding', 'card') NOT NULL DEFAULT 'folding' AFTER `isPublished`,
  ADD COLUMN `orientation` ENUM('landscape', 'square', 'portrait') NOT NULL DEFAULT 'portrait' AFTER `format`,
  ADD COLUMN `layout` JSON NULL AFTER `orientation`,
  ADD INDEX `IDX_invitation_templates_format` (`format`),
  ADD INDEX `IDX_invitation_templates_orientation` (`orientation`);
