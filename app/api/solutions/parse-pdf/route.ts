import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/shared/infra/server/db';
import { verifyJwt } from '@/shared/utils/auth';
import { env } from '@/shared/config/env';
import type { RowDataPacket } from 'mysql2';
import type {
  SolutionExam,
  SolutionQuestion,
  SolutionSectionSummary,
} from '@/features/Solutions/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Up to 60s for AI document analysis

interface UserRow extends RowDataPacket {
  id: number;
  is_admin: number;
}

/**
 * Check if the request comes from an authenticated administrator
 */
async function checkAdmin(request: NextRequest): Promise<boolean> {
  const adminSession = request.cookies.get('ptham_admin_session')?.value;
  if (adminSession) return true;

  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    // In development mode, allow if localhost testing
    return process.env.NODE_ENV === 'development';
  }

  const payload = await verifyJwt(token);
  if (!payload?.userId) {
    return process.env.NODE_ENV === 'development';
  }

  try {
    const pool = getDbPool();
    const [rows] = await pool.execute<UserRow[]>(
      'SELECT id, is_admin FROM users WHERE id = ?',
      [payload.userId as number],
    );
    return rows.length > 0 && Number(rows[0].is_admin) === 1;
  } catch {
    return process.env.NODE_ENV === 'development';
  }
}

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-flash-lite-latest',
];

export async function POST(request: NextRequest) {
  try {
    // 1. Check admin permission
    const isAdmin = await checkAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message:
            'Chức năng phân tích đề thi bằng AI chỉ dành cho Quản trị viên.',
        },
        { status: 403 },
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const rawLevel = (formData.get('level') as string)?.toLowerCase() || 'n5';
    const level = ['n5', 'n4', 'n3', 'n2', 'n1'].includes(rawLevel)
      ? (rawLevel as 'n5' | 'n4' | 'n3' | 'n2' | 'n1')
      : 'n5';
    const examNumber = parseInt(
      (formData.get('examNumber') as string) || '1',
      10,
    );
    const titleInput = (formData.get('title') as string)?.trim();
    const authorInput = (formData.get('author') as string)?.trim();
    const clientApiKey = (formData.get('apiKey') as string)?.trim();
    const userPromptHint = (formData.get('promptHint') as string)?.trim();

    if (!file) {
      return NextResponse.json(
        {
          error: 'missing_file',
          message: 'Vui lòng chọn một file PDF đề thi.',
        },
        { status: 400 },
      );
    }

    if (
      !file.name.toLowerCase().endsWith('.pdf') &&
      file.type !== 'application/pdf'
    ) {
      return NextResponse.json(
        {
          error: 'invalid_format',
          message: 'Tệp tải lên không phải là định dạng PDF.',
        },
        { status: 400 },
      );
    }

    // Limit file size to 25MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: 'file_too_large',
          message:
            'Dung lượng tệp PDF vượt quá giới hạn 25MB. Vui lòng nén hoặc chia nhỏ file.',
        },
        { status: 400 },
      );
    }

    // 3. Resolve Gemini API Key
    const apiKey =
      clientApiKey ||
      env.gemini.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'missing_api_key',
          message:
            'Chưa có Google Gemini API Key. Bạn vui lòng nhập API Key trực tiếp trong form nhập đề thi hoặc cấu hình biến môi trường GEMINI_API_KEY trên máy chủ.',
        },
        { status: 400 },
      );
    }

    // 4. Convert file to base64
    const fileBytes = await file.arrayBuffer();
    const base64Pdf = Buffer.from(fileBytes).toString('base64');

    // 5. Construct detailed prompt for Gemini
    const systemInstruction = `
Bạn là một chuyên gia khảo thí và biên soạn đề thi tiếng Nhật JLPT cao cấp thuộc Hệ thống Nhật Ngữ Phan Thắm SS - Minato.
Nhiệm vụ của bạn: Đọc toàn bộ tài liệu đề thi PDF được đính kèm và trích xuất thành một bộ đề hoàn chỉnh với lời giải chi tiết theo đúng cấu trúc JSON được yêu cầu.

Cấp độ đề thi: JLPT ${level.toUpperCase()}
Số thứ tự đề: Đề số ${examNumber}
${userPromptHint ? `Ghi chú thêm từ giáo viên: ${userPromptHint}` : ''}

QUY TẮC PHÂN TÍCH VÀ TRÍCH XUẤT:
1. ĐỌC TOÀN BỘ CÂU HỎI TRONG ĐỀ:
   - Trích xuất từng câu hỏi theo đúng thứ tự xuất hiện trong đề.
   - Số câu hỏi toàn bài: globalNumber tăng dần liên tục từ 1, 2, 3... đến hết (ví dụ N5 thường có 35 câu: 16 câu từ vựng, 16 câu ngữ pháp/dấu sao, 3 câu bài đọc).
   - questionNumber: Số thứ tự câu hỏi trong đề gốc.

2. XÁC ĐỊNH ĐÁP ÁN ĐÚNG (correctOption):
   - Giá trị là chuỗi: "1", "2", "3" hoặc "4".
   - Nếu trong file PDF có bảng đáp án đính kèm (ở cuối hoặc đầu trang), hãy dùng bảng đáp án chuẩn đó.
   - Nếu đề thi trống chưa có đáp án, hãy giải chính xác 100% bằng kiến thức chuyên gia JLPT.
   - correctText: Nội dung chữ tiếng Nhật của đáp án đúng.

3. DỊCH NGHĨA VÀ GIẢI THÍCH CHI TIẾT (THEO PHONG CÁCH GIẢNG DẠY PHAN THẮM SS):
   - meaning: Dịch câu hỏi sang tiếng Việt tự nhiên, chuẩn văn phong sư phạm.
   - explanation: Giải thích cặn kẽ tại sao chọn đáp án này, phân tích cấu trúc ngữ pháp, cách chia từ, từ vựng liên quan.
   - hanviet: Âm Hán Việt (chữ in hoa) nếu câu hỏi kiểm tra Chữ Hán / Từ vựng (ví dụ: "NGÂN HÀNG", "ĐIỆN THOẠI"), hoặc null nếu là ngữ pháp thuần.
   - conclusion: Quy tắc cốt lõi cần nhớ hoặc công thức ngữ pháp ngắn gọn để học sinh ghi chú.
   - wrongOptions: Mảng 3 phần tử giải thích 3 phương án còn lại (option: "1"|"2"|"3"|"4", text: phân tích ngắn tại sao phương án đó sai hoặc nghĩa của từ đó).
   - Với câu hỏi Dấu sao (partId: 'star'):
     * starPositions: mảng 4 phương án theo đúng thứ tự 1, 2, 3, 4
     * starOrder: chuỗi thứ tự ghép đúng (ví dụ: "3 - 2 - 1 - 4")
     * fullSentence: toàn bộ câu hoàn chỉnh sau khi ghép đúng từ
   - partId: Một trong các giá trị: 'vocab' (từ vựng), 'kanji' (chữ hán), 'similar' (từ đồng nghĩa/cách dùng), 'grammar' (ngữ pháp), 'star' (dấu sao), 'passage' (đọc hiểu đoạn văn).

HÃY TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON (KHÔNG KÈM TEXT GIẢI THÍCH NGOÀI LỀ) VỚI CẤU TRÚC SAU:
{
  "id": "${level}-de${examNumber}",
  "level": "${level}",
  "examNumber": ${examNumber},
  "title": "${titleInput || `Đề Thi Thử JLPT ${level.toUpperCase()} - Số ${examNumber}`}",
  "subtitle": "Đề thi chính thức chuẩn JLPT - Lời giải chi tiết Minato",
  "author": "${authorInput || 'Phan Thắm SS - Minato'}",
  "watermarkImage": "/brand/ptham-logo.webp",
  "totalPages": 5,
  "questions": [
    {
      "id": "${level}-de${examNumber}-q1",
      "globalNumber": 1,
      "questionNumber": 1,
      "sectionNumber": 1,
      "sectionTitle": "Mondai 1: Cách đọc chữ Hán (漢字読み)",
      "partId": "kanji",
      "partTitle": "PHẦN 1: TỪ VỰNG - HÁN TỰ (文字・語彙)",
      "questionText": "毎朝　しんぶんを　【読みます】。",
      "correctOption": "2",
      "correctText": "よみます",
      "hanviet": "ĐỘC",
      "meaning": "Mỗi sáng tôi đều đọc báo.",
      "explanation": "Chữ Hán 【読】 trong 【読みます】 âm Kunyomi là 「よ(む)」 mang nghĩa là đọc. Phương án 2 là đáp án chính xác.",
      "conclusion": "ĐỘC (読) -> よみます (đọc sách, báo).",
      "wrongOptions": [
        { "option": "1", "text": "のみます: Uống (Chữ Hán: 飲)" },
        { "option": "3", "text": "やすみます: Nghỉ ngơi (Chữ Hán: 休)" },
        { "option": "4", "text": "みます: Xem, nhìn (Chữ Hán: 見)" }
      ],
      "note": null
    }
  ]
}
`;

    // 6. Call Gemini API with model fallback
    let rawResponseText = '';
    let usedModel = '';
    let lastErrorMsg = '';

    for (const model of GEMINI_MODELS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inlineData: {
                      mimeType: 'application/pdf',
                      data: base64Pdf,
                    },
                  },
                  {
                    text: systemInstruction,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
              maxOutputTokens: 8192,
            },
          }),
        });

        if (response.ok) {
          const resultJson = await response.json();
          const candidateText =
            resultJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            rawResponseText = candidateText;
            usedModel = model;
            break;
          }
        } else {
          const errText = await response.text();
          lastErrorMsg = `[${model}] Status ${response.status}: ${errText}`;
          console.warn(`Gemini model ${model} failed:`, errText);
        }
      } catch (err) {
        lastErrorMsg = `[${model}] ${err instanceof Error ? err.message : String(err)}`;
        console.warn(`Call to ${model} threw error:`, err);
      }
    }

    if (!rawResponseText) {
      return NextResponse.json(
        {
          error: 'ai_call_failed',
          message:
            'Không thể kết nối đến Gemini AI hoặc file PDF không thể đọc được. Chi tiết: ' +
            lastErrorMsg,
        },
        { status: 502 },
      );
    }

    // 7. Parse & Sanitize returned JSON
    let cleanedText = rawResponseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedData: Partial<SolutionExam>;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(
        'JSON Parse Error from Gemini response:',
        parseError,
        cleanedText,
      );
      return NextResponse.json(
        {
          error: 'invalid_ai_response',
          message:
            'AI đã phản hồi nhưng định dạng JSON bị lỗi cú pháp. Vui lòng thử lại.',
          raw: cleanedText.slice(0, 500),
        },
        { status: 502 },
      );
    }

    // 8. Normalize questions and build complete SolutionExam
    const rawQuestions = Array.isArray(parsedData.questions)
      ? parsedData.questions
      : [];

    if (rawQuestions.length === 0) {
      return NextResponse.json(
        {
          error: 'no_questions_found',
          message:
            'Không tìm thấy câu hỏi nào trong file PDF này. Vui lòng kiểm tra lại file đề thi.',
        },
        { status: 422 },
      );
    }

    const sanitizedQuestions: SolutionQuestion[] = rawQuestions.map(
      (q: Partial<SolutionQuestion>, index: number) => {
        const globalNum = Number(q.globalNumber) || index + 1;
        const partId = (q.partId || 'vocab') as SolutionQuestion['partId'];

        return {
          id: `${level}-de${examNumber}-q${globalNum}`,
          globalNumber: globalNum,
          questionNumber: Number(q.questionNumber) || globalNum,
          sessionNumber:
            Number(q.sessionNumber) ||
            (globalNum <= 15 ? 1 : globalNum <= 30 ? 2 : 3),
          sectionNumber: Number(q.sectionNumber) || 1,
          sectionTitle: q.sectionTitle || 'Phần câu hỏi',
          partId,
          partTitle:
            q.partTitle ||
            (['vocab', 'kanji', 'similar'].includes(partId)
              ? 'PHẦN 1: TỪ VỰNG - HÁN TỰ (文字・語彙)'
              : partId === 'passage'
                ? 'PHẦN 3: ĐỌC HIỂU (読解)'
                : 'PHẦN 2: NGỮ PHÁP (文法)'),
          questionText: q.questionText || `Câu số ${globalNum}`,
          correctOption: String(q.correctOption || '1'),
          correctText: q.correctText || '',
          hanviet: q.hanviet || null,
          meaning: q.meaning || '',
          explanation: q.explanation || 'Chưa có giải thích chi tiết.',
          conclusion: q.conclusion || null,
          wrongOptions: Array.isArray(q.wrongOptions)
            ? q.wrongOptions.map(w => ({
                option: String(w.option || ''),
                text: String(w.text || ''),
              }))
            : [],
          starPositions: q.starPositions,
          starOrder: q.starOrder || null,
          fullSentence: q.fullSentence || null,
          note: q.note || null,
        };
      },
    );

    // Compute quickAnswerSummary
    const vocabList: { qNum: number; answer: string }[] = [];
    const grammarList: { qNum: number; answer: string }[] = [];

    sanitizedQuestions.forEach(q => {
      if (['vocab', 'kanji', 'similar'].includes(q.partId)) {
        vocabList.push({ qNum: q.globalNumber, answer: q.correctOption });
      } else {
        grammarList.push({ qNum: q.globalNumber, answer: q.correctOption });
      }
    });

    // Compute sections automatically
    const sectionMap = new Map<number, SolutionSectionSummary>();
    sanitizedQuestions.forEach(q => {
      const secNum = q.sectionNumber || 1;
      if (!sectionMap.has(secNum)) {
        sectionMap.set(secNum, {
          sectionNumber: secNum,
          sectionTitle: q.sectionTitle || `Mondai ${secNum}`,
          questionRange: `${q.globalNumber}`,
          questions: [],
        });
      }
      const sec = sectionMap.get(secNum)!;
      sec.questions.push({
        questionNumber: q.questionNumber,
        globalNumber: q.globalNumber,
        correctOption: q.correctOption,
        note: q.note,
      });
    });

    const sections: SolutionSectionSummary[] = Array.from(
      sectionMap.values(),
    ).map(sec => {
      const minQ = sec.questions[0]?.globalNumber || 1;
      const maxQ =
        sec.questions[sec.questions.length - 1]?.globalNumber || minQ;
      return {
        ...sec,
        questionRange: `${minQ}-${maxQ}`,
      };
    });

    const completeExam: SolutionExam = {
      id: `${level}-de${examNumber}`,
      level,
      examNumber,
      title:
        titleInput ||
        parsedData.title ||
        `Đề Thi Thử JLPT ${level.toUpperCase()} - Số ${examNumber}`,
      subtitle:
        parsedData.subtitle ||
        'Đề thi chính thức chuẩn JLPT - Lời giải chi tiết Minato',
      author: authorInput || parsedData.author || 'Phan Thắm SS - Minato',
      watermarkImage: parsedData.watermarkImage || '/brand/ptham-logo.webp',
      totalPages: Math.ceil(sanitizedQuestions.length / 7) || 5,
      sections,
      quickAnswerSummary: {
        vocab: vocabList,
        grammar: grammarList,
      },
      passageSection: parsedData.passageSection,
      questions: sanitizedQuestions,
    };

    return NextResponse.json({
      success: true,
      modelUsed: usedModel,
      totalQuestions: sanitizedQuestions.length,
      exam: completeExam,
    });
  } catch (error) {
    console.error('Error in /api/solutions/parse-pdf:', error);
    return NextResponse.json(
      {
        error: 'internal_error',
        message:
          'Đã xảy ra lỗi trong quá trình xử lý tệp PDF: ' +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}
