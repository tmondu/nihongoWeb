import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;

export function getDbPool(): Pool {
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
  }

  return pool;
}
