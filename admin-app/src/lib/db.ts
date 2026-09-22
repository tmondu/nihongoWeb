import mysql, { Pool } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let pool: Pool | null = null;

function loadEnvFallback() {
  if (process.env.DB_HOST) return;
  const possiblePaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../.env.local'),
    path.resolve(process.cwd(), '../.env'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }
}

export function getDbPool(): Pool {
  loadEnvFallback();
  if (!pool) {
    const host = process.env.DB_HOST || 'localhost';
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'nihongo_db';

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl:
        process.env.DB_SSL === 'true'
          ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
          : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    pool
      .execute(
        `CREATE TABLE IF NOT EXISTS \`lesson_video_progress\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`user_id\` INT NOT NULL,
          \`lesson_id\` INT NOT NULL,
          \`watched_seconds\` INT NOT NULL DEFAULT 0,
          \`last_position_seconds\` INT NOT NULL DEFAULT 0,
          \`duration_seconds\` INT NOT NULL DEFAULT 0,
          \`progress_percent\` INT NOT NULL DEFAULT 0,
          \`is_completed\` TINYINT(1) NOT NULL DEFAULT 0,
          \`last_watched_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY \`uniq_user_video_lesson\` (\`user_id\`, \`lesson_id\`),
          INDEX \`idx_lvp_user\` (\`user_id\`),
          INDEX \`idx_lvp_lesson\` (\`lesson_id\`),
          FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
      )
      .catch(() => {
        // ignore initialization errors
      });

    pool
      .execute('ALTER TABLE `kanjis` ADD COLUMN `examples` JSON DEFAULT NULL')
      .catch(() => {
        // ignore if column already exists
      });
  }

  return pool;
}
