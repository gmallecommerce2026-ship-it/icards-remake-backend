-- Quên mật khẩu bằng mã OTP 6 số gửi qua email.
-- Chỉ cần chạy khi DB_SYNCHRONIZE=false (production). Khi DB_SYNCHRONIZE=true, TypeORM tự làm việc này.
-- Không ảnh hưởng dữ liệu cũ: các cột mới đều nullable hoặc có DEFAULT 0.

ALTER TABLE `users`
  ADD COLUMN `resetOtpHash` VARCHAR(128) NULL,
  ADD COLUMN `resetOtpExpires` DATETIME NULL,
  ADD COLUMN `resetOtpAttempts` INT NOT NULL DEFAULT 0;
