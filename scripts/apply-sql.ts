/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

const file = process.argv[2] || 'scripts/translated_update.sql';
const filePath = path.resolve(process.cwd(), file);

if (!fs.existsSync(filePath)) {
  console.error(`File không tồn tại: ${filePath}`);
  process.exit(1);
}

async function run() {
  console.log(`Đang đọc file SQL: ${filePath}...`);
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(
    `Đang kết nối MySQL: ${process.env.DB_HOST}:${process.env.DB_PORT}...`,
  );
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  console.log('Đang thực thi SQL...');
  const start = Date.now();
  await conn.query(sql);
  console.log(
    `✓ Thực thi hoàn tất trong ${((Date.now() - start) / 1000).toFixed(2)}s!`,
  );
  await conn.end();
}

run().catch(err => {
  console.error('Lỗi thực thi SQL:', err);
  process.exit(1);
});
