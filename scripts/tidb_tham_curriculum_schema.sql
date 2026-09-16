-- ==============================================================================
-- File: scripts/tidb_tham_curriculum_schema.sql
-- Mục đích: Tạo các bảng CSDL TiDB / MySQL cho module Giáo Án (Curriculum) PThamSS
-- Tiền tố: tham_ (chuẩn bị sẵn cho giáo án riêng trong tương lai)
-- ==============================================================================

-- 1. Bảng quản lý danh mục bài học (50 bài Minna no Nihongo I & II)
CREATE TABLE IF NOT EXISTS `tham_lessons` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lesson_num` INT NOT NULL,
  `title_vi` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title_ja` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` VARCHAR(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'n5', -- 'n5' hoặc 'n4'
  `book_vol` TINYINT NOT NULL DEFAULT 1,                               -- 1 = Minna I (1-25), 2 = Minna II (26-50)
  `vocab_count` INT NOT NULL DEFAULT 0,
  `grammar_count` INT NOT NULL DEFAULT 0,
  `order_num` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tham_lesson_num` (`lesson_num`),
  KEY `idx_tham_book_vol` (`book_vol`),
  KEY `idx_tham_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng quản lý từ vựng theo từng bài học
CREATE TABLE IF NOT EXISTS `tham_vocabularies` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lesson_num` INT NOT NULL,
  `kanji` VARCHAR(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kana` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `romaji` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `meaning_vi` TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
  `word_type` VARCHAR(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL, -- Danh từ, Động từ, Tính từ,...
  `example_ja` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `example_vi` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_num` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tv_lesson` (`lesson_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng quản lý mẫu ngữ pháp theo từng bài học
CREATE TABLE IF NOT EXISTS `tham_grammar_points` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `lesson_num` INT NOT NULL,
  `title` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `summary_vi` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `structure` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `explanation_vi` TEXT COLLATE utf8mb4_unicode_ci NOT NULL,
  `examples` JSON NOT NULL, -- Lưu mảng: [{ ja, kana, romaji, vi }]
  `order_num` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tg_lesson` (`lesson_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng lưu tiến độ học tập của người dùng đối với từng bài
CREATE TABLE IF NOT EXISTS `tham_user_progress` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `lesson_num` INT NOT NULL,
  `grammar_completed` INT NOT NULL DEFAULT 0,
  `vocab_completed` TINYINT(1) NOT NULL DEFAULT 0,
  `quiz_score` INT NOT NULL DEFAULT 0,
  `completed_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_tup_user_lesson` (`user_id`, `lesson_num`),
  KEY `idx_tup_user` (`user_id`),
  KEY `idx_tup_lesson` (`lesson_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
