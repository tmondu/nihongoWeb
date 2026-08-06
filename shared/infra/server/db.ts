/* eslint-disable @typescript-eslint/no-explicit-any, no-console */
import mysql from 'mysql2/promise';

import { hashPassword } from '../../utils/auth';

let pool: mysql.Pool | null = null;
let initialized = false;

export function getDbPool(): mysql.Pool {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nihongo_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  if (!initialized) {
    initialized = true;
    (async () => {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS \`users\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`email\` VARCHAR(255) UNIQUE NOT NULL,
          \`password_hash\` VARCHAR(255) NOT NULL,
          \`is_approved\` TINYINT(1) DEFAULT 0,
          \`is_admin\` TINYINT(1) DEFAULT 0,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

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
