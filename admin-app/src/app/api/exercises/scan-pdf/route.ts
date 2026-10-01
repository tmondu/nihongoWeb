import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for multi-page vision processing

interface GeminiQuestionOutput {
  part_name?: string;
  passage_title?: string;
  passage?: string;
  question: string;
  options: string[];
  correct_answer?: string;
  explanation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const clientApiKey = (formData.get('apiKey') as string)?.trim();
    const model =
      (formData.get('model') as string)?.trim() || 'gemini-1.5-flash';

    const apiKey =
      clientApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY ||
      '';

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Chưa có Gemini API Key. Vui lòng nhập API Key trong giao diện hoặc cấu hình GEMINI_API_KEY trong file .env.',
        },
        { status: 400 },
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy tệp tải lên.' },
        { status: 400 },
      );
    }

    // Convert each file into inlineData part for Gemini API
    const inlineDataParts: {
      inline_data: {
        mime_type: string;
        data: string;
      };
    }[] = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');
      let mimeType = file.type || 'application/pdf';

      if (file.name.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (file.name.match(/\.(jpg|jpeg)$/i)) {
        mimeType = 'image/jpeg';
      } else if (file.name.match(/\.png$/i)) {
        mimeType = 'image/png';
      } else if (file.name.match(/\.webp$/i)) {
        mimeType = 'image/webp';
      }

      inlineDataParts.push({
        inline_data: {
          mime_type: mimeType,
          data: base64Data,
        },
      });
    }

    const systemPrompt = `You are a high-precision Japanese Language Proficiency Test (JLPT) exam parser and educator.
Your task is to analyze the provided Japanese exam paper PDF document or image(s) and accurately extract all questions and choices into structured JSON.

CRITICAL RULES FOR EXTRACTION:
1. Section/Part Name: Extract the overarching section instruction (e.g. "問題 1 : _____ の ことばは ひらがなで どう かきますか...", "問題 2", "Bài 1", "Mondai 1") into 'part_name'.
2. Question Text: Extract the full question sentence.
   - VERY IMPORTANT: If a word, kanji, or phrase in the question is UNDERLINED in the original document, you MUST wrap it with <u>...</u> HTML tags (e.g. "【19】かぞくに てがみを <u>書きました</u>。").
   - If the question contains blanks like [ 18 ], preserve it as [ 18 ].
   - Preserve question number prefix like "【19】" or "[19]".
3. Reading Passages: If there is a reading comprehension passage (Đoạn văn đọc hiểu) associated with questions, extract the passage text into 'passage' and title in 'passage_title'.
4. Options: Extract exactly 4 choices into the 'options' array: [option1, option2, option3, option4].
   - Remove leading choice numbers like 1, 2, 3, 4 or ①, ②, ③, ④ from the option text.
5. Correct Answer: Determine and assign the most accurate correct answer: "A", "B", "C", or "D" (where A=1, B=2, C=3, D=4).
6. Explanation: Provide a helpful, clear Vietnamese explanation detailing why the answer is correct and translating the sentence/word.

Return ONLY a valid JSON array of question objects without markdown wrapping code blocks.`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            ...inlineDataParts,
            {
              text: 'Please extract all Japanese questions and options from the provided documents according to the system instructions. Output pure JSON array.',
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json',
      },
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
    };

    const targetModel = model.includes('pro')
      ? 'gemini-1.5-pro'
      : 'gemini-1.5-flash';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.json().catch(() => ({}));
      console.error('Gemini API Error:', errData);
      const msg =
        errData?.error?.message ||
        `Lỗi gọi Gemini API (HTTP ${geminiRes.status})`;
      return NextResponse.json(
        { success: false, message: msg },
        { status: 500 },
      );
    }

    const geminiData = await geminiRes.json();
    const candidateText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    if (!candidateText) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không nhận được kết quả phân tích từ Gemini AI.',
        },
        { status: 500 },
      );
    }

    // Parse JSON
    let parsedQuestions: GeminiQuestionOutput[] = [];
    try {
      // Strip ```json and ``` if present
      const cleaned = candidateText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```$/i, '')
        .trim();
      parsedQuestions = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('JSON Parse Error from Gemini:', parseError, candidateText);
      return NextResponse.json(
        {
          success: false,
          message: 'Dữ liệu AI trả về không đúng định dạng JSON.',
          raw: candidateText,
        },
        { status: 500 },
      );
    }

    if (!Array.isArray(parsedQuestions)) {
      if (typeof parsedQuestions === 'object' && parsedQuestions !== null) {
        // In case Gemini wrapped in { questions: [...] }
        const obj = parsedQuestions as Record<string, unknown>;
        if (Array.isArray(obj.questions)) {
          parsedQuestions = obj.questions as GeminiQuestionOutput[];
        } else {
          parsedQuestions = [parsedQuestions as GeminiQuestionOutput];
        }
      } else {
        parsedQuestions = [];
      }
    }

    // Format & validate questions
    const formattedQuestions = parsedQuestions.map((q, idx) => {
      let opts = Array.isArray(q.options) ? q.options.map(String) : [];
      while (opts.length < 4) {
        opts.push(`Phương án ${opts.length + 1}`);
      }
      if (opts.length > 4) opts = opts.slice(0, 4);

      let correct = String(q.correct_answer || 'A').toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(correct)) {
        if (correct === '1') correct = 'A';
        else if (correct === '2') correct = 'B';
        else if (correct === '3') correct = 'C';
        else if (correct === '4') correct = 'D';
        else correct = 'A';
      }

      return {
        id: idx + 1,
        part_name: q.part_name?.trim() || 'Bài 1',
        passage_title: q.passage_title?.trim() || '',
        passage: q.passage?.trim() || '',
        question: q.question?.trim() || '',
        options: opts,
        correct_answer: correct,
        explanation: q.explanation?.trim() || '',
        explanation_image: '',
      };
    });

    return NextResponse.json({
      success: true,
      model: targetModel,
      total_extracted: formattedQuestions.length,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error('Scan PDF API Exception:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Đã xảy ra lỗi máy chủ khi quét tài liệu PDF.',
      },
      { status: 500 },
    );
  }
}
