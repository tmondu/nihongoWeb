import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import {
  EXAM_1_N5_SOLUTION,
  type SolutionExam,
} from '../features/Solutions/data/solutionsData';

dotenv.config();
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

const dbConfig = {
  host: process.env.DB_HOST || process.env.TIDB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || process.env.TIDB_PORT) || 3306,
  user: process.env.DB_USER || process.env.TIDB_USER || 'root',
  password: process.env.DB_PASSWORD || process.env.TIDB_PASSWORD || '',
  database: process.env.DB_NAME || process.env.TIDB_NAME || 'nihongo_db',
  ssl:
    process.env.DB_SSL === 'true'
      ? { minVersion: 'TLSv1.2', rejectUnauthorized: true }
      : undefined,
};

interface SessionDef {
  sessionNum: number;
  sessionTitle: string;
  startQ: number;
  endQ: number;
  isUnlocked: number;
}

// Hàm format text đáp án dạng bảng lưới đẹp mắt cho Zalo tin nhắn
function formatZaloAnswersText(
  examTitle: string,
  sessionTitle: string,
  startQ: number,
  endQ: number,
  answers: { qNum: number; answer: string }[],
  webUrl: string,
): string {
  const lines: string[] = [];
  lines.push(`📚 ${examTitle.toUpperCase()} - ${sessionTitle.toUpperCase()}`);
  lines.push(
    `📌 Phạm vi: Câu ${startQ} đến câu ${endQ} (${answers.length} câu)`,
  );
  lines.push('───────────────────────────────');

  // Chia mỗi dòng 5 câu để hiển thị gọn trên điện thoại Zalo
  const chunks: string[] = [];
  for (let i = 0; i < answers.length; i += 5) {
    const group = answers.slice(i, i + 5);
    const row = group
      .map(
        item =>
          `${String(item.qNum).padStart(2, ' ')}: ${item.answer.padEnd(2, ' ')}`,
      )
      .join('  ');
    chunks.push(row);
  }
  lines.push(chunks.join('\n'));
  lines.push('───────────────────────────────');
  lines.push(`👉 Xem đáp án & giải thích chi tiết tại:`);
  lines.push(webUrl);

  return lines.join('\n');
}

async function main() {
  console.log(
    `Connecting to DB ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}...`,
  );
  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected to DB successfully!');

  // 1. Tạo bảng nếu chưa tồn tại
  const migrationSqlPath = path.resolve(
    process.cwd(),
    'scripts/migrations/09_create_exam_solutions_tables.sql',
  );
  if (fs.existsSync(migrationSqlPath)) {
    console.log('Applying table creation migration...');
    const migrationSql = fs.readFileSync(migrationSqlPath, 'utf8');
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const stmt of statements) {
      await conn.query(stmt);
    }
    console.log('Tables verified / created.');
  }

  // 2. Định nghĩa cấu trúc Buổi học cho Đề 1 N5
  // Đề 1 N5 có 35 câu:
  // - Buổi 1: Từ vựng & Kanji (Mondai 1-2: 9 câu)
  // - Buổi 2: Ngữ pháp cơ bản & Dấu sao (Mondai 1-2: 21 câu)
  // - Buổi 3: Đọc hiểu điền từ đục lỗ (Mondai 3: 5 câu)
  const n5De1Sessions: SessionDef[] = [
    {
      sessionNum: 1,
      sessionTitle: 'Buổi 1: Từ vựng & Chữ Hán',
      startQ: 1,
      endQ: 9,
      isUnlocked: 1, // Buổi 1 đã dạy xong -> mở cho bot phát
    },
    {
      sessionNum: 2,
      sessionTitle: 'Buổi 2: Ngữ pháp & Câu dấu sao (*)',
      startQ: 10,
      endQ: 30,
      isUnlocked: 0, // Buổi 2 chưa dạy -> khóa lại
    },
    {
      sessionNum: 3,
      sessionTitle: 'Buổi 3: Đọc hiểu & Điền từ đoạn văn',
      startQ: 31,
      endQ: 35,
      isUnlocked: 0, // Buổi 3 chưa dạy -> khóa lại
    },
  ];

  const examsToSync: { exam: SolutionExam; sessions: SessionDef[] }[] = [
    {
      exam: EXAM_1_N5_SOLUTION,
      sessions: n5De1Sessions,
    },
  ];

  for (const { exam, sessions } of examsToSync) {
    const examPkgId = `${exam.level}_de${String(exam.examNumber).padStart(2, '0')}`;
    const totalQuestions = exam.questions.length;
    const totalSessions = sessions.length;
    const detailWebUrl = `https://www.pthamnihongo.site/vi/solutions?level=${exam.level}&exam=${exam.examNumber}`;

    console.log(`\nSyncing Exam Package [${examPkgId}]: ${exam.title}...`);

    // UPSERT exam_packages
    await conn.execute(
      `INSERT INTO \`exam_packages\` 
        (\`id\`, \`level\`, \`exam_number\`, \`title\`, \`subtitle\`, \`author\`, \`total_questions\`, \`total_sessions\`, \`full_data\`)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        \`title\` = VALUES(\`title\`),
        \`subtitle\` = VALUES(\`subtitle\`),
        \`author\` = VALUES(\`author\`),
        \`total_questions\` = VALUES(\`total_questions\`),
        \`total_sessions\` = VALUES(\`total_sessions\`),
        \`full_data\` = VALUES(\`full_data\`)`,
      [
        examPkgId,
        exam.level,
        exam.examNumber,
        exam.title,
        exam.subtitle || null,
        exam.author || null,
        totalQuestions,
        totalSessions,
        JSON.stringify(exam),
      ],
    );

    console.log(
      `  Package saved (${totalQuestions} câu, ${totalSessions} buổi).`,
    );

    // Lưu từng Buổi vào exam_sessions
    for (const session of sessions) {
      // Lọc các câu hỏi thuộc buổi này
      const sessionQuestions = exam.questions.filter(
        q => q.globalNumber >= session.startQ && q.globalNumber <= session.endQ,
      );

      const sessionAnswers = sessionQuestions.map(q => ({
        qNum: q.globalNumber,
        answer: q.correctOption,
        part: q.partId,
        partTitle: q.partTitle,
        hanviet: q.hanviet,
        meaning: q.meaning,
      }));

      const answersText = formatZaloAnswersText(
        `${exam.level.toUpperCase()} - Đề ${exam.examNumber}`,
        session.sessionTitle,
        session.startQ,
        session.endQ,
        sessionAnswers.map(a => ({ qNum: a.qNum, answer: a.answer })),
        detailWebUrl,
      );

      const questionRangeStr = `${session.startQ}-${session.endQ}`;

      await conn.execute(
        `INSERT INTO \`exam_sessions\`
          (\`exam_id\`, \`session_num\`, \`session_title\`, \`question_range\`, \`is_unlocked\`, \`answers_text\`, \`answers_json\`, \`detail_url\`)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          \`session_title\` = VALUES(\`session_title\`),
          \`question_range\` = VALUES(\`question_range\`),
          \`is_unlocked\` = VALUES(\`is_unlocked\`),
          \`answers_text\` = VALUES(\`answers_text\`),
          \`answers_json\` = VALUES(\`answers_json\`),
          \`detail_url\` = VALUES(\`detail_url\`)`,
        [
          examPkgId,
          session.sessionNum,
          session.sessionTitle,
          questionRangeStr,
          session.isUnlocked,
          answersText,
          JSON.stringify(sessionAnswers),
          detailWebUrl,
        ],
      );

      console.log(
        `  Session ${session.sessionNum}: "${session.sessionTitle}" (${questionRangeStr}) -> is_unlocked: ${session.isUnlocked}`,
      );
    }
  }

  // 3. Xuất file SQL seed độc lập (để người dùng có thể chạy trực tiếp trên TiDB Console nếu cần)
  await generatePureSqlSeed(examsToSync);

  await conn.end();
  console.log('\nAll exam solutions synced to Database successfully!');
}

async function generatePureSqlSeed(
  data: { exam: SolutionExam; sessions: SessionDef[] }[],
) {
  const seedFilePath = path.resolve(
    process.cwd(),
    'scripts/migrations/10_seed_exam_solutions_n5_de1.sql',
  );

  let sql = `-- ==============================================================================
-- TiDB / MySQL Seed: Đáp án Đề 1 N5 chia theo 3 buổi dạy
-- Tương thích với Website và Zalo Bot
-- ==============================================================================

`;

  for (const { exam, sessions } of data) {
    const examPkgId = `${exam.level}_de${String(exam.examNumber).padStart(2, '0')}`;
    const totalQuestions = exam.questions.length;
    const totalSessions = sessions.length;
    const detailWebUrl = `https://www.pthamnihongo.site/vi/solutions?level=${exam.level}&exam=${exam.examNumber}`;

    const escapedTitle = mysql.escape(exam.title);
    const escapedSubtitle = mysql.escape(exam.subtitle || '');
    const escapedAuthor = mysql.escape(exam.author || '');
    const escapedFullData = mysql.escape(JSON.stringify(exam));

    sql += `-- 1. Insert Exam Package
INSERT INTO \`exam_packages\` (\`id\`, \`level\`, \`exam_number\`, \`title\`, \`subtitle\`, \`author\`, \`total_questions\`, \`total_sessions\`, \`full_data\`)
VALUES (
  '${examPkgId}',
  '${exam.level}',
  ${exam.examNumber},
  ${escapedTitle},
  ${escapedSubtitle},
  ${escapedAuthor},
  ${totalQuestions},
  ${totalSessions},
  ${escapedFullData}
)
ON DUPLICATE KEY UPDATE
  \`title\` = VALUES(\`title\`),
  \`subtitle\` = VALUES(\`subtitle\`),
  \`author\` = VALUES(\`author\`),
  \`total_questions\` = VALUES(\`total_questions\`),
  \`total_sessions\` = VALUES(\`total_sessions\`),
  \`full_data\` = VALUES(\`full_data\`);\n\n`;

    sql += `-- 2. Insert Exam Sessions\n`;
    for (const session of sessions) {
      const sessionQuestions = exam.questions.filter(
        q => q.globalNumber >= session.startQ && q.globalNumber <= session.endQ,
      );

      const sessionAnswers = sessionQuestions.map(q => ({
        qNum: q.globalNumber,
        answer: q.correctOption,
        part: q.partId,
        partTitle: q.partTitle,
        hanviet: q.hanviet,
        meaning: q.meaning,
      }));

      const answersText = formatZaloAnswersText(
        `${exam.level.toUpperCase()} - Đề ${exam.examNumber}`,
        session.sessionTitle,
        session.startQ,
        session.endQ,
        sessionAnswers.map(a => ({ qNum: a.qNum, answer: a.answer })),
        detailWebUrl,
      );

      const escapedSessionTitle = mysql.escape(session.sessionTitle);
      const escapedQuestionRange = mysql.escape(
        `${session.startQ}-${session.endQ}`,
      );
      const escapedAnswersText = mysql.escape(answersText);
      const escapedAnswersJson = mysql.escape(JSON.stringify(sessionAnswers));
      const escapedDetailUrl = mysql.escape(detailWebUrl);

      sql += `INSERT INTO \`exam_sessions\` (\`exam_id\`, \`session_num\`, \`session_title\`, \`question_range\`, \`is_unlocked\`, \`answers_text\`, \`answers_json\`, \`detail_url\`)
VALUES (
  '${examPkgId}',
  ${session.sessionNum},
  ${escapedSessionTitle},
  ${escapedQuestionRange},
  ${session.isUnlocked},
  ${escapedAnswersText},
  ${escapedAnswersJson},
  ${escapedDetailUrl}
)
ON DUPLICATE KEY UPDATE
  \`session_title\` = VALUES(\`session_title\`),
  \`question_range\` = VALUES(\`question_range\`),
  \`is_unlocked\` = VALUES(\`is_unlocked\`),
  \`answers_text\` = VALUES(\`answers_text\`),
  \`answers_json\` = VALUES(\`answers_json\`),
  \`detail_url\` = VALUES(\`detail_url\`);\n\n`;
    }
  }

  fs.writeFileSync(seedFilePath, sql, 'utf8');
  console.log(`Generated SQL seed file: ${seedFilePath}`);
}

main().catch(err => {
  console.error('Error syncing exam solutions:', err);
  process.exit(1);
});
