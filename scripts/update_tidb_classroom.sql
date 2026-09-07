-- Script cập nhật Cơ sở dữ liệu TiDB / MySQL
-- Bổ sung bảng bài giảng (lessons) và trường quyền xem video (can_watch_video)

-- 1. Bổ sung trường can_watch_video vào bảng users (nếu chưa có)
-- Lưu ý: Nếu cột đã tồn tại trên MySQL/TiDB sẽ báo lỗi Duplicate column name, có thể bỏ qua.
ALTER TABLE `users` ADD COLUMN `can_watch_video` TINYINT(1) NOT NULL DEFAULT 0 AFTER `is_approved`;

-- 2. Đảm bảo bảng users có cột is_admin (nếu chưa có)
-- ALTER TABLE `users` ADD COLUMN `is_admin` TINYINT(1) NOT NULL DEFAULT 0 AFTER `can_watch_video`;

-- 3. Tạo bảng lessons quản lý video bài giảng
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` VARCHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'n5',
  `video_url` VARCHAR(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_num` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_lessons_level` (`level`),
  KEY `idx_lessons_order` (`order_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
