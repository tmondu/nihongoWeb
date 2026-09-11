export interface ExerciseQuestion {
  id: number | string;
  part_name?: string;
  passage_title?: string;
  passage?: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
  explanation_image?: string;
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

  // Split text into segments starting with [PASSAGE
  const segments = text.split(/(?=\[PASSAGE(?::[^\]]*)?\])/i);
  const questions: ExerciseQuestion[] = [];
  let questionCounter = 1;
  let currentPartName = 'Bài 1';

  for (const segment of segments) {
    const trimmedSegment = segment.trim();
    if (!trimmedSegment) continue;

    let passageTitle: string | undefined = undefined;
    let passageContent: string | undefined = undefined;
    let questionsText = trimmedSegment;

    const passageMatch = trimmedSegment.match(
      /^\[PASSAGE(?::\s*([^\]]*))?\]\s*([\s\S]*?)\[\/PASSAGE\]([\s\S]*)$/i,
    );

    if (passageMatch) {
      passageTitle = (passageMatch[1] || '').trim() || undefined;
      passageContent = (passageMatch[2] || '').trim() || undefined;
      questionsText = (passageMatch[3] || '').trim();
    }

    const rawBlocks = questionsText.split(/\n\s*\n+/);

    for (const block of rawBlocks) {
      let trimmedBlock = block.trim();
      if (!trimmedBlock) continue;

      const partMatch =
        trimmedBlock.match(
          /^\[(?:PART|SECTION|BÀI|BAI|MONDAI)(?::\s*([^\]]*))?\]/i,
        ) ||
        trimmedBlock.match(
          /^#{1,3}\s*(Bài\s*\d+[^:\n]*|Mondai\s*\d+[^:\n]*|Part\s*\d+[^:\n]*)/i,
        );

      if (partMatch) {
        currentPartName = (partMatch[1] || 'Bài 1').trim();
        trimmedBlock = trimmedBlock.replace(partMatch[0], '').trim();
        if (!trimmedBlock) continue;
      }

      const lines = trimmedBlock
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
      if (lines.length < 3) continue;

      let questionText = '';
      const options: string[] = [];
      let correctAnswer = '';
      let explanation = '';
      let explanationImage = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const inlinePartMatch = line.match(
          /^\[(?:PART|SECTION|BÀI|BAI|MONDAI)(?::\s*([^\]]*))?\]/i,
        );
        if (inlinePartMatch) {
          currentPartName = (inlinePartMatch[1] || 'Bài 1').trim();
          continue;
        }

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

        const imgMatch = line.match(
          /^(?:EXPLANATION_IMAGE|IMAGE|ẢNH ĐÁP ÁN|ANH DAP AN|HÌNH ẢNH|ẢNH)[:\s]+(https?:\/\/\S+|[^\s]+)/i,
        );
        if (imgMatch) {
          explanationImage = imgMatch[1].trim();
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
          part_name: currentPartName || 'Bài 1',
          passage_title: passageTitle,
          passage: passageContent,
          question: questionText.trim(),
          options: options.slice(0, 4),
          correct_answer: normAnswer,
          explanation: explanation || undefined,
          explanation_image: explanationImage || undefined,
        });
      }
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
    const [qText, optA, optB, optC, optD, answerRaw, explRaw, partRaw] = cols;
    if (!qText || !optA || !optB) continue;

    let ans = (answerRaw || 'A').trim().toUpperCase();
    if (!['A', 'B', 'C', 'D'].includes(ans)) {
      ans = 'A';
    }

    questions.push({
      id: idCounter++,
      part_name: (partRaw || 'Bài 1').trim() || 'Bài 1',
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
      part_name: item.part_name ? String(item.part_name) : 'Bài 1',
      passage_title: item.passage_title
        ? String(item.passage_title)
        : undefined,
      passage: item.passage ? String(item.passage) : undefined,
      question: String(item.question || ''),
      options: Array.isArray(item.options) ? item.options.map(String) : [],
      correct_answer: String(item.correct_answer || 'A').toUpperCase(),
      explanation: item.explanation ? String(item.explanation) : undefined,
      explanation_image: item.explanation_image
        ? String(item.explanation_image)
        : undefined,
    }));
  } catch {
    return [];
  }
}

export function generateSampleCsvTemplate(): string {
  return `question,option_a,option_b,option_c,option_d,correct_answer,explanation,part_name
"Từ nào sau đây có nghĩa là 'Ngày mai'?","きのう","あした","きょう","あさって","B","あした nghĩa là ngày mai, きのう là hôm qua.","Bài 1"
"Chọn cách đọc đúng của chữ Hán: 先生","せんせい","gakuせい","いしゃ","かいしゃいん","A","先生 đọc là せんせい, có nghĩa là giáo viên.","Bài 1"
"Điền từ thích hợp vào chỗ trống: わたし___ ベトナム人です。","を","に","は","で","C","は là trợ từ chỉ chủ ngữ trong câu khẳng định cơ bản.","Bài 2"`;
}

export function generateSampleAikenTemplate(): string {
  return `[PART: Bài 1]
Câu 1: Từ nào sau đây có nghĩa là "Ngày mai"?
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

[PART: Bài 2]
Câu 3: Điền trợ từ thích hợp: わたし ___ ベトナム人です。
A. を
B. に
C. は
D. で
ANSWER: C
EXPLANATION: は là trợ từ chỉ chủ ngữ trong câu giới thiệu / khẳng định.`;
}

export function generateSampleReadingAikenTemplate(): string {
  return `[PART: Bài 1: Đọc hiểu]
[PASSAGE: 初めての野球]
日本に来る前に まんがで 野球という スポーツを 知って、きょうみを もちました。
でも、私の国では、野球をしている人を見たことがありません。道具もないので、野球はできませんでした。

先週の土曜日にともだちが入っている野球クラブの見学に行きました。クラブの人たちにさそわれて、ずっとやりたかった野球の練習を初めてすることになりました。
[ 18 ] 野球ができることになって、うれしかったです。ボールを打つのは難しかったです。でも、クラブの人たちがやさしく [ 19 ]。野球はやはりおもしろいスポーツだと思いました。[ 20 ] クラブに入ることにしました。
[/PASSAGE]

Câu 18: Chọn từ thích hợp điền vào ô [ 18 ]:
A. もっと
B. やっと
C. また
D. まだ
ANSWER: B
EXPLANATION: Dùng やっと (cuối cùng thì) để diễn đạt một việc mong đợi bấy lâu nay đã thành hiện thực.

Câu 19: Chọn cấu trúc thích hợp điền vào ô [ 19 ]:
A. 教えて くれました
B. 教えて あげました
C. 教えて もらいました
D. 教えて やりました
ANSWER: A
EXPLANATION: Chủ ngữ là クラブの人たちが (người khác làm cho mình một việc gì đó) -> dùng 〜てくれました.

Câu 20: Chọn liên từ thích hợp điền vào ô [ 20 ]:
A. それで
B. しかし
C. または
D. ところで
ANSWER: A
EXPLANATION: それで (Vì vậy, do đó) dùng để nối kết quả của việc thấy bóng chày rất thú vị nên quyết định tham gia.`;
}

/**
 * Convert an array of ExerciseQuestion objects back into Aiken format text.
 * Groups questions with the same passage together inside [PASSAGE]...[/PASSAGE] blocks.
 */
export function questionsToAiken(rawQuestions: unknown): string {
  if (!rawQuestions) return '';

  let questions: ExerciseQuestion[] = [];
  if (Array.isArray(rawQuestions)) {
    questions = rawQuestions as ExerciseQuestion[];
  } else if (typeof rawQuestions === 'string') {
    try {
      const parsed = JSON.parse(rawQuestions);
      if (Array.isArray(parsed)) questions = parsed;
    } catch {
      return '';
    }
  }

  if (questions.length === 0) return '';

  const chunks: string[] = [];
  let currentPassage: string | null = null;
  let currentPassageTitle: string | null = null;
  let currentPart: string | null = null;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q) continue;

    const qPart =
      typeof q.part_name === 'string' && q.part_name.trim().length > 0
        ? q.part_name.trim()
        : null;

    if (qPart && qPart !== currentPart) {
      chunks.push(`[PART: ${qPart}]`);
      currentPart = qPart;
    }

    const qPassage =
      typeof q.passage === 'string' && q.passage.trim().length > 0
        ? q.passage.trim()
        : null;
    const qPassageTitle =
      typeof q.passage_title === 'string' && q.passage_title.trim().length > 0
        ? q.passage_title.trim()
        : null;

    // Check if passage changed
    if (qPassage !== currentPassage || qPassageTitle !== currentPassageTitle) {
      if (qPassage) {
        const titlePart = qPassageTitle ? `: ${qPassageTitle}` : '';
        chunks.push(`[PASSAGE${titlePart}]\n${qPassage}\n[/PASSAGE]`);
      }
      currentPassage = qPassage;
      currentPassageTitle = qPassageTitle;
    }

    const questionLines: string[] = [];
    const questionNum = i + 1;
    const qText =
      typeof q.question === 'string'
        ? q.question.trim()
        : String(q.question || '').trim();

    questionLines.push(`Câu ${questionNum}: ${qText}`);

    const letters = ['A', 'B', 'C', 'D'];
    const options = Array.isArray(q.options) ? q.options : [];
    if (options.length > 0) {
      options.forEach((opt: unknown, optIdx: number) => {
        const letter = letters[optIdx] || String.fromCharCode(65 + optIdx);
        const optText =
          typeof opt === 'string' ? opt.trim() : String(opt || '').trim();
        questionLines.push(`${letter}. ${optText}`);
      });
    }

    if (q.correct_answer !== undefined && q.correct_answer !== null) {
      const ansText = String(q.correct_answer).trim().toUpperCase();
      if (ansText) {
        questionLines.push(`ANSWER: ${ansText}`);
      }
    }

    if (q.explanation !== undefined && q.explanation !== null) {
      const explText =
        typeof q.explanation === 'string'
          ? q.explanation.trim()
          : String(q.explanation || '').trim();
      if (explText) {
        questionLines.push(`EXPLANATION: ${explText}`);
      }
    }

    if (q.explanation_image !== undefined && q.explanation_image !== null) {
      const imgText =
        typeof q.explanation_image === 'string'
          ? q.explanation_image.trim()
          : String(q.explanation_image || '').trim();
      if (imgText) {
        questionLines.push(`EXPLANATION_IMAGE: ${imgText}`);
      }
    }

    chunks.push(questionLines.join('\n'));
  }

  return chunks.join('\n\n');
}
