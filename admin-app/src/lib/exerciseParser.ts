export interface ExerciseQuestion {
  id: number | string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

export interface ExerciseRecord {
  id: number;
  title: string;
  description?: string | null;
  level: string;
  time_limit: number;
  questions: ExerciseQuestion[];
  is_published: boolean | number;
  created_at: string;
  updated_at?: string;
  total_questions?: number;
  submissions_count?: number;
}

export interface ExerciseSubmissionRecord {
  id: number;
  exercise_id: number;
  exercise_title?: string;
  exercise_level?: string;
  user_id: number;
  user_email?: string;
  score: number;
  total_questions: number;
  percentage: number;
  answers: Record<string, string>;
  time_spent: number;
  created_at: string;
}

export function parseAikenFormat(text: string): ExerciseQuestion[] {
  if (!text || !text.trim()) return [];

  const rawBlocks = text.split(/\n\s*\n+/);
  const questions: ExerciseQuestion[] = [];
  let questionCounter = 1;

  for (const block of rawBlocks) {
    const lines = block
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    if (lines.length < 3) continue;

    let questionText = '';
    const options: string[] = [];
    let correctAnswer = '';
    let explanation = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const answerMatch = line.match(
        /^(?:ANSWER|ĐÁP ÁN|DAP AN|KEY|ĐÁP ÁN ĐÚNG)[:\s]+([A-Da-d0-9]+|.+)/i,
      );
      if (answerMatch) {
        correctAnswer = answerMatch[1].trim().toUpperCase();
        continue;
      }

      const explMatch = line.match(
        /^(?:EXPLANATION|GIẢI THÍCH|GIAI THICH|NOTE|LỜI GIẢI)[:\s]+(.+)/i,
      );
      if (explMatch) {
        explanation = explMatch[1].trim();
        continue;
      }

      const optionMatch = line.match(/^([A-Da-d])[\.\)\:\-]\s*(.+)/);
      if (optionMatch) {
        options.push(optionMatch[2].trim());
        continue;
      }

      if (options.length === 0) {
        const cleanedLine = line.replace(
          /^(?:Câu|Question|\d+)[\s\d\.\:\-]+/i,
          '',
        );
        questionText = questionText
          ? `${questionText}\n${cleanedLine || line}`
          : cleanedLine || line;
      }
    }

    if (questionText && options.length >= 2) {
      let normAnswer = 'A';
      if (['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        normAnswer = correctAnswer;
      } else {
        const foundIdx = options.findIndex(
          opt => opt.toLowerCase() === correctAnswer.toLowerCase(),
        );
        if (foundIdx >= 0) {
          normAnswer = String.fromCharCode(65 + foundIdx);
        }
      }

      questions.push({
        id: questionCounter++,
        question: questionText.trim(),
        options: options.slice(0, 4),
        correct_answer: normAnswer,
        explanation: explanation || undefined,
      });
    }
  }

  return questions;
}

export function parseCsvFormat(csvText: string): ExerciseQuestion[] {
  if (!csvText || !csvText.trim()) return [];

  const cleaned = csvText.replace(/^\uFEFF/, '');
  const lines = cleaned.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const startIndex =
    lines[0].toLowerCase().includes('question') ||
    lines[0].toLowerCase().includes('câu hỏi')
      ? 1
      : 0;

  const questions: ExerciseQuestion[] = [];
  let idCounter = 1;

  for (let i = startIndex; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 6) continue;

    const [qText, optA, optB, optC, optD, answerRaw, explRaw] = cols;
    if (!qText || !optA || !optB) continue;

    let ans = (answerRaw || 'A').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(ans)) {
      ans = 'A';
    }

    questions.push({
      id: idCounter++,
      question: qText,
      options: [optA, optB, optC || '', optD || ''].filter(Boolean),
      correct_answer: ans,
      explanation: explRaw || undefined,
    });
  }

  return questions;
}

export function parseJsonFormat(jsonText: string): ExerciseQuestion[] {
  try {
    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => ({
      id: item.id || idx + 1,
      question: String(item.question || ''),
      options: Array.isArray(item.options) ? item.options.map(String) : [],
      correct_answer: String(item.correct_answer || 'A').toUpperCase(),
      explanation: item.explanation ? String(item.explanation) : undefined,
    }));
  } catch {
    return [];
  }
}

export function generateSampleCsvTemplate(): string {
  return `question,option_a,option_b,option_c,option_d,correct_answer,explanation
"Từ nào sau đây có nghĩa là 'Ngày mai'?","きのう","あした","きょう","あさって","B","あした nghĩa là ngày mai, きのう là hôm qua."
"Chọn cách đọc đúng của chữ Hán: 先生","せんせい","がくせい","いしゃ","かいしゃいん","A","先生 đọc là せんせい, có nghĩa là giáo viên."
"Điền từ thích hợp vào chỗ trống: わたし___ ベトナム人です。","を","に","は","で","C","は là trợ từ chỉ chủ ngữ trong câu khẳng định cơ bản."`;
}

export function generateSampleAikenTemplate(): string {
  return `Câu 1: Từ nào sau đây có nghĩa là "Ngày mai"?
A. きのう
B. あした
C. きょう
D. あさって
ANSWER: B
EXPLANATION: あした (ashita) nghĩa là ngày mai, きのう (kinou) là hôm qua.

Câu 2: Chọn cách đọc đúng của chữ Hán: 「先生」
A. せんせい
B. がくせい
C. いしゃ
D. かいしゃいん
ANSWER: A
EXPLANATION: 先生 đọc là せんせい (sensei), có nghĩa là giáo viên.

Câu 3: Điền trợ từ thích hợp: わたし ___ ベトナム人です。
A. を
B. に
C. は
D. で
ANSWER: C
EXPLANATION: は là trợ từ chỉ chủ ngữ trong câu giới thiệu / khẳng định.`;
}
