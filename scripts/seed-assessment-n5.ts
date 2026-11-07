import { getDbPool } from '../shared/infra/server/db';
import { ALL_N5_ASSESSMENT_QUESTIONS } from '../features/Assessment/data/assessmentQuestions';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

async function seed() {
  const pool = getDbPool();
  console.log('Seeding Kanji N5 Assessment Test & Questions...');

  const slug = 'kanji-n5-placement';
  const title = 'Đề thi Kanji N5';
  const description =
    'Đề thi Kanji N5 chuẩn Minna no Nihongo (100 câu Trắc nghiệm + 100 câu Tự luận)';

  // 1. Ensure assessment test exists
  const [existing] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM assessment_tests WHERE slug = ?',
    [slug],
  );

  let testId: number;
  if (existing.length === 0) {
    const [res] = await pool.execute<ResultSetHeader>(
      `INSERT INTO assessment_tests (slug, title, description, total_questions, mcq_time_limit, essay_time_limit, is_active)
       VALUES (?, ?, ?, 200, 60, 80, 1)`,
      [slug, title, description],
    );
    testId = res.insertId;
    console.log(`Created new assessment test with ID: ${testId}`);
  } else {
    testId = existing[0].id;
    console.log(`Existing assessment test found with ID: ${testId}`);
    // Clean up old questions for a clean refresh
    await pool.execute('DELETE FROM assessment_questions WHERE test_id = ?', [
      testId,
    ]);
    console.log(`Cleared previous questions for test ID: ${testId}`);
  }

  // 2. Insert all 200 questions in chunks
  console.log(`Inserting ${ALL_N5_ASSESSMENT_QUESTIONS.length} questions...`);

  for (const q of ALL_N5_ASSESSMENT_QUESTIONS) {
    await pool.execute(
      `INSERT INTO assessment_questions 
       (test_id, part, question_type, context_sentence, target_word, kanji_char, options_json, correct_answer, acceptable_answers_json, han_viet, meaning_vi, explanation, order_num)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testId,
        q.part,
        q.question_type,
        q.context_sentence || null,
        q.target_word || null,
        q.kanji_char || null,
        q.options_json ? JSON.stringify(q.options_json) : null,
        q.correct_answer,
        q.acceptable_answers_json
          ? JSON.stringify(q.acceptable_answers_json)
          : null,
        q.han_viet || null,
        q.meaning_vi || null,
        q.explanation || null,
        q.order_num,
      ],
    );
  }

  const [countRows] = await pool.execute<RowDataPacket[]>(
    'SELECT COUNT(*) as cnt FROM assessment_questions WHERE test_id = ?',
    [testId],
  );

  console.log(
    `✅ Successfully seeded ${countRows[0].cnt} questions into database for Test ID ${testId}!`,
  );
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
