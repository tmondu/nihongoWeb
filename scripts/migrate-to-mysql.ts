/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nihongo_db',
  port: Number(process.env.DB_PORT) || 3306,
};

const PUBLIC_DIR = path.join(process.cwd(), 'public');

async function runInChunks<T>(
  items: T[],
  chunkSize: number,
  fn: (item: T) => Promise<void>,
) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(chunk.map(fn));
  }
}

async function main() {
  console.log('Connecting to MySQL database with config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
  });

  // Use a connection pool to allow concurrent queries over multiple TCP sockets
  const pool = mysql.createPool({
    ...dbConfig,
    connectionLimit: 30,
  });
  console.log('Database pool initialized successfully.');

  try {
    // 1. Create kanjis table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS \`kanjis\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`level\` VARCHAR(5) NOT NULL,
        \`original_id\` INT NOT NULL,
        \`kanji_char\` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL UNIQUE,
        \`onyomi\` JSON NOT NULL,
        \`kunyomi\` JSON NOT NULL,
        \`meanings\` JSON NOT NULL,
        \`is_decoration\` BOOLEAN DEFAULT FALSE,
        INDEX \`idx_kanji_level\` (\`level\`),
        INDEX \`idx_kanji_char\` (\`kanji_char\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Create vocabularies table
    await pool.execute(`DROP TABLE IF EXISTS \`vocabularies\``);
    await pool.execute(`
      CREATE TABLE \`vocabularies\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`level\` VARCHAR(5) NOT NULL,
        \`jmdict_seq\` VARCHAR(50) NOT NULL,
        \`kana\` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        \`kanji\` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL,
        \`waller_definition\` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
        UNIQUE KEY \`uniq_level_seq\` (\`level\`, \`jmdict_seq\`),
        INDEX \`idx_vocab_level\` (\`level\`),
        INDEX \`idx_vocab_kana\` (\`kana\`),
        INDEX \`idx_vocab_kanji\` (\`kanji\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('Tables created or verified.');

    // 3. Load decorations.json to index decoration kanjis
    const decorationsPath = path.join(
      PUBLIC_DIR,
      'data-kanji',
      'decorations.json',
    );
    let decorationsSet = new Set<string>();
    if (fs.existsSync(decorationsPath)) {
      const decData = JSON.parse(
        fs.readFileSync(decorationsPath, 'utf8'),
      ) as string[];
      decorationsSet = new Set(decData);
      console.log(`Loaded ${decorationsSet.size} decoration kanjis.`);
    }

    // 4. Migrate Kanji
    const kanjiLevels = ['n5', 'n4', 'n3', 'n2', 'n1'];
    console.log('Starting Kanji migration...');
    for (const lvl of kanjiLevels) {
      const kanjiFilePath = path.join(
        PUBLIC_DIR,
        'data-kanji',
        `${lvl.toUpperCase()}.json`,
      );
      if (!fs.existsSync(kanjiFilePath)) {
        console.warn(`Kanji file for level ${lvl} not found, skipping.`);
        continue;
      }

      const rawData = fs.readFileSync(kanjiFilePath, 'utf8');
      const kanjis = JSON.parse(rawData) as Array<{
        id: number;
        kanjiChar: string;
        onyomi: string[];
        kunyomi: string[];
        meanings: string[];
      }>;

      console.log(
        `Migrating ${kanjis.length} kanjis for level ${lvl.toUpperCase()}...`,
      );
      await runInChunks(kanjis, 30, async k => {
        const isDec = decorationsSet.has(k.kanjiChar) ? 1 : 0;
        await pool.execute(
          `INSERT INTO \`kanjis\` (\`level\`, \`original_id\`, \`kanji_char\`, \`onyomi\`, \`kunyomi\`, \`meanings\`, \`is_decoration\`)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             \`level\` = VALUES(\`level\`),
             \`original_id\` = VALUES(\`original_id\`),
             \`onyomi\` = VALUES(\`onyomi\`),
             \`kunyomi\` = VALUES(\`kunyomi\`),
             \`meanings\` = VALUES(\`meanings\`),
             \`is_decoration\` = VALUES(\`is_decoration\`)`,
          [
            lvl,
            k.id,
            k.kanjiChar,
            JSON.stringify(k.onyomi),
            JSON.stringify(k.kunyomi),
            JSON.stringify(k.meanings),
            isDec,
          ],
        );
      });
    }

    // 5. Migrate Vocabulary
    console.log('Starting Vocabulary migration...');
    for (const lvl of kanjiLevels) {
      const vocabFilePath = path.join(
        PUBLIC_DIR,
        'data-vocab',
        `${lvl.toLowerCase()}.json`,
      );
      if (!fs.existsSync(vocabFilePath)) {
        console.warn(`Vocab file for level ${lvl} not found, skipping.`);
        continue;
      }

      const rawData = fs.readFileSync(vocabFilePath, 'utf8');
      const vocabs = JSON.parse(rawData) as Array<{
        jmdict_seq: string;
        kana: string;
        kanji: string;
        waller_definition: string;
      }>;

      console.log(
        `Migrating ${vocabs.length} vocabularies for level ${lvl.toUpperCase()}...`,
      );
      await runInChunks(vocabs, 30, async v => {
        await pool.execute(
          `INSERT INTO \`vocabularies\` (\`level\`, \`jmdict_seq\`, \`kana\`, \`kanji\`, \`waller_definition\`)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             \`level\` = VALUES(\`level\`),
             \`kana\` = VALUES(\`kana\`),
             \`kanji\` = VALUES(\`kanji\`),
             \`waller_definition\` = VALUES(\`waller_definition\`)`,
          [lvl, v.jmdict_seq, v.kana, v.kanji || null, v.waller_definition],
        );
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
