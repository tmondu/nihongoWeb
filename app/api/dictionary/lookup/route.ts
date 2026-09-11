import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyJwt } from '@/shared/utils/auth';
import { getDbPool } from '@/shared/infra/server/db';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';

export const dynamic = 'force-dynamic';

const MAZII_RSA_PUBLIC_KEY =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk+47ErEUkqhTJY8YdQ7jkYLe1WXhSsAwl/uWudmHuRMiFodTmd3R7xrQh3dYYTIlMFFn//mINIm8LdCJ2lIS1M6aXUyVS4OI551IS8Musrd2E8cGQDofixcxll/dspL+li15jXD4ktgQaHESvbedA9ppBrMLoetBD2p+gCKXfD8Rnrf/uFNIxJyW4WJJTns4JrbcWojy1JfVP91cs+61ScIPJN1RzMiM8rqL8lBF+AgEjEsOkUTStn0ELKzlOAyl+h81xw1PIFHGLNhTs+GcuQMQyXJrPTQrQsqBlm0LvxUl79ZhzesAxeNWfGQA+V95pKMyaMCuj5QbprID73858wIDAQAB';

// Cache derived AES key to avoid running PBKDF2 with 10k iterations on every request
let cachedAesKey: Buffer | null = null;
function getDerivedAesKey(): Buffer {
  if (!cachedAesKey) {
    const salt = Buffer.from('mazii-search-v3', 'utf8');
    const derived = crypto.pbkdf2Sync(
      MAZII_RSA_PUBLIC_KEY,
      salt,
      10000,
      48,
      'sha256',
    );
    cachedAesKey = derived.subarray(0, 32);
  }
  return cachedAesKey;
}

function decryptMaziiResponse(encryptedString: string): unknown {
  const colonIndex = encryptedString.indexOf(':');
  if (colonIndex === -1) {
    throw new Error('Invalid encrypted format: missing colon separator');
  }

  const ivBase64 = encryptedString.substring(0, colonIndex);
  const ciphertextBase64 = encryptedString.substring(colonIndex + 1);

  const iv = Buffer.from(ivBase64, 'base64');
  const ciphertext = Buffer.from(ciphertextBase64, 'base64');
  const key = getDerivedAesKey();

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  decipher.setAutoPadding(true);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

export interface ExampleSentence {
  content: string;
  mean: string;
  transcription?: string;
}

export interface CommunityFeedback {
  id: number;
  username: string;
  avatar: string | null;
  mean: string;
  like: number;
  dislike: number;
  isUserContribution?: boolean;
  createdAt?: string;
}

export interface WordLookupResult {
  word: string;
  phonetic?: string;
  means?: {
    kind?: string;
    mean: string;
  }[];
  examples: ExampleSentence[];
  feedbacks: CommunityFeedback[];
}

interface MaziiWordExample {
  content?: string;
  mean?: string;
  transcription?: string;
}

interface MaziiWordMean {
  kind?: string;
  mean?: string;
  examples?: MaziiWordExample[];
}

interface MaziiWordItem {
  word?: string;
  phonetic?: string;
  mobileId?: string;
  _id?: string;
  means?: MaziiWordMean[];
}

interface MaziiWordPayload {
  encryptedData?: string;
  data?: {
    words?: MaziiWordItem[];
  };
}

interface MaziiExampleItem {
  content?: string;
  mean?: string;
  transcription?: string;
}

interface MaziiExamplePayload {
  encryptedData?: string;
  results?: MaziiExampleItem[];
}

// In-memory store for student contributions per word/kanji
const userContributionsMap = new Map<string, CommunityFeedback[]>();

// In-memory cache for fast lookups
const lookupCache = new Map<
  string,
  { data: WordLookupResult; timestamp: number }
>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word')?.trim();
  const dict = searchParams.get('dict') || 'javi';

  if (!word) {
    return NextResponse.json(
      { error: 'Missing word parameter' },
      { status: 400 },
    );
  }

  const cacheKey = `${dict}:${word.toLowerCase()}`;
  const now = Date.now();
  const cached = lookupCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, max-age=7200',
        'X-Cache': 'HIT',
      },
    });
  }

  try {
    let phonetic = '';
    const means: { kind?: string; mean: string }[] = [];
    const examples: ExampleSentence[] = [];
    const feedbacks: CommunityFeedback[] = [];
    let wordMobileId: number | string | null = null;

    // 1. Search Word & Example in parallel
    const [wordRes, exampleRes] = await Promise.allSettled([
      fetch('https://mazii.net/api/search/word/v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dict,
          type: 'word',
          query: word,
          limit: 10,
          page: 1,
        }),
      }).then(r => r.json()),

      fetch('https://mazii.net/api/search/example/v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dict,
          type: 'example',
          query: word,
        }),
      }).then(r => r.json()),
    ]);

    // Parse Word Response
    if (wordRes.status === 'fulfilled' && wordRes.value) {
      try {
        let wordPayload = wordRes.value as MaziiWordPayload;
        if (wordPayload.encryptedData) {
          wordPayload = decryptMaziiResponse(
            wordPayload.encryptedData,
          ) as MaziiWordPayload;
        }
        const wordList = wordPayload?.data?.words || [];
        if (wordList.length > 0) {
          const matched =
            wordList.find(
              (w: MaziiWordItem) =>
                w.word === word || (w.phonetic && w.phonetic.includes(word)),
            ) || wordList[0];

          phonetic = matched?.phonetic || '';
          wordMobileId = matched?.mobileId || matched?._id || null;

          if (Array.isArray(matched?.means)) {
            for (const m of matched.means) {
              if (m.mean) {
                means.push({
                  kind: m.kind || '',
                  mean: m.mean,
                });
              }
              // Word level examples
              if (Array.isArray(m.examples)) {
                for (const ex of m.examples) {
                  if (ex.content && ex.mean) {
                    examples.push({
                      content: ex.content,
                      mean: ex.mean,
                      transcription: ex.transcription || '',
                    });
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error decrypting or parsing Mazii word data:', err);
      }
    }

    // Parse Dedicated Examples Response
    if (exampleRes.status === 'fulfilled' && exampleRes.value) {
      try {
        let exPayload = exampleRes.value as MaziiExamplePayload;
        if (exPayload.encryptedData) {
          exPayload = decryptMaziiResponse(
            exPayload.encryptedData,
          ) as MaziiExamplePayload;
        }
        const results = exPayload?.results || [];
        if (Array.isArray(results)) {
          for (const item of results) {
            if (
              item.content &&
              item.mean &&
              !examples.some(e => e.content === item.content)
            ) {
              examples.push({
                content: item.content,
                mean: item.mean,
                transcription: item.transcription || '',
              });
            }
          }
        }
      } catch (err) {
        console.error('Error decrypting or parsing Mazii example data:', err);
      }
    }

    // 2. Fetch Community Feedbacks using wordMobileId if found
    if (wordMobileId) {
      try {
        const fbRes = await fetch('https://api.mazii.net/api/get-mean', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordId: wordMobileId,
            word,
            type: 'word',
            dict,
          }),
        }).then(r => r.json());

        const rawFeedbacks = fbRes?.result || [];
        if (Array.isArray(rawFeedbacks)) {
          for (const fb of rawFeedbacks) {
            feedbacks.push({
              id: fb.reportId || fb.id || Math.random(),
              username: fb.username || 'Thành viên PThamSS',
              avatar: fb.avatar || null,
              mean: fb.mean || '',
              like: Number(fb.like) || 0,
              dislike: Number(fb.dislike) || 0,
            });
          }
        }
      } catch (err) {
        console.error('Error fetching Mazii community feedbacks:', err);
      }
    }

    // Query student contributions from TiDB database
    const dbFeedbacks: CommunityFeedback[] = [];
    try {
      const pool = getDbPool();
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, kanji_char, user_id, username, mean, likes, dislikes, created_at FROM kanji_contributions WHERE kanji_char = ? ORDER BY likes DESC, created_at DESC LIMIT 50',
        [word],
      );
      if (Array.isArray(rows)) {
        for (const row of rows) {
          dbFeedbacks.push({
            id: Number(row.id),
            username: String(row.username),
            avatar: null,
            mean: String(row.mean),
            like: Number(row.likes) || 0,
            dislike: Number(row.dislikes) || 0,
            isUserContribution: true,
            createdAt: row.created_at
              ? new Date(row.created_at).toISOString()
              : undefined,
          });
        }
      }
    } catch (dbErr) {
      console.warn(
        'Could not query kanji_contributions from DB, using fallback cache:',
        dbErr,
      );
      const memoryContribs = userContributionsMap.get(word) || [];
      dbFeedbacks.push(...memoryContribs);
    }

    const allFeedbacks = [...dbFeedbacks, ...feedbacks];

    const result: WordLookupResult = {
      word,
      phonetic,
      means: means.slice(0, 10),
      examples: examples.slice(0, 25),
      feedbacks: allFeedbacks.slice(0, 50),
    };

    lookupCache.set(cacheKey, { data: result, timestamp: now });

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=7200',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error(`Failed to lookup dictionary for word '${word}':`, error);
    const userContribs = userContributionsMap.get(word) || [];
    return NextResponse.json(
      {
        word,
        phonetic: '',
        means: [],
        examples: [],
        feedbacks: userContribs,
      },
      { status: 200 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Handle reaction (like/dislike)
    if (body?.action === 'react') {
      const { feedbackId, likeDelta, dislikeDelta } = body;
      if (feedbackId) {
        try {
          const pool = getDbPool();
          await pool.execute(
            'UPDATE kanji_contributions SET likes = GREATEST(0, likes + ?), dislikes = GREATEST(0, dislikes + ?) WHERE id = ?',
            [
              Number(likeDelta) || 0,
              Number(dislikeDelta) || 0,
              Number(feedbackId),
            ],
          );
        } catch (err) {
          console.warn('Failed to update reaction in DB:', err);
        }
      }
      return NextResponse.json({ success: true });
    }

    // 2. Handle deletion
    if (body?.action === 'delete') {
      const { feedbackId } = body;
      if (feedbackId) {
        try {
          const pool = getDbPool();
          await pool.execute('DELETE FROM kanji_contributions WHERE id = ?', [
            Number(feedbackId),
          ]);
        } catch (err) {
          console.warn('Failed to delete contribution in DB:', err);
        }
      }
      return NextResponse.json({ success: true });
    }

    // 3. Handle contribution creation
    const { word, nickname, mean } = body || {};

    if (
      !word ||
      typeof word !== 'string' ||
      !nickname ||
      typeof nickname !== 'string' ||
      !mean ||
      typeof mean !== 'string'
    ) {
      return NextResponse.json(
        {
          error: 'Thiếu thông tin chữ Kanji, nickname hoặc nội dung đóng góp.',
        },
        { status: 400 },
      );
    }

    const trimmedWord = word.trim();
    const trimmedNickname = nickname.trim();
    const trimmedMean = mean.trim();

    if (!trimmedWord || !trimmedMean) {
      return NextResponse.json(
        { error: 'Chữ Kanji và nội dung đóng góp không được để trống.' },
        { status: 400 },
      );
    }

    // Try resolving authenticated user's id and display_name from database
    let authorName = trimmedNickname;
    let userId: number | null = null;
    const token = req.cookies.get('auth_token')?.value;
    if (token) {
      try {
        const payload = await verifyJwt(token);
        if (payload && payload.userId) {
          userId = Number(payload.userId);
          const pool = getDbPool();
          const [users] = await pool.execute<RowDataPacket[]>(
            'SELECT display_name, email FROM users WHERE id = ?',
            [userId],
          );
          const user = users[0];
          if (user) {
            authorName =
              user.display_name || user.email?.split('@')[0] || authorName;
          }
        }
      } catch (err) {
        console.warn('Could not verify auth token in lookup POST:', err);
      }
    }

    if (!authorName) {
      return NextResponse.json(
        { error: 'Nickname không được để trống.' },
        { status: 400 },
      );
    }

    // Insert into TiDB database
    let insertedId = Date.now() + Math.floor(Math.random() * 1000);
    try {
      const pool = getDbPool();
      const [insertRes] = await pool.execute<ResultSetHeader>(
        'INSERT INTO kanji_contributions (kanji_char, user_id, username, mean, likes, dislikes) VALUES (?, ?, ?, ?, 0, 0)',
        [trimmedWord, userId, authorName, trimmedMean],
      );
      if (insertRes && insertRes.insertId) {
        insertedId = insertRes.insertId;
      }
    } catch (dbErr) {
      console.warn(
        'Could not insert kanji_contribution to DB, saving in-memory:',
        dbErr,
      );
    }

    const newFeedback: CommunityFeedback = {
      id: insertedId,
      username: authorName,
      avatar: null,
      mean: trimmedMean,
      like: 0,
      dislike: 0,
      isUserContribution: true,
      createdAt: new Date().toISOString(),
    };

    const currentList = userContributionsMap.get(trimmedWord) || [];
    userContributionsMap.set(trimmedWord, [newFeedback, ...currentList]);

    // Invalidate cached lookup for this word
    lookupCache.delete(`javi:${trimmedWord}`);

    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error) {
    console.error('Error in POST /api/dictionary/lookup:', error);
    return NextResponse.json(
      { error: 'Có lỗi xảy ra khi lưu đóng góp ý kiến.' },
      { status: 500 },
    );
  }
}
