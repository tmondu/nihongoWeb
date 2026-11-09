import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

async function migrate() {
  console.log('Connecting to TiDB Cloud:', process.env.DB_HOST);
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true },
    connectTimeout: 10000,
  });

  console.log('Connected to TiDB Cloud successfully.');

  // 1. Alter tham_vocabularies
  try {
    console.log('Adding column `han_viet` to `tham_vocabularies`...');
    await conn.query(
      'ALTER TABLE `tham_vocabularies` ADD COLUMN `han_viet` VARCHAR(100) NULL AFTER `romaji`',
    );
    console.log('✓ Added `han_viet`');
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('• Column `han_viet` already exists.');
    } else {
      console.warn('! han_viet:', error.message);
    }
  }

  try {
    console.log('Adding column `audio_url` to `tham_vocabularies`...');
    await conn.query(
      'ALTER TABLE `tham_vocabularies` ADD COLUMN `audio_url` VARCHAR(255) NULL AFTER `word_type`',
    );
    console.log('✓ Added `audio_url`');
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('• Column `audio_url` already exists.');
    } else {
      console.warn('! audio_url:', error.message);
    }
  }

  // 2. Alter tham_grammar_points
  try {
    console.log('Adding column `nuance_notes` to `tham_grammar_points`...');
    await conn.query(
      'ALTER TABLE `tham_grammar_points` ADD COLUMN `nuance_notes` TEXT NULL AFTER `explanation_vi`',
    );
    console.log('✓ Added `nuance_notes`');
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('• Column `nuance_notes` already exists.');
    } else {
      console.warn('! nuance_notes:', error.message);
    }
  }

  // 3. Create user_vocab_progress
  console.log('Creating table `user_vocab_progress`...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`user_vocab_progress\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT NOT NULL,
      \`vocab_id\` INT NOT NULL,
      \`is_memorized\` TINYINT(1) NOT NULL DEFAULT 0,
      \`pronounce_score\` INT DEFAULT NULL,
      \`is_starred\` TINYINT(1) NOT NULL DEFAULT 0,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY \`uk_user_vocab\` (\`user_id\`, \`vocab_id\`),
      INDEX \`idx_uvp_user\` (\`user_id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
      FOREIGN KEY (\`vocab_id\`) REFERENCES \`tham_vocabularies\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ Created `user_vocab_progress`');

  // 4. Create user_grammar_progress
  console.log('Creating table `user_grammar_progress`...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS \`user_grammar_progress\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`user_id\` INT NOT NULL,
      \`grammar_id\` INT NOT NULL,
      \`is_mastered\` TINYINT(1) NOT NULL DEFAULT 0,
      \`is_starred\` TINYINT(1) NOT NULL DEFAULT 0,
      \`user_notes\` TEXT NULL,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY \`uk_user_grammar\` (\`user_id\`, \`grammar_id\`),
      INDEX \`idx_ugp_user\` (\`user_id\`),
      FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
      FOREIGN KEY (\`grammar_id\`) REFERENCES \`tham_grammar_points\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✓ Created `user_grammar_progress`');

  // 5. Verification
  console.log('--- Verifying Schema in TiDB ---');
  const [tables] = await conn.query("SHOW TABLES LIKE 'user_%'");
  console.log('Verified user_* tables:', tables);

  const [vocabCols] = await conn.query('DESCRIBE `tham_vocabularies`');
  console.log(
    'tham_vocabularies fields:',
    (vocabCols as Array<{ Field: string }>).map(c => c.Field),
  );

  const [grammarCols] = await conn.query('DESCRIBE `tham_grammar_points`');
  console.log(
    'tham_grammar_points fields:',
    (grammarCols as Array<{ Field: string }>).map(c => c.Field),
  );

  await conn.end();
  console.log('✓ All migrations applied successfully to TiDB Cloud!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
