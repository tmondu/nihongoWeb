-- ==============================================================================
-- Script Cập Nhật Cơ Sở Dữ Liệu TiDB / MySQL Cho Tính Năng Bài Tập & Quản Lý Điểm Số
-- File: scripts/update_tidb_exercises.sql
-- ==============================================================================

-- 1. Tạo bảng quản lý bài tập (exercises)
CREATE TABLE IF NOT EXISTS `exercises` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` VARCHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'n5',
  `time_limit` INT NOT NULL DEFAULT 0, -- Thời gian làm bài tính bằng phút (0 = không giới hạn)
  `questions` JSON NOT NULL,          -- Lưu trữ danh sách câu hỏi, options, đáp án đúng và giải thích
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exercises_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tạo bảng lưu kết quả làm bài và quản lý điểm số của học sinh (exercise_submissions)
CREATE TABLE IF NOT EXISTS `exercise_submissions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `exercise_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `score` INT NOT NULL,               -- Số câu trả lời đúng
  `total_questions` INT NOT NULL,     -- Tổng số câu hỏi
  `percentage` INT NOT NULL,          -- Phần trăm điểm đạt được (0 - 100)
  `answers` JSON NOT NULL,            -- Chi tiết đáp án học sinh đã chọn
  `time_spent` INT NOT NULL DEFAULT 0,-- Thời gian làm bài (tính bằng giây)
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_submissions_exercise` (`exercise_id`),
  KEY `idx_submissions_user` (`user_id`),
  CONSTRAINT `fk_sub_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Dữ liệu đề bài tập mẫu ban đầu (JLPT N5)
INSERT INTO `exercises` (`id`, `title`, `description`, `level`, `time_limit`, `questions`, `is_published`)
VALUES (
  1,
  'Bài tập nhập môn JLPT N5: Chữ Hán & Từ vựng cơ bản',
  'Đề luyện tập tổng hợp giúp bạn kiểm tra vốn từ vựng, chữ Hán và trợ từ tiếng Nhật sơ cấp.',
  'n5',
  10,
  '[{"id":1,"question":"Từ nào sau đây có nghĩa là \\"Ngày mai\\"?","options":["きのう","あした","きょう","あさって"],"correct_answer":"B","explanation":"あした (ashita) nghĩa là ngày mai. きのう là hôm qua, きょう là hôm nay, あさって là ngày kia."},{"id":2,"question":"Chọn cách đọc đúng của chữ Hán: 「先生」","options":["せんせい","がくせい","いしゃ","かいしゃいん"],"correct_answer":"A","explanation":"先生 đọc là せんせい (sensei) - có nghĩa là giáo viên / thầy cô."},{"id":3,"question":"Điền trợ từ thích hợp: わたし ___ ベトナム人です。","options":["を","に","は","で"],"correct_answer":"C","explanation":"は (wa) là trợ từ đứng sau chủ ngữ trong câu giới thiệu / khẳng định cơ bản."},{"id":4,"question":"Câu chào \\"ありがとうございます\\" có nghĩa là gì?","options":["Xin lỗi","Cảm ơn","Tạm biệt","Chúc ngủ ngon"],"correct_answer":"B","explanation":"ありがとうございます (arigatou gozaimasu) có nghĩa là Cảm ơn rất nhiều."},{"id":5,"question":"Số 7 trong tiếng Nhật đọc là gì?","options":["なな / しち","ろく","はち","きゅう"],"correct_answer":"A","explanation":"Số 7 đọc là なな (nana) hoặc しち (shichi)."}]',
  1
) ON DUPLICATE KEY UPDATE `id` = `id`;
