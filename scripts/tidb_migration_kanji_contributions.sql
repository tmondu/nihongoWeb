-- ==============================================================================
-- TiDB / MySQL Migration Script
-- Tính năng: Bảng lưu trữ Ý kiến đóng góp & Mẹo nhớ chữ Kanji (Kanji Contributions)
-- Ngày tạo: 2026-09-11
-- ==============================================================================

-- 1. Tạo bảng `kanji_contributions`
CREATE TABLE IF NOT EXISTS `kanji_contributions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kanji_char` VARCHAR(10) NOT NULL COMMENT 'Chữ Hán Kanji (ví dụ: 日, 土, 月)',
  `user_id` INT NULL DEFAULT NULL COMMENT 'ID của học viên từ bảng users (NULL nếu khách)',
  `username` VARCHAR(100) NOT NULL COMMENT 'Tên hiển thị (Nickname) của học viên',
  `mean` TEXT NOT NULL COMMENT 'Nội dung mẹo nhớ chữ, thơ chiết tự, ý kiến đóng góp',
  `likes` INT DEFAULT 0 COMMENT 'Số lượt thích (thumbs up)',
  `dislikes` INT DEFAULT 0 COMMENT 'Số lượt không thích (thumbs down)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian đóng góp',
  INDEX `idx_kanji_char` (`kanji_char`),
  INDEX `idx_kanji_user` (`user_id`),
  INDEX `idx_kanji_created` (`kanji_char`, `created_at` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Dữ liệu mẫu (Insert thử nghiệm vào TiDB)
-- Bạn có thể chạy các câu lệnh dưới đây để thêm ngay bình luận mẫu:
INSERT INTO `kanji_contributions` (`kanji_char`, `username`, `mean`, `likes`, `dislikes`, `created_at`) 
VALUES 
('土', 'PThamSS', 'Mẹo nhớ chữ Thổ (土): Cây Thập tự (十) mọc trên mặt đất (一) chính là đất đai phì nhiêu.', 12, 0, NOW()),
('土', 'Nghiêm Võ', 'Chữ Thổ khác chữ Sĩ ở chỗ: nét ngang dưới của chữ Thổ dài hơn nét ngang trên.', 8, 1, NOW()),
('日', 'PThamSS', 'Bộ Nhật (日): Mặt trời chiếu sáng, hình chữ nhật có một vạch ở giữa biểu tượng mặt trời tròn có tâm.', 15, 0, NOW()),
('日', 'Sakura', 'Chữ Nhật có 2 âm chính: Onyomi là NICHI/JITSU, Kunyomi là hi/ka.', 6, 0, NOW());

-- 3. Câu lệnh kiểm tra dữ liệu sau khi thêm:
-- SELECT * FROM `kanji_contributions` WHERE `kanji_char` = '土' ORDER BY `likes` DESC, `created_at` DESC;
