-- Create tables for Exercises feature
CREATE TABLE IF NOT EXISTS `exercises` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `level` VARCHAR(10) NOT NULL DEFAULT 'n5',
  `time_limit` INT NOT NULL DEFAULT 0,
  `questions` JSON NOT NULL,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_exercises_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `exercise_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exercise_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `score` INT NOT NULL,
  `total_questions` INT NOT NULL,
  `percentage` INT NOT NULL,
  `answers` JSON NOT NULL,
  `time_spent` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_submissions_exercise` (`exercise_id`),
  INDEX `idx_submissions_user` (`user_id`),
  FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
