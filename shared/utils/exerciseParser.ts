import { ExerciseQuestion } from '../types/exercise';

/**
 * Parse text formatted in Aiken or relaxed Markdown format into ExerciseQuestion[]
 */
export function parseAikenFormat(text: string): ExerciseQuestion[] {
  if (!text || !text.trim()) return [];

  // Split text into segments starting with [PASSAGE
  const segments = text.split(/(?=\[PASSAGE(?::[^\]]*)?\])/i);
  const questions: ExerciseQuestion[] = [];
  let questionCounter = 1;

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

        // Check for Answer / Đáp án
        const answerMatch = line.match(
          /^(?:ANSWER|ĐÁP ÁN|DAP AN|KEY|ĐÁP ÁN ĐÚNG)[:\s]+([A-Da-d0-9]+|.+)/i,
        );
        if (answerMatch) {
          correctAnswer = answerMatch[1].trim().toUpperCase();
          continue;
        }

        // Check for Explanation / Giải thích
        const explMatch = line.match(
          /^(?:EXPLANATION|GIẢI THÍCH|GIAI THICH|NOTE|LỜI GIẢI)[:\s]+(.+)/i,
        );
        if (explMatch) {
          explanation = explMatch[1].trim();
          continue;
        }

        // Check for Option: A. text, A) text, [A] text
        const optionMatch = line.match(/^([A-Da-d])[\.\)\:\-]\s*(.+)/);
        if (optionMatch) {
          options.push(optionMatch[2].trim());
          continue;
        }

        // If we haven't found options yet, treat as part of question text
        if (options.length === 0) {
          // Strip out leading "Câu 1:", "Question 1:", "1."
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
        // Normalize correct answer
        let normAnswer = 'A';
        if (['A', 'B', 'C', 'D'].includes(correctAnswer)) {
          normAnswer = correctAnswer;
        } else {
          // Check if correct answer matches option text
          const foundIdx = options.findIndex(
            opt => opt.toLowerCase() === correctAnswer.toLowerCase(),
          );
          if (foundIdx >= 0) {
            normAnswer = String.fromCharCode(65 + foundIdx);
          }
        }

        questions.push({
          id: questionCounter++,
          passage_title: passageTitle,
          passage: passageContent,
          question: questionText.trim(),
          options: options.slice(0, 4),
          correct_answer: normAnswer,
          explanation: explanation || undefined,
        });
      }
    }
  }

  return questions;
}

/**
 * Parses CSV text into ExerciseQuestion[]
 * Format: question, option_a, option_b, option_c, option_d, correct_answer, explanation
 */
export function parseCsvFormat(csvText: string): ExerciseQuestion[] {
  if (!csvText || !csvText.trim()) return [];

  // Remove potential UTF-8 BOM
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

/**
 * Parses JSON format
 */
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

/**
 * Returns a downloadable sample CSV template
 */
export function generateSampleCsvTemplate(): string {
  return `question,option_a,option_b,option_c,option_d,correct_answer,explanation
"Từ nào sau đây có nghĩa là 'Ngày mai'?","きのう","あした","きょう","あさって","B","あした nghĩa là ngày mai, きのう là hôm qua."
"Chọn cách đọc đúng của chữ Hán: 先生","せんせい","がくせい","いしゃ","かいしゃいん","A","先生 đọc là せんせい, có nghĩa là giáo viên."
"Điền từ thích hợp vào chỗ trống: わたし___ ベトナム人です。","を","に","は","で","C","は là trợ từ chỉ chủ ngữ trong câu khẳng định cơ bản."
"Ý nghĩa của câu 'ありがとうございます' là gì?","Xin lỗi","Cảm ơn","Tạm biệt","Chúc ngủ ngon","B","ありがとうございます có nghĩa là Cảm ơn rất nhiều."`;
}

/**
 * Returns a sample Aiken text for fast testing
 */
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
EXPLANATION: 先生 đọc là せんせい (sensei), có nghĩa là giáo viên / thầy cô.

Câu 3: Điền trợ từ thích hợp: わたし ___ ベトナム人です。
A. を
B. に
C. は
D. で
ANSWER: C
EXPLANATION: は là trợ từ chỉ chủ ngữ trong câu giới thiệu/khẳng định.`;
}

/**
 * Returns a sample Aiken text with Reading Comprehension [PASSAGE] for fast testing
 */
export function generateSampleReadingAikenTemplate(): string {
  return `[PASSAGE: 初めての野球]
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
