 
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import {
  LESSON_2_N5_KANJI,
  LESSON_24_N4_KANJI,
  LESSON_25_N4_KANJI,
  LESSON_26_N4_KANJI,
} from '../features/Kanji/data/kanjiProCurriculum';

dotenv.config();

const tidbConfig = {
  host:
    process.env.TIDB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
  port: Number(process.env.TIDB_PORT) || 4000,
  user: process.env.TIDB_USER || '38sV4bVEEaF86kZ.root',
  password: process.env.TIDB_PASSWORD || 'RqS6JgLTAfLEpJg2',
  database: process.env.TIDB_NAME || 'test',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true,
  },
};

async function main() {
  console.log(' Connecting to TiDB Cloud:', tidbConfig.host);
  const conn = await mysql.createConnection(tidbConfig);
  console.log(' Connected to TiDB successfully!');

  // Ensure table exists
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`kanji_pro_lessons\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`level\` VARCHAR(10) NOT NULL DEFAULT 'n4',
      \`lesson_num\` INT NOT NULL,
      \`title\` VARCHAR(100) NOT NULL,
      \`description\` VARCHAR(255) NULL,
      \`is_available\` TINYINT(1) NOT NULL DEFAULT 1,
      \`kanji_list\` JSON NOT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`idx_kanji_pro_level\` (\`level\`)
    )
  `);

  const lessonsToSync = [
    {
      level: 'n5',
      lesson_num: 2,
      title: 'Bài 2',
      description:
        '14 chữ Hán: 一, 二, 三, 四, 五, 六, 七, 八, 九, 十, 百, 千, 万, 円',
      is_available: 1,
      kanji_list: LESSON_2_N5_KANJI,
    },
    {
      level: 'n4',
      lesson_num: 24,
      title: 'Bài 24',
      description: '9 chữ Hán: 試, 問, 答, 耳, 用, 験, 集, 研, 台',
      is_available: 1,
      kanji_list: LESSON_24_N4_KANJI,
    },
    {
      level: 'n4',
      lesson_num: 25,
      title: 'Bài 25',
      description:
        '12 mục chữ Hán: 飯, 場, 正, 世, 界, 急, 特, 県, 低, 弱, 不, 急',
      is_available: 1,
      kanji_list: LESSON_25_N4_KANJI,
    },
    {
      level: 'n4',
      lesson_num: 26,
      title: 'Bài 26',
      description:
        '13 mục chữ Hán: 議, 議, 駐, 帽, 横, 市, 役, 所, 拾, 捨, 遅, 遠, 歳',
      is_available: 1,
      kanji_list: LESSON_26_N4_KANJI,
    },
  ];

  for (const lesson of lessonsToSync) {
    const [rows] = await conn.execute<mysql.RowDataPacket[]>(
      'SELECT id FROM `kanji_pro_lessons` WHERE `level` = ? AND `lesson_num` = ? LIMIT 1',
      [lesson.level, lesson.lesson_num],
    );

    if (rows.length > 0) {
      await conn.execute(
        'UPDATE `kanji_pro_lessons` SET `title` = ?, `description` = ?, `is_available` = ?, `kanji_list` = ? WHERE `id` = ?',
        [
          lesson.title,
          lesson.description,
          lesson.is_available,
          JSON.stringify(lesson.kanji_list),
          rows[0].id,
        ],
      );
      console.log(
        ` Updated ${lesson.level.toUpperCase()} ${lesson.title} (${lesson.kanji_list.length} Kanji)`,
      );
    } else {
      await conn.execute(
        'INSERT INTO `kanji_pro_lessons` (`level`, `lesson_num`, `title`, `description`, `is_available`, `kanji_list`) VALUES (?, ?, ?, ?, ?, ?)',
        [
          lesson.level,
          lesson.lesson_num,
          lesson.title,
          lesson.description,
          lesson.is_available,
          JSON.stringify(lesson.kanji_list),
        ],
      );
      console.log(
        ` Inserted ${lesson.level.toUpperCase()} ${lesson.title} (${lesson.kanji_list.length} Kanji)`,
      );
    }
  }

  const [countRows] = await conn.execute<mysql.RowDataPacket[]>(
    'SELECT `level`, `lesson_num`, `title`, JSON_LENGTH(`kanji_list`) as kanji_count FROM `kanji_pro_lessons` ORDER BY `level`, `lesson_num`',
  );
  console.log('\n Current KanjiPro lessons in TiDB:');
  console.table(countRows);

  await conn.end();
  console.log(' All done!');
}

main().catch(err => {
  console.error(' Error syncing to TiDB:', err);
  process.exit(1);
});
