-- ==============================================================================
-- TiDB / MySQL Migration Script
-- Tính năng: Tên hiển thị (Display Name) và Bình luận phản hồi (Reply Comments)
-- Ngày tạo: 2026-09-11
-- ==============================================================================

-- 1. Bổ sung cột cho bảng `users` (Tên hiển thị & thời gian đổi gần nhất)
ALTER TABLE `users` 
  ADD COLUMN IF NOT EXISTS `display_name` VARCHAR(100) NULL DEFAULT NULL AFTER `email`,
  ADD COLUMN IF NOT EXISTS `name_updated_at` TIMESTAMP NULL DEFAULT NULL AFTER `display_name`;

-- 2. Đảm bảo bảng `lesson_comments` tồn tại
CREATE TABLE IF NOT EXISTS `lesson_comments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `parent_id` INT NULL DEFAULT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comments_lesson` (`lesson_id`),
  INDEX `idx_comments_user` (`user_id`),
  INDEX `idx_comments_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bổ sung cột `parent_id` cho bảng `lesson_comments` (nếu bảng đã tồn tại từ trước)
ALTER TABLE `lesson_comments` 
  ADD COLUMN IF NOT EXISTS `parent_id` INT NULL DEFAULT NULL AFTER `user_id`;

-- 4. Bổ sung index cho `parent_id` để tăng tốc độ load phản hồi
-- (Nếu TiDB / MySQL báo lỗi index đã tồn tại thì có thể bỏ qua dòng này)
ALTER TABLE `lesson_comments` 
  ADD INDEX IF NOT EXISTS `idx_comments_parent` (`parent_id`);
