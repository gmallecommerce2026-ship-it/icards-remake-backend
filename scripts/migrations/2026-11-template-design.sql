-- Thêm cột thiết kế canvas cho mẫu thiệp (admin lưu từ trình studio).
-- Chỉ cần chạy khi DB_SYNCHRONIZE=false (production). Khi DB_SYNCHRONIZE=true, TypeORM tự làm việc này.
-- Mẫu chưa có thiết kế để NULL: studio vẫn dựng từ dữ liệu mẫu như trước.
ALTER TABLE `invitation_templates`
  ADD COLUMN `design` JSON NULL AFTER `categoryId`;
