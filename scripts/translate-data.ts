/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

// Types
interface KanjiEntry {
  id: number;
  kanjiChar: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
}

interface VocabEntry {
  jmdict_seq: string;
  kana: string;
  kanji: string;
  waller_definition: string;
}

interface TranslationCache {
  kanji: Record<string, string[]>; // kanjiChar -> translated meanings
  vocab: Record<string, string>; // jmdict_seq -> translated definition
}

interface TranslateJob {
  original: string;
  callback: (translated: string) => void;
  cacheKey: { type: 'kanji' | 'vocab'; key: string; index?: number };
}

// Config
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const CACHE_FILE = path.join(process.cwd(), 'scripts', '.translate_cache.json');
const BATCH_SIZE = 40;
const SLEEP_MS = 2500;

// Load Cache
let cache: TranslationCache = { kanji: {}, vocab: {} };
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    console.log(
      `Loaded cache: ${Object.keys(cache.kanji).length} kanji, ${Object.keys(cache.vocab).length} vocab entries.`,
    );
  } catch (err) {
    console.error('Failed to load translation cache, starting fresh:', err);
  }
}

// Save Cache
function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// Helper: Sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch with Retry & Exponential Backoff
async function fetchWithRetry(
  url: string,
  retries = 5,
  backoff = 2000,
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.warn(`Rate limit hit (429). Retrying in ${backoff}ms...`);
        await sleep(backoff);
        backoff *= 2;
        continue;
      }
      if (!res.ok) {
        throw new Error(`Google Translate API error: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(
        `Request failed: ${(err as Error).message}. Retrying in ${backoff}ms...`,
      );
      await sleep(backoff);
      backoff *= 2;
    }
  }
}

// Translate a single string
async function translateSingle(text: string): Promise<string> {
  if (!text.trim()) return '';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
  try {
    const json = await fetchWithRetry(url);
    if (json && json[0] && json[0][0]) {
      return json[0]
        .map((item: any) => item[0])
        .join('')
        .trim();
    }
    return text;
  } catch (err) {
    console.error(`Failed to translate single text "${text}":`, err);
    return text;
  }
}

// Translate a batch of strings
async function translateBatch(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];

  // Join texts with newline to translate in one go
  const joinedText = texts.join('\n');
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(joinedText)}`;

  try {
    const json = await fetchWithRetry(url);
    if (!json || !json[0]) {
      throw new Error('Invalid response structure from translator API');
    }

    const translatedText: string = json[0].map((item: any) => item[0]).join('');
    const translatedLines = translatedText.replace(/\r/g, '').split('\n');

    // Clean up lines
    const cleanedLines = translatedLines
      .map(line => line.trim())
      .filter((_, index) => index < texts.length);

    if (cleanedLines.length === texts.length) {
      return cleanedLines;
    }

    console.warn(
      `Batch size mismatch: expected ${texts.length}, got ${cleanedLines.length}. Falling back to individual translations.`,
    );
  } catch (err) {
    console.error(
      `Batch translation failed: ${(err as Error).message}. Falling back to individual translations.`,
    );
  }

  // Fallback to translating individual items
  const results: string[] = [];
  for (const text of texts) {
    results.push(await translateSingle(text));
    await sleep(800); // Small delay to prevent rate limits during fallback
  }
  return results;
}

// Main execution function
async function main() {
  const levels = ['n5', 'n4', 'n3', 'n2', 'n1'];

  // 1. Process Kanji Files
  console.log('--- STARTING KANJI TRANSLATION ---');
  for (const lvl of levels) {
    const kanjiFilePath = path.join(
      PUBLIC_DIR,
      'data-kanji',
      `${lvl.toUpperCase()}.json`,
    );
    if (!fs.existsSync(kanjiFilePath)) {
      console.warn(
        `Kanji file for level ${lvl.toUpperCase()} not found, skipping.`,
      );
      continue;
    }

    console.log(`Loading Kanji level ${lvl.toUpperCase()}...`);
    const kanjiData = JSON.parse(
      fs.readFileSync(kanjiFilePath, 'utf8'),
    ) as KanjiEntry[];
    const jobs: TranslateJob[] = [];

    // Create translation jobs for meanings that aren't cached
    for (const k of kanjiData) {
      const cachedMeanings = cache.kanji[k.kanjiChar];
      if (cachedMeanings && cachedMeanings.length === k.meanings.length) {
        k.meanings = cachedMeanings;
      } else {
        // Prepare array of new meanings to fill in
        const translatedMeanings = [...k.meanings];
        k.meanings.forEach((meaning, idx) => {
          jobs.push({
            original: meaning,
            callback: translated => {
              translatedMeanings[idx] = translated;
              // Update cache entry once all meanings for this kanji are translated
              cache.kanji[k.kanjiChar] = translatedMeanings;
            },
            cacheKey: { type: 'kanji', key: k.kanjiChar, index: idx },
          });
        });
        k.meanings = translatedMeanings; // Assign reference so callback updates the array
      }
    }

    if (jobs.length > 0) {
      console.log(`Need to translate ${jobs.length} kanji meanings...`);
      for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);
        const originalTexts = batch.map(j => j.original);
        console.log(
          `Translating Kanji batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jobs.length / BATCH_SIZE)} (${originalTexts.length} items)...`,
        );

        const translations = await translateBatch(originalTexts);

        // Execute callbacks with translated text
        batch.forEach((job, idx) => {
          const translation = translations[idx] || job.original;
          job.callback(translation);
        });

        saveCache();
        console.log(
          `Batch finished. Progress saved to cache. Sleeping for ${SLEEP_MS}ms...`,
        );
        await sleep(SLEEP_MS);
      }
    } else {
      console.log(`All Kanji for level ${lvl.toUpperCase()} are fully cached!`);
    }

    // Write translated data back to file
    fs.writeFileSync(kanjiFilePath, JSON.stringify(kanjiData, null, 2), 'utf8');
    console.log(`Saved translated file: ${kanjiFilePath}`);
  }

  // 2. Process Vocab Files
  console.log('\n--- STARTING VOCAB TRANSLATION ---');
  for (const lvl of levels) {
    const vocabFilePath = path.join(
      PUBLIC_DIR,
      'data-vocab',
      `${lvl.toLowerCase()}.json`,
    );
    if (!fs.existsSync(vocabFilePath)) {
      console.warn(`Vocab file for level ${lvl} not found, skipping.`);
      continue;
    }

    console.log(`Loading Vocab level ${lvl.toUpperCase()}...`);
    const vocabData = JSON.parse(
      fs.readFileSync(vocabFilePath, 'utf8'),
    ) as VocabEntry[];
    const jobs: TranslateJob[] = [];

    // Create translation jobs for definitions that aren't cached
    for (const v of vocabData) {
      const cachedDef = cache.vocab[v.jmdict_seq];
      if (cachedDef) {
        v.waller_definition = cachedDef;
      } else {
        jobs.push({
          original: v.waller_definition,
          callback: translated => {
            v.waller_definition = translated;
            cache.vocab[v.jmdict_seq] = translated;
          },
          cacheKey: { type: 'vocab', key: v.jmdict_seq },
        });
      }
    }

    if (jobs.length > 0) {
      console.log(`Need to translate ${jobs.length} vocab definitions...`);
      for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
        const batch = jobs.slice(i, i + BATCH_SIZE);
        const originalTexts = batch.map(j => j.original);
        console.log(
          `Translating Vocab batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(jobs.length / BATCH_SIZE)} (${originalTexts.length} items)...`,
        );

        const translations = await translateBatch(originalTexts);

        batch.forEach((job, idx) => {
          const translation = translations[idx] || job.original;
          job.callback(translation);
        });

        saveCache();
        console.log(
          `Batch finished. Progress saved to cache. Sleeping for ${SLEEP_MS}ms...`,
        );
        await sleep(SLEEP_MS);
      }
    } else {
      console.log(`All Vocab for level ${lvl.toUpperCase()} are fully cached!`);
    }

    // Write translated data back to file
    fs.writeFileSync(vocabFilePath, JSON.stringify(vocabData, null, 2), 'utf8');
    console.log(`Saved translated file: ${vocabFilePath}`);
  }

  console.log('\nAll files have been successfully translated to Vietnamese!');
}

main().catch(err => {
  console.error('Fatal error in translation script:', err);
  process.exit(1);
});
