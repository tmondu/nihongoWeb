import { getDbPool } from '../shared/infra/server/db';
import { RowDataPacket } from 'mysql2';

async function migrate() {
  const pool = getDbPool();

  console.log('1. Checking can_do_test column in users table...');
  const [cols] = await pool.execute<RowDataPacket[]>(
    "SHOW COLUMNS FROM users LIKE 'can_do_test'",
  );
  if (cols.length === 0) {
    console.log('Adding can_do_test column to users...');
    await pool.execute(`
      ALTER TABLE users 
      ADD COLUMN can_do_test TINYINT(1) NOT NULL DEFAULT 0 AFTER can_watch_video
    `);
    console.log('Added can_do_test column successfully.');
  } else {
    console.log('Column can_do_test already exists.');
  }

  console.log('2. Creating assessment_tests table...');
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS assessment_tests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      total_questions INT NOT NULL DEFAULT 200,
      mcq_time_limit INT NOT NULL DEFAULT 60,
      essay_time_limit INT NOT NULL DEFAULT 80,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('assessment_tests table ready.');

  console.log('3. Creating assessment_questions table...');
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS assessment_questions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      test_id INT NOT NULL,
      part TINYINT NOT NULL COMMENT '1: Trac nghiem, 2: Tu luan',
      question_type VARCHAR(50) NOT NULL,
      context_sentence TEXT NULL,
      target_word VARCHAR(255) NULL,
      kanji_char VARCHAR(50) NULL,
      options_json JSON NULL,
      correct_answer VARCHAR(255) NULL,
      acceptable_answers_json JSON NULL,
      han_viet VARCHAR(255) NULL,
      meaning_vi TEXT NULL,
      explanation TEXT NULL,
      order_num INT NOT NULL,
      INDEX idx_test_order (test_id, order_num),
      INDEX idx_test_part (test_id, part),
      FOREIGN KEY (test_id) REFERENCES assessment_tests(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('assessment_questions table ready.');

  console.log('4. Creating assessment_submissions table...');
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS assessment_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      test_id INT NOT NULL,
      mcq_status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
      essay_status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
      overall_status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
      mcq_score INT NOT NULL DEFAULT 0,
      essay_score INT NOT NULL DEFAULT 0,
      total_score INT NOT NULL DEFAULT 0,
      mcq_time_spent_seconds INT NOT NULL DEFAULT 0,
      essay_time_spent_seconds INT NOT NULL DEFAULT 0,
      answers_json LONGTEXT NOT NULL,
      grading_details_json LONGTEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      INDEX idx_user (user_id),
      INDEX idx_test (test_id),
      FOREIGN KEY (test_id) REFERENCES assessment_tests(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('assessment_submissions table ready.');

  console.log('All migrations applied successfully!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
