/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mysql, { Pool } from 'mysql2/promise';

dotenv.config();

// Types
interface KanjiEntry {
  id: number;
  kanjiChar: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  hanviet?: string;
}

interface VocabEntry {
  jmdict_seq: string;
  kana: string;
  kanji: string;
  waller_definition: string;
}

interface AICache {
  kanji: Record<string, { meanings: string[]; hanviet: string }>;
  vocab: Record<string, string>; // jmdict_seq -> translated definition
}

// Config
const CACHE_FILE = path.join(
  process.cwd(),
  'scripts',
  '.ai_translate_cache.json',
);
const HANVIET_FILE = path.join(
  process.cwd(),
  'shared',
  'data',
  'kanji_hanviet.json',
);
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// CLI Args parsing
const args = process.argv.slice(2);
const getArg = (name: string): string | null => {
  const match = args.find(a => a.startsWith(`--${name}=`));
  if (match) return match.split('=')[1];
  const idx = args.indexOf(`--${name}`);
  if (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')) {
    return args[idx + 1];
  }
  return null;
};
const hasFlag = (name: string): boolean => args.includes(`--${name}`);

const TARGET_LEVEL = (getArg('level') || 'all').toLowerCase(); // n5, n4, n3, n2, n1, all
const TARGET_TYPE = (getArg('type') || 'all').toLowerCase(); // kanji, vocab, all
const IS_TEST = hasFlag('test');
const IS_HANVIET_ONLY = hasFlag('hanviet-only');
const SYNC_DB = hasFlag('sync-db') || !IS_TEST;
const SYNC_JSON = hasFlag('sync-json') || !IS_TEST;
const DUMP_SQL = hasFlag('dump-sql');
const BATCH_SIZE = 30;

// API Keys
const GEMINI_KEY = getArg('gemini-key') || process.env.GEMINI_API_KEY || '';
const OPENAI_KEY = getArg('openai-key') || process.env.OPENAI_API_KEY || '';

// Load existing Hán Việt dataset
let hanvietDataset: Record<string, string> = {};
if (fs.existsSync(HANVIET_FILE)) {
  try {
    hanvietDataset = JSON.parse(fs.readFileSync(HANVIET_FILE, 'utf8'));
  } catch (e) {
    console.warn('Could not parse kanji_hanviet.json:', e);
  }
}

// Load Cache
let cache: AICache = { kanji: {}, vocab: {} };
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    console.log(
      `✓ Đã tải cache: ${Object.keys(cache.kanji).length} kanji, ${Object.keys(cache.vocab).length} từ vựng.`,
    );
  } catch {
    console.warn('Tạo mới cache dịch...');
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Call Gemini API directly via HTTP
 */
async function callGemini(prompt: string): Promise<string> {
  // Use gemini-1.5-flash or gemini-2.0-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Không nhận được nội dung từ Gemini API');
  return text;
}

/**
 * Call OpenAI API directly via HTTP
 */
async function callOpenAI(
  prompt: string,
  systemPrompt: string,
): Promise<string> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Không nhận được nội dung từ OpenAI API');
  return text;
}

/**
 * Dispatch prompt to active AI provider
 */
async function callAI(
  userPrompt: string,
  systemPrompt: string,
): Promise<string> {
  if (GEMINI_KEY) {
    const fullPrompt = `${systemPrompt}\n\nYêu cầu dữ liệu:\n${userPrompt}`;
    return await callGemini(fullPrompt);
  } else if (OPENAI_KEY) {
    return await callOpenAI(userPrompt, systemPrompt);
  } else {
    throw new Error(
      'Chưa cấu hình GEMINI_API_KEY hoặc OPENAI_API_KEY. Vui lòng đặt trong file .env hoặc truyền qua cờ --gemini-key=... hoặc --openai-key=...',
    );
  }
}

/**
 * Batch translate Vocab items
 */
async function translateVocabBatch(
  items: {
    jmdict_seq: string;
    kana: string;
    kanji: string;
    current_def: string;
  }[],
): Promise<Record<string, string>> {
  const systemPrompt = `Bạn là chuyên gia dịch thuật tiếng Nhật sư phạm hàng đầu cho người Việt học tiếng Nhật (trình độ Minna no Nihongo, Soumatome, Shinkanzen Master).
Nhiệm vụ: Dịch các từ vựng tiếng Nhật dưới đây sang nghĩa tiếng Việt chuẩn, tự nhiên, ngắn gọn và thông dụng nhất cho người học.

Quy tắc BẮT BUỘC:
1. Dịch trực tiếp từ từ tiếng Nhật (Kanji/Kana). Trường 'current_def' (nghĩa tiếng Anh/Việt cũ) chỉ dùng để tham khảo ngữ cảnh nếu từ có nhiều nghĩa.
2. TUYỆT ĐỐI KHÔNG dịch máy móc:
   - Các từ đếm số lượng (ví dụ "counter for days/years"): Dịch là "đơn vị đếm ngày / mùng...", "đơn vị đếm năm". KHÔNG BAO GIỜ dịch là "truy cập".
   - 相手 (あいて): Dịch là "đối phương, người đối diện, bạn đồng hành" (KHÔNG dịch là "công ty").
   - アイロン: "bàn ủi, bàn là" (bỏ chữ "điện").
   - あいにく: "không may, thật tiếc".
   - Xóa bỏ các nhãn từ loại thô như "(danh từ)", "(tính từ)", "(động từ)", "(adj.)".
3. Mỗi từ trả về 1-3 nghĩa thông dụng nhất, cách nhau bằng dấu phẩy ", ". Ngắn gọn, súc tích (dưới 10 từ).
4. Định dạng trả về BẮT BUỘC là JSON Object: { "results": { "<jmdict_seq>": "nghĩa tiếng Việt" } }`;

  const inputJson = JSON.stringify(
    items.map(item => ({
      id: item.jmdict_seq,
      word: item.kanji || item.kana,
      reading: item.kana,
      context: item.current_def,
    })),
    null,
    2,
  );

  let attempts = 0;
  while (attempts < 3) {
    try {
      const responseText = await callAI(inputJson, systemPrompt);
      const parsed = JSON.parse(responseText);
      const results = parsed.results || parsed;
      return results;
    } catch (e: any) {
      attempts++;
      console.warn(`Lỗi mẻ từ vựng (thử lần ${attempts}/3):`, e.message);
      await sleep(2000 * attempts);
    }
  }
  return {};
}

/**
 * Batch translate Kanji items
 */
async function translateKanjiBatch(
  items: {
    kanjiChar: string;
    onyomi: string[];
    kunyomi: string[];
    current_meanings: string[];
  }[],
): Promise<Record<string, { meanings: string[]; hanviet: string }>> {
  const systemPrompt = `Bạn là chuyên gia Hán Nôm và tiếng Nhật hàng đầu cho người Việt.
Nhiệm vụ: Cung cấp Âm Hán Việt chuẩn xác (VIẾT HOA) và các nghĩa tiếng Việt tự nhiên, súc tích cho các chữ Hán (Kanji).

Quy tắc BẮT BUỘC:
1. hanviet: Âm Hán Việt chuẩn xác, VIẾT HOA hoàn toàn (ví dụ: NHẬT, NGUYỆT, QUỐC, NHÂN, NIÊN, ĐẠI, THỜI,...). Nếu có nhiều âm thông dụng, cách nhau bằng dấu phẩy (ví dụ: "BẮC, BỐI").
2. meanings: Mảng JSON gồm 2-3 nghĩa tiếng Việt phổ biến nhất của chữ Hán đó. KHÔNG dịch máy (ví dụ 日: ["ngày", "mặt trời"], 国: ["đất nước", "quốc gia"]). TUYỆT ĐỐI KHÔNG để các nghĩa rác như "truy cập trong ngày", "lớn, lớn".
3. Định dạng trả về BẮT BUỘC là JSON Object:
{
  "results": {
    "<kanjiChar>": {
      "hanviet": "ÂM HÁN VIỆT",
      "meanings": ["nghĩa 1", "nghĩa 2"]
    }
  }
}`;

  const inputJson = JSON.stringify(
    items.map(k => ({
      char: k.kanjiChar,
      on: k.onyomi,
      kun: k.kunyomi,
      ref_hanviet: hanvietDataset[k.kanjiChar] || '',
      old_meanings: k.current_meanings,
    })),
    null,
    2,
  );

  let attempts = 0;
  while (attempts < 3) {
    try {
      const responseText = await callAI(inputJson, systemPrompt);
      const parsed = JSON.parse(responseText);
      const results = parsed.results || parsed;
      return results;
    } catch (e: any) {
      attempts++;
      console.warn(`Lỗi mẻ Kanji (thử lần ${attempts}/3):`, e.message);
      await sleep(2000 * attempts);
    }
  }
  return {};
}

// Database helper
let dbPool: Pool | null = null;
function getDb(): Pool {
  if (!dbPool) {
    dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'nihongo_db',
      connectionLimit: 10,
    });
  }
  return dbPool;
}

async function main() {
  console.log('=====================================================');
  console.log('   AI DIRECT TRANSLATE: NHẬT -> VIỆT CHUẨN TỰ NHIÊN   ');
  console.log('=====================================================');

  if (IS_HANVIET_ONLY) {
    console.log(
      '✓ Chế độ: ĐỒNG BỘ ÂM HÁN VIỆT CHO 100% KANJI (Không cần gọi AI API)',
    );
    console.log(`✓ Cập nhật DB: ${SYNC_DB ? 'BẬT' : 'TẮT'}`);
    console.log(`✓ Cập nhật JSON: ${SYNC_JSON ? 'BẬT' : 'TẮT'}`);
    console.log('-----------------------------------------------------\n');
  } else {
    // Check API keys
    if (!GEMINI_KEY && !OPENAI_KEY) {
      console.error(`
[!] CHƯA CÓ API KEY:
Vui lòng thêm API Key vào file .env:
  GEMINI_API_KEY=AIzaSy...   (Khuyên dùng, miễn phí / tốc độ cao)
hoặc:
  OPENAI_API_KEY=sk-...

Hoặc chạy lệnh kèm cờ:
  npx tsx scripts/ai-translate-direct.ts --gemini-key="YOUR_KEY" --test
  hoặc đồng bộ ngay âm Hán Việt mà không cần AI:
  npx tsx scripts/ai-translate-direct.ts --hanviet-only
`);
      process.exit(1);
    }

    const activeProvider = GEMINI_KEY ? 'Google Gemini' : 'OpenAI';
    console.log(`✓ AI Provider đang dùng: ${activeProvider}`);
    console.log(
      `✓ Chế độ: ${IS_TEST ? 'TEST 10 TỪ' : `Toàn bộ (${TARGET_LEVEL.toUpperCase()})`}`,
    );
    console.log(`✓ Cập nhật DB: ${SYNC_DB ? 'BẬT' : 'TẮT'}`);
    console.log(`✓ Cập nhật JSON: ${SYNC_JSON ? 'BẬT' : 'TẮT'}`);
    console.log('-----------------------------------------------------\n');
  }

  const levels =
    TARGET_LEVEL === 'all' ? ['n5', 'n4', 'n3', 'n2', 'n1'] : [TARGET_LEVEL];
  const sqlUpdates: string[] = [];

  // ==========================================
  // 1. DỊCH KANJI
  // ==========================================
  if (TARGET_TYPE === 'all' || TARGET_TYPE === 'kanji') {
    console.log('>>> [1/2] BẮT ĐẦU XỬ LÝ KANJI...');
    for (const lvl of levels) {
      const kanjiPath = path.join(
        PUBLIC_DIR,
        'data-kanji',
        `${lvl.toUpperCase()}.json`,
      );
      if (!fs.existsSync(kanjiPath)) continue;

      const kanjiData: KanjiEntry[] = JSON.parse(
        fs.readFileSync(kanjiPath, 'utf8'),
      );
      console.log(
        `\n--- Kanji Level ${lvl.toUpperCase()} (Tổng: ${kanjiData.length} chữ) ---`,
      );

      if (IS_HANVIET_ONLY) {
        let updatedCount = 0;
        for (const k of kanjiData) {
          const hv = hanvietDataset[k.kanjiChar];
          if (hv) {
            k.hanviet = hv.toUpperCase();
            updatedCount++;
            if (SYNC_DB) {
              const escapedChar = k.kanjiChar.replace(/'/g, "''");
              const escapedHanviet = k.hanviet.replace(/'/g, "''");
              sqlUpdates.push(
                `UPDATE \`kanjis\` SET \`hanviet\` = '${escapedHanviet}' WHERE \`kanji_char\` = '${escapedChar}';`,
              );
            }
          }
        }
        if (SYNC_JSON) {
          fs.writeFileSync(
            kanjiPath,
            JSON.stringify(kanjiData, null, 2),
            'utf8',
          );
          console.log(
            `✓ Đã lưu file: ${kanjiPath} (cập nhật ${updatedCount} Hán Việt)`,
          );
        }
        continue;
      }

      const itemsToTranslate = IS_TEST ? kanjiData.slice(0, 5) : kanjiData;
      const unCachedItems = itemsToTranslate.filter(
        k => !cache.kanji[k.kanjiChar],
      );

      console.log(
        `Cần dịch AI: ${unCachedItems.length} chữ (Đã có trong cache: ${itemsToTranslate.length - unCachedItems.length})`,
      );

      for (let i = 0; i < unCachedItems.length; i += BATCH_SIZE) {
        const batch = unCachedItems.slice(i, i + BATCH_SIZE);
        console.log(
          `Đang dịch Kanji mẻ ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(unCachedItems.length / BATCH_SIZE)} (${batch.length} chữ)...`,
        );

        const translatedBatch = await translateKanjiBatch(
          batch.map(k => ({
            kanjiChar: k.kanjiChar,
            onyomi: k.onyomi,
            kunyomi: k.kunyomi,
            current_meanings: k.meanings,
          })),
        );

        for (const k of batch) {
          if (translatedBatch[k.kanjiChar]) {
            const res = translatedBatch[k.kanjiChar];
            const hanviet = res.hanviet || hanvietDataset[k.kanjiChar] || '';
            cache.kanji[k.kanjiChar] = {
              hanviet: hanviet.toUpperCase(),
              meanings: Array.isArray(res.meanings)
                ? res.meanings
                : [res.meanings],
            };
          } else if (hanvietDataset[k.kanjiChar]) {
            cache.kanji[k.kanjiChar] = {
              hanviet: hanvietDataset[k.kanjiChar].toUpperCase(),
              meanings: k.meanings,
            };
          }
        }
        saveCache();
        await sleep(1000);
      }

      // Apply cached translations to kanjiData
      for (const k of kanjiData) {
        if (cache.kanji[k.kanjiChar]) {
          k.meanings = cache.kanji[k.kanjiChar].meanings;
          k.hanviet = cache.kanji[k.kanjiChar].hanviet;

          if (SYNC_DB && !IS_TEST) {
            const escapedChar = k.kanjiChar.replace(/'/g, "''");
            const escapedHanviet = (k.hanviet || '').replace(/'/g, "''");
            const jsonMeanings = JSON.stringify(k.meanings).replace(/'/g, "''");
            sqlUpdates.push(
              `UPDATE \`kanjis\` SET \`hanviet\` = '${escapedHanviet}', \`meanings\` = '${jsonMeanings}' WHERE \`kanji_char\` = '${escapedChar}';`,
            );
          }
        }
      }

      if (SYNC_JSON && !IS_TEST) {
        fs.writeFileSync(kanjiPath, JSON.stringify(kanjiData, null, 2), 'utf8');
        console.log(`✓ Đã lưu file: ${kanjiPath}`);
      }

      if (IS_TEST) {
        console.log('\n[KẾT QUẢ TEST MẪU KANJI]:');
        for (const k of itemsToTranslate) {
          const c = cache.kanji[k.kanjiChar];
          console.log(
            `- ${k.kanjiChar} | Hán Việt: ${c?.hanviet || 'N/A'} | Nghĩa mới: ${(c?.meanings || []).join(', ')}`,
          );
        }
      }
    }
  }

  // ==========================================
  // 2. DỊCH VOCABULARY
  // ==========================================
  if (!IS_HANVIET_ONLY && (TARGET_TYPE === 'all' || TARGET_TYPE === 'vocab')) {
    console.log('\n>>> [2/2] BẮT ĐẦU XỬ LÝ TỪ VỰNG...');
    for (const lvl of levels) {
      const vocabPath = path.join(
        PUBLIC_DIR,
        'data-vocab',
        `${lvl.toLowerCase()}.json`,
      );
      if (!fs.existsSync(vocabPath)) continue;

      const vocabData: VocabEntry[] = JSON.parse(
        fs.readFileSync(vocabPath, 'utf8'),
      );
      console.log(
        `\n--- Từ vựng Level ${lvl.toUpperCase()} (Tổng: ${vocabData.length} từ) ---`,
      );

      const itemsToTranslate = IS_TEST ? vocabData.slice(0, 10) : vocabData;
      const unCachedItems = itemsToTranslate.filter(
        v => !cache.vocab[v.jmdict_seq],
      );

      console.log(
        `Cần dịch AI: ${unCachedItems.length} từ (Đã có trong cache: ${itemsToTranslate.length - unCachedItems.length})`,
      );

      for (let i = 0; i < unCachedItems.length; i += BATCH_SIZE) {
        const batch = unCachedItems.slice(i, i + BATCH_SIZE);
        console.log(
          `Đang dịch từ vựng mẻ ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(unCachedItems.length / BATCH_SIZE)} (${batch.length} từ)...`,
        );

        const translatedBatch = await translateVocabBatch(
          batch.map(v => ({
            jmdict_seq: v.jmdict_seq,
            kana: v.kana,
            kanji: v.kanji,
            current_def: v.waller_definition,
          })),
        );

        for (const v of batch) {
          if (translatedBatch[v.jmdict_seq]) {
            cache.vocab[v.jmdict_seq] = translatedBatch[v.jmdict_seq].trim();
          }
        }
        saveCache();
        await sleep(1000);
      }

      // Apply cached translations to vocabData
      for (const v of vocabData) {
        if (cache.vocab[v.jmdict_seq]) {
          v.waller_definition = cache.vocab[v.jmdict_seq];

          if (SYNC_DB && !IS_TEST) {
            const escapedDef = v.waller_definition.replace(/'/g, "''");
            const seq = v.jmdict_seq;
            sqlUpdates.push(
              `UPDATE \`vocabularies\` SET \`waller_definition\` = '${escapedDef}' WHERE \`jmdict_seq\` = '${seq}' AND \`level\` = '${lvl}';`,
            );
          }
        }
      }

      if (SYNC_JSON && !IS_TEST) {
        fs.writeFileSync(vocabPath, JSON.stringify(vocabData, null, 2), 'utf8');
        console.log(`✓ Đã lưu file: ${vocabPath}`);
      }

      if (IS_TEST) {
        console.log('\n[KẾT QUẢ TEST MẪU TỪ VỰNG]:');
        for (const v of itemsToTranslate) {
          const newDef = cache.vocab[v.jmdict_seq] || v.waller_definition;
          console.log(`- ${v.kanji || v.kana} (${v.kana}):`);
          console.log(`  + Cũ:  ${v.waller_definition}`);
          console.log(`  + Mới: ${newDef}`);
        }
      }
    }
  }

  // ==========================================
  // 3. CẬP NHẬT DATABASE & DUMP SQL
  // ==========================================
  if (sqlUpdates.length > 0 && SYNC_DB && !IS_TEST) {
    console.log(
      `\n>>> Đang cập nhật trực tiếp ${sqlUpdates.length} câu lệnh vào MySQL Database...`,
    );
    const pool = getDb();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      let count = 0;
      for (const query of sqlUpdates) {
        await conn.execute(query);
        count++;
        if (count % 500 === 0) {
          console.log(`Đã cập nhật ${count}/${sqlUpdates.length} dòng...`);
        }
      }
      await conn.commit();
      console.log(`✓ Cập nhật MySQL Database thành công: ${count} dòng!`);
    } catch (dbErr: any) {
      await conn.rollback();
      console.error('Lỗi khi cập nhật MySQL:', dbErr.message);
    } finally {
      conn.release();
    }
  }

  if (DUMP_SQL || (sqlUpdates.length > 0 && !IS_TEST)) {
    const dumpPath = path.join(
      process.cwd(),
      'scripts',
      'translated_update.sql',
    );
    fs.writeFileSync(dumpPath, sqlUpdates.join('\n'), 'utf8');
    console.log(
      `✓ Đã xuất file SQL Dump: ${dumpPath} (${sqlUpdates.length} statements)`,
    );
  }

  if (dbPool) {
    await dbPool.end();
  }

  console.log('\n=====================================================');
  console.log('                 HOÀN TẤT THỰC HIỆN!                ');
  console.log('=====================================================');
}

main().catch(err => {
  console.error('Lỗi nghiêm trọng:', err);
  process.exit(1);
});
