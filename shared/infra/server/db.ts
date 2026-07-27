import mysql from 'mysql2/promise';

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
    })().catch(err => {
      console.error('Failed to initialize users schema:', err);
      initialized = false;
    });
  }

  return pool;
}
