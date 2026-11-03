// ============================================================================
// JLPT N5 Lesson Data (Minna no Nihongo structure, 25 lessons)
// Data will be filled in by user
// ============================================================================
import type { LessonData, VocabLevel } from '../types/study';

export const LESSON_COUNT_N5 = 25;

export const LESSONS_N5: Record<number, LessonData> = {
  1: {
    words: [
      {
        hira: 'わたし',
        kanji: '私',
        mean: 'tôi, ta',
        ex: 'わたしはせんせいです。',
        under: 'わたし',
        exVi: 'Tôi là giáo viên.',
      },
      {
        hira: 'あなた',
        mean: 'bạn, anh/chị (ngôi 2)',
        ex: 'あなたのなまえはなんですか。',
        under: 'あなた',
        exVi: 'Tên bạn là gì?',
      },
      {
        hira: 'あのひと',
        kanji: 'あの人',
        mean: 'người đó, người kia',
        ex: 'あのひとはだれですか。',
        under: 'あのひと',
        exVi: 'Người kia là ai?',
      },
      {
        hira: 'あのかた',
        kanji: 'あの方',
        mean: 'vị đó (kính ngữ của あのひと)',
        ex: 'あのかたはせんせいです。',
        under: 'あのかた',
        exVi: 'Vị đó là giáo viên.',
      },
      {
        hira: '〜さん',
        mean: '〜san (cách gọi tôn trọng)',
        ex: 'やまださんはいしゃです。',
        under: 'やまださん',
        exVi: 'Anh/Chị Yamada là bác sĩ.',
      },
      {
        hira: '〜ちゃん',
        mean: '〜chan (cách gọi thân mật, trẻ em)',
        ex: 'はなちゃんはかわいいです。',
        under: 'はなちゃん',
        exVi: 'Bé Hana dễ thương quá.',
      },
      {
        hira: '〜じん',
        kanji: '〜人',
        mean: '〜người (quốc tịch)',
        ex: 'わたしはべとなむじんです。',
        under: 'べとなむじん',
        exVi: 'Tôi là người Việt Nam.',
      },
      {
        hira: 'せんせい',
        kanji: '先生',
        mean: 'giáo viên, thầy/cô giáo',
        ex: 'たなかさんはせんせいです。',
        under: 'せんせい',
        exVi: 'Chị Tanaka là giáo viên.',
      },
    ],
  },
  2: { words: [] },
  3: { words: [] },
  4: { words: [] },
  5: { words: [] },
  6: { words: [] },
  7: { words: [] },
  8: { words: [] },
  9: { words: [] },
  10: { words: [] },
  11: { words: [] },
  12: { words: [] },
  13: { words: [] },
  14: { words: [] },
  15: { words: [] },
  16: { words: [] },
  17: { words: [] },
  18: { words: [] },
  19: { words: [] },
  20: { words: [] },
  21: { words: [] },
  22: { words: [] },
  23: { words: [] },
  24: { words: [] },
  25: { words: [] },
};

export const LESSONS_N4: Record<number, LessonData> = {};
export const LESSONS_N3: Record<number, LessonData> = {};
export const LESSONS_N2: Record<number, LessonData> = {};
export const LESSONS_N1: Record<number, LessonData> = {};

export const LESSON_COUNT: Record<VocabLevel, number> = {
  n5: 25,
  n4: 0,
  n3: 0,
  n2: 0,
  n1: 0,
};

export function getLessons(level: VocabLevel): Record<number, LessonData> {
  switch (level) {
    case 'n5':
      return LESSONS_N5;
    case 'n4':
      return LESSONS_N4;
    case 'n3':
      return LESSONS_N3;
    case 'n2':
      return LESSONS_N2;
    case 'n1':
      return LESSONS_N1;
    default:
      return LESSONS_N5;
  }
}
