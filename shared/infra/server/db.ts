/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import mysql from 'mysql2/promise';

import { hashPassword } from '../../utils/auth';

import { env } from '@/shared/config/env';

let pool: mysql.Pool | null = null;
let initialized = false;

export function getDbPool(): mysql.Pool {
  if (pool) return pool;

  pool = mysql.createPool({
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    port: env.db.port,
    ssl: env.db.ssl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
  });

  if (!initialized) {
    initialized = true;
    (async () => {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`email\` VARCHAR(255) UNIQUE NOT NULL,
          \`password_hash\` VARCHAR(255) NOT NULL,
          \`display_name\` VARCHAR(100) NULL,
          \`name_updated_at\` TIMESTAMP NULL,
          \`is_approved\` TINYINT(1) DEFAULT 0,
          \`is_admin\` TINYINT(1) DEFAULT 0,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      try {
        await pool.execute(
          'ALTER TABLE `users` ADD COLUMN `display_name` VARCHAR(100) NULL AFTER `email`',
        );
      } catch {
        // Ignore if column already exists
      }

      try {
        await pool.execute(
          'ALTER TABLE `users` ADD COLUMN `name_updated_at` TIMESTAMP NULL AFTER `display_name`',
        );
      } catch {
        // Ignore if column already exists
      }

      try {
        await pool.execute(
          'ALTER TABLE `users` ADD COLUMN `is_approved` TINYINT(1) DEFAULT 0 AFTER `password_hash`',
        );
      } catch {
        // Ignore if column already exists
      }

      try {
        await pool.execute(
          'ALTER TABLE `users` ADD COLUMN `is_admin` TINYINT(1) DEFAULT 0 AFTER `is_approved`',
        );
      } catch {
        // Ignore if column already exists
      }

      try {
        await pool.execute(
          'ALTER TABLE `users` ADD COLUMN `is_verified` TINYINT(1) DEFAULT 0 AFTER `is_admin`',
        );
      } catch {
        // Ignore if column already exists
      }

      try {
        await pool.execute(
          'ALTER TABLE `users` ADD COLUMN `can_watch_video` TINYINT(1) DEFAULT 0 AFTER `is_verified`',
        );
      } catch {
        // Ignore if column already exists
      }

      try {
        await pool.execute(
          "ALTER TABLE `users` ADD COLUMN `level` VARCHAR(5) NOT NULL DEFAULT 'n5' AFTER `can_watch_video`",
        );
      } catch {
        // Ignore if column already exists
      }

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`email_verification_codes\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`email\` VARCHAR(255) NOT NULL,
          \`code\` VARCHAR(6) NOT NULL,
          \`expires_at\` TIMESTAMP NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX \`idx_email_code\` (\`email\`, \`code\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`password_reset_tokens\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`user_id\` INT NOT NULL,
          \`token_hash\` VARCHAR(64) NOT NULL,
          \`expires_at\` TIMESTAMP NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`exercises\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`title\` VARCHAR(255) NOT NULL,
          \`description\` TEXT,
          \`level\` VARCHAR(10) NOT NULL DEFAULT 'n5',
          \`time_limit\` INT NOT NULL DEFAULT 0,
          \`questions\` JSON NOT NULL,
          \`is_published\` TINYINT(1) NOT NULL DEFAULT 1,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX \`idx_exercises_level\` (\`level\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`exercise_submissions\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`exercise_id\` INT NOT NULL,
          \`user_id\` INT NOT NULL,
          \`score\` INT NOT NULL,
          \`total_questions\` INT NOT NULL,
          \`percentage\` INT NOT NULL,
          \`answers\` JSON NOT NULL,
          \`time_spent\` INT NOT NULL DEFAULT 0,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX \`idx_submissions_exercise\` (\`exercise_id\`),
          INDEX \`idx_submissions_user\` (\`user_id\`),
          FOREIGN KEY (\`exercise_id\`) REFERENCES \`exercises\` (\`id\`) ON DELETE CASCADE,
          FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`lesson_comments\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`lesson_id\` INT NOT NULL,
          \`user_id\` INT NOT NULL,
          \`parent_id\` INT NULL DEFAULT NULL,
          \`content\` TEXT NOT NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX \`idx_comments_lesson\` (\`lesson_id\`),
          INDEX \`idx_comments_user\` (\`user_id\`),
          INDEX \`idx_comments_parent\` (\`parent_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      try {
        await pool.execute(
          'ALTER TABLE `lesson_comments` ADD COLUMN `parent_id` INT NULL DEFAULT NULL AFTER `user_id`',
        );
      } catch {
        // Ignore if column already exists
      }

      try {
        await pool.execute(
          'ALTER TABLE `lesson_comments` ADD INDEX `idx_comments_parent` (`parent_id`)',
        );
      } catch {
        // Ignore if index already exists
      }

      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`kanji_contributions\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`kanji_char\` VARCHAR(10) NOT NULL,
          \`user_id\` INT NULL DEFAULT NULL,
          \`username\` VARCHAR(100) NOT NULL,
          \`mean\` TEXT NOT NULL,
          \`likes\` INT DEFAULT 0,
          \`dislikes\` INT DEFAULT 0,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX \`idx_kanji_char\` (\`kanji_char\`),
          INDEX \`idx_kanji_user\` (\`user_id\`),
          INDEX \`idx_kanji_created\` (\`kanji_char\`, \`created_at\` DESC)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Seed default admin account
      const [existingAdmins] = await pool.execute<any[]>(
        'SELECT id FROM users WHERE email = ?',
        ['nduc120201@gmail.com'],
      );

      if (existingAdmins.length === 0) {
        const hashedPassword = hashPassword('ptham20');
        await pool.execute(
          'INSERT INTO users (email, password_hash, is_approved, is_admin) VALUES (?, ?, 1, 1)',
          ['nduc120201@gmail.com', hashedPassword],
        );
        console.log('Seeded default admin user: nduc120201@gmail.com');
      } else {
        await pool.execute(
          'UPDATE users SET is_approved = 1, is_admin = 1 WHERE email = ?',
          ['nduc120201@gmail.com'],
        );
      }
    })().catch(err => {
      console.error('Failed to initialize users schema:', err);
      initialized = false;
    });
  }

  return pool;
}
