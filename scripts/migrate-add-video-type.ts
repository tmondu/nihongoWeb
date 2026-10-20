/**
 * Migration: Add video_type column to lessons table
 *
 * Run with:
 *   npx ts-node -r tsconfig-paths/register scripts/migrate-add-video-type.ts
 *
 * This is safe to run multiple times (uses IF NOT EXISTS logic).
 */
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({
    path: path.join(process.cwd(), '.env.local'),
    override: true,
  });
}

import { RowDataPacket } from 'mysql2';

async function migrate() {
  const { getDbPool } = await import('@/shared/infra/server/db');
  const pool = getDbPool();
  console.log('🚀 Starting migration: add video_type to lessons...');

  try {
    // Check if column already exists
    interface ColRow extends RowDataPacket {
      COLUMN_NAME: string;
    }
    const [cols] = await pool.execute<ColRow[]>(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'lessons' AND COLUMN_NAME = 'video_type'`,
    );

    if (Array.isArray(cols) && cols.length > 0) {
      console.log("✅ Column 'video_type' already exists. Skipping.");
    } else {
      await pool.execute(`
        ALTER TABLE lessons
        ADD COLUMN video_type ENUM('grammar', 'exam_review') NOT NULL DEFAULT 'grammar'
        AFTER video_url
      `);
      console.log("✅ Column 'video_type' added successfully.");
    }

    // Set all existing lessons to 'grammar' (already the default, but just to be explicit)
    const [result] = await pool.execute(
      `UPDATE lessons SET video_type = 'grammar' WHERE video_type IS NULL OR video_type = ''`,
    );
    console.log('✅ Existing rows defaulted to grammar:', result);

    console.log('\n🎉 Migration completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log(
      '  1. Log in to admin and set "Chữa đề" on exam review lessons.',
    );
    console.log(
      '  2. Grammar lessons keep their existing can_watch_video permission rules.',
    );
    console.log(
      '  3. Exam review lessons are accessible to anyone logged in with the correct level.',
    );
  } catch (err) {
    console.error('❌ Migration failed:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
