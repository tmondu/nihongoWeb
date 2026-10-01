import { describe, it, expect } from 'vitest';
import {
  KANJI_PRO_LEVELS,
  LESSON_2_N5_KANJI,
  LESSON_24_N4_KANJI,
  LESSON_25_N4_KANJI,
  getLessonsForLevel,
  getLessonDetail,
} from '../data/kanjiProCurriculum';

describe('KanjiPro Curriculum Data', () => {
  it('defines 5 JLPT levels (N5 to N1)', () => {
    expect(KANJI_PRO_LEVELS).toHaveLength(5);
    const levels = KANJI_PRO_LEVELS.map(l => l.level);
    expect(levels).toEqual(['n5', 'n4', 'n3', 'n2', 'n1']);
  });

  it('contains 14 Kanji for Bài 2 N5 exactly matching the textbook photo', () => {
    expect(LESSON_2_N5_KANJI).toHaveLength(14);

    const chars = LESSON_2_N5_KANJI.map(k => k.kanjiChar);
    expect(chars).toEqual([
      '一',
      '二',
      '三',
      '四',
      '五',
      '六',
      '七',
      '八',
      '九',
      '十',
      '百',
      '千',
      '万',
      '円',
    ]);

    // Check 一
    const nhat = LESSON_2_N5_KANJI[0];
    expect(nhat.kanjiChar).toBe('一');
    expect(nhat.hanviet).toBe('NHẤT');
    expect(nhat.meaning).toBe('Một');
    expect(nhat.onyomi).toBe('イチ、イツ');
    expect(nhat.kunyomi).toBe('ひと、ひと.つ');
    expect(nhat.examples).toHaveLength(3);
    expect(nhat.examples[0].japanese).toBe('一つ');
    expect(nhat.examples[0].reading).toBe('ひとつ');
    expect(nhat.examples[0].meaning).toBe('một cái');

    // Check 円
    const vien = LESSON_2_N5_KANJI[13];
    expect(vien.kanjiChar).toBe('円');
    expect(vien.hanviet).toBe('VIÊN');
    expect(vien.meaning).toBe('Yên, tròn');
    expect(vien.onyomi).toBe('エン');
    expect(vien.kunyomi).toBe('まる.い');
    expect(vien.examples).toHaveLength(3);
    expect(vien.examples[0].japanese).toBe('円');
    expect(vien.examples[0].reading).toBe('えん');
    expect(vien.examples[0].meaning).toBe('yên');
  });

  it('contains 9 Kanji for Bài 24 N4 exactly matching the textbook photo', () => {
    expect(LESSON_24_N4_KANJI).toHaveLength(9);

    const chars = LESSON_24_N4_KANJI.map(k => k.kanjiChar);
    expect(chars).toEqual([
      '試',
      '問',
      '答',
      '耳',
      '用',
      '験',
      '集',
      '研',
      '台',
    ]);

    // Check 試
    const thi = LESSON_24_N4_KANJI[0];
    expect(thi.kanjiChar).toBe('試');
    expect(thi.hanviet).toBe('THỬ');
    expect(thi.meaning).toBe('Thử');
    expect(thi.onyomi).toBe('シ');
    expect(thi.kunyomi).toBe('ため.す、こころ.みる');
    expect(thi.examples).toHaveLength(2);
    expect(thi.examples[0].japanese).toBe('試験');
    expect(thi.examples[0].reading).toBe('しけん');
    expect(thi.examples[0].meaning).toBe('kỳ thi');

    // Check 台
    const dai = LESSON_24_N4_KANJI[8];
    expect(dai.kanjiChar).toBe('台');
    expect(dai.hanviet).toBe('ĐÀI');
    expect(dai.meaning).toBe('Bệ, đài');
    expect(dai.onyomi).toBe('ダイ、タイ');
    expect(dai.kunyomi).toBe('—');
  });

  it('contains 12 items for Bài 25 N4 exactly matching the textbook photo', () => {
    expect(LESSON_25_N4_KANJI).toHaveLength(12);

    const chars = LESSON_25_N4_KANJI.map(k => k.kanjiChar);
    expect(chars).toEqual([
      '飯',
      '場',
      '正',
      '世',
      '界',
      '急',
      '特',
      '県',
      '低',
      '弱',
      '不',
      '急',
    ]);

    // Check 飯
    const phan = LESSON_25_N4_KANJI[0];
    expect(phan.kanjiChar).toBe('飯');
    expect(phan.hanviet).toBe('PHẠN');
    expect(phan.meaning).toBe('Cơm');
    expect(phan.kunyomi).toBe('めし');
    expect(phan.onyomi).toBe('ハン');
    expect(phan.examples[0].japanese).toBe('ご飯');
    expect(phan.examples[0].meaning).toBe('cơm');

    // Check 不
    const bat = LESSON_25_N4_KANJI[10];
    expect(bat.kanjiChar).toBe('不');
    expect(bat.hanviet).toBe('BẤT');
    expect(bat.meaning).toBe('Không');
    expect(bat.onyomi).toBe('フ、ブ');
  });

  it('returns lessons for N5 starting from Bài 1 with Bài 2 available', () => {
    const n5Lessons = getLessonsForLevel('n5');
    expect(n5Lessons[0].lessonNum).toBe(1);
    expect(n5Lessons[0].title).toBe('Bài 1');
    expect(n5Lessons.length).toBe(20);

    const b2 = n5Lessons.find(l => l.lessonNum === 2);
    expect(b2).toBeDefined();
    expect(b2?.isAvailable).toBe(true);
    expect(b2?.kanjiList).toHaveLength(14);
    expect(b2?.kanjiList[0].kanjiChar).toBe('一');
    expect(b2?.kanjiList[13].kanjiChar).toBe('円');
  });

  it('returns lessons for N4 starting from Bài 21 with Bài 24, 25 and 26 available', () => {
    const n4Lessons = getLessonsForLevel('n4');
    expect(n4Lessons[0].lessonNum).toBe(21);
    expect(n4Lessons[0].title).toBe('Bài 21');
    expect(n4Lessons.length).toBe(30);

    const b24 = n4Lessons.find(l => l.lessonNum === 24);
    expect(b24).toBeDefined();
    expect(b24?.isAvailable).toBe(true);
    expect(b24?.kanjiList).toHaveLength(9);

    const b25 = n4Lessons.find(l => l.lessonNum === 25);
    expect(b25).toBeDefined();
    expect(b25?.isAvailable).toBe(true);
    expect(b25?.kanjiList).toHaveLength(12);

    const b26 = n4Lessons.find(l => l.lessonNum === 26);
    expect(b26).toBeDefined();
    expect(b26?.isAvailable).toBe(true);
    expect(b26?.kanjiList).toHaveLength(13);
  });

  it('retrieves lesson detail correctly with getLessonDetail', () => {
    const b2N5 = getLessonDetail('n5', 2);
    expect(b2N5).not.toBeNull();
    expect(b2N5?.title).toBe('Bài 2');
    expect(b2N5?.kanjiList).toHaveLength(14);
    expect(b2N5?.kanjiList[0].kanjiChar).toBe('一');
    expect(b2N5?.kanjiList[13].kanjiChar).toBe('円');

    const b24 = getLessonDetail('n4', 24);
    expect(b24).not.toBeNull();
    expect(b24?.title).toBe('Bài 24');
    expect(b24?.kanjiList[0].kanjiChar).toBe('試');

    const b25 = getLessonDetail('n4', 25);
    expect(b25).not.toBeNull();
    expect(b25?.title).toBe('Bài 25');
    expect(b25?.kanjiList[0].kanjiChar).toBe('飯');

    const b26 = getLessonDetail('n4', 26);
    expect(b26).not.toBeNull();
    expect(b26?.title).toBe('Bài 26');
    expect(b26?.kanjiList[0].kanjiChar).toBe('議');

    const nonExistent = getLessonDetail('n4', 999);
    expect(nonExistent).toBeNull();
  });
});
