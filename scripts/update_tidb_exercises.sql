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
-- Đề 1: Trắc nghiệm từ vựng & chữ Hán
INSERT INTO `exercises` (`id`, `title`, `description`, `level`, `time_limit`, `questions`, `is_published`)
VALUES (
  1,
  'Bài tập nhập môn JLPT N5: Chữ Hán & Từ vựng cơ bản',
  'Đề luyện tập tổng hợp giúp bạn kiểm tra vốn từ vựng, chữ Hán và trợ từ tiếng Nhật sơ cấp.',
  'n5',
  10,
  '[{"id":1,"question":"Từ nào sau đây có nghĩa là \\"Ngày mai\\"?","options":["きのう","あした","きょう","あさって"],"correct_answer":"B","explanation":"あした (ashita) nghĩa là ngày mai. きのう là hôm qua, きょう là hôm nay, あさって là ngày kia."},{"id":2,"question":"Chọn cách đọc đúng của chữ Hán: 「先生」","options":["せんせい","がくせい","いしゃ","かいしゃいん"],"correct_answer":"A","explanation":"先生 đọc là せんせい (sensei) - có nghĩa là giáo viên / thầy cô."},{"id":3,"question":"Điền trợ từ thích hợp: わたし ___ ベトナム人です。","options":["を","に","は","で"],"correct_answer":"C","explanation":"は (wa) là trợ từ đứng sau chủ ngữ trong câu giới thiệu / khẳng định cơ bản."},{"id":4,"question":"Câu chào \\"ありがとうございます\\" có nghĩa là gì?","options":["Xin lỗi","Cảm ơn","Tạm biệt","Chúc ngủ ngon"],"correct_answer":"B","explanation":"ありがとうございます (arigatou gozaimasu) có nghĩa là Cảm ơn rất nhiều."},{"id":5,"question":"Số 7 trong tiếng Nhật đọc là gì?","options":["なな / しち","ろく","はち","きゅう"],"correct_answer":"A","explanation":"Số 7 đọc là なな (nana) hoặc しち (shichi)."}]',
  1
) ON DUPLICATE KEY UPDATE 
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `questions` = VALUES(`questions`),
  `time_limit` = VALUES(`time_limit`),
  `is_published` = VALUES(`is_published`);

-- Đề 2: Luyện đọc hiểu (Có đoạn văn chung - Passage)
INSERT INTO `exercises` (`id`, `title`, `description`, `level`, `time_limit`, `questions`, `is_published`)
VALUES (
  2,
  'Luyện đọc hiểu JLPT N5: 初めての野球 (Bài đọc có Passage)',
  'Đề luyện tập kỹ năng đọc hiểu văn bản tiếng Nhật và điền liên từ / trợ từ trong đoạn văn.',
  'n5',
  15,
  '[{"id":1,"passage_title":"初めての野球","passage":"日本に来る前に まんがで 野球という スポーツを 知って、きょうみを もちました。\\nでも、私の国では、野球をしている人を見たことがありません。道具もないので、野球はできませんでした。\\n\\n先週の土曜日にともだちが入っている野球クラブの見学に行きました。クラブの人たちにさそわれて、ずっとやりたかった野球の練習を初めてすることになりました。\\n[ 18 ] 野球ができることになって、うれしかったです。ボールを打つのは難しかったです。でも、クラブの人たちがやさしく [ 19 ]。野球はやはりおもしろいスポーツだと思いました。[ 20 ] クラブに入ることにしました。","question":"Chọn từ thích hợp điền vào ô [ 18 ]:","options":["もっと","やっと","また","まだ"],"correct_answer":"B","explanation":"Dùng やっと (cuối cùng thì) để diễn đạt một việc mong đợi bấy lâu nay đã thành hiện thực."},{"id":2,"passage_title":"初めての野球","passage":"日本に来る前に まんがで 野球という スポーツを 知って、きょうみを もちました。\\nでも、私の国では、野球をしている人を見たことがありません。道具もないので、野球はできませんでした。\\n\\n先週の土曜日にともだちが入っている野球クラブの見学に行きました。クラブの人たちにさそわれて、ずっとやりたかった野球の練習を初めてすることになりました。\\n[ 18 ] 野球ができることになって、うれしかったです。ボールを打つのは難しかったです。でも、クラブの人たちがやさしく [ 19 ]。野球はやはりおもしろいスポーツだと思いました。[ 20 ] クラブに入ることにしました。","question":"Chọn cấu trúc thích hợp điền vào ô [ 19 ]:","options":["教えて くれました","教えて あげました","教えて もらいました","教えて やりました"],"correct_answer":"A","explanation":"Chủ ngữ là クラブの人たちが (người khác làm cho mình một việc gì đó) -> dùng 〜てくれました."},{"id":3,"passage_title":"初めての野球","passage":"日本に来る前に まんがで 野球という スポーツを 知って、きょうみを もちました。\\nでも、私の国では、野球をしている人を見たことがありません。道具もないので、野球はできませんでした。\\n\\n先週の土曜日にともだちが入っている野球クラブの見学に行きました。クラブの人たちにさそわれて、ずっとやりたかった野球の練習を初めてすることになりました。\\n[ 18 ] 野球ができることになって、うれしかったです。ボールを打つのは難しかったです。でも、クラブの人たちがやさしく [ 19 ]。野球はやはりおもしろいスポーツだと思いました。[ 20 ] クラブに入ることにしました。","question":"Chọn liên từ thích hợp điền vào ô [ 20 ]:","options":["それで","しかし","または","ところで"],"correct_answer":"A","explanation":"それで (Vì vậy, do đó) dùng để nối kết quả của việc thấy bóng chày rất thú vị nên quyết định tham gia."}]',
) ON DUPLICATE KEY UPDATE 
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `questions` = VALUES(`questions`),
  `time_limit` = VALUES(`time_limit`),
  `is_published` = VALUES(`is_published`);

