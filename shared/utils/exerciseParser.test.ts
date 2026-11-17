import { describe, expect, it } from 'vitest';
import { parseAikenFormat, questionsToAiken } from './exerciseParser';

const SAMPLE = `[PART: Mondai 6]
[PASSAGE: Tờ rơi]
PASSAGE_IMAGE: https://example.com/flyer.png
[/PASSAGE]

Câu 1: Giá vé người lớn là bao nhiêu?
QUESTION_IMAGE: https://example.com/q1.png
A. 500 yên
B. 800 yên
C. 1200 yên
ANSWER: B

Câu 2: Mở cửa lúc mấy giờ?
A. 9 giờ
B. 10 giờ
C. 11 giờ
ANSWER: A`;

describe('exerciseParser images and 3-option questions', () => {
  it('reads passage and question images and keeps 3 options', () => {
    const qs = parseAikenFormat(SAMPLE);

    expect(qs).toHaveLength(2);
    expect(qs[0].passage).toBeUndefined();
    expect(qs[0].passage_image).toBe('https://example.com/flyer.png');
    expect(qs[0].question_image).toBe('https://example.com/q1.png');
    expect(qs[0].options).toHaveLength(3);
    expect(qs[0].correct_answer).toBe('B');
    expect(qs[1].passage_image).toBe('https://example.com/flyer.png');
    expect(qs[1].question_image).toBeUndefined();
  });

  it('round-trips through questionsToAiken', () => {
    const again = parseAikenFormat(questionsToAiken(parseAikenFormat(SAMPLE)));

    expect(again[0].passage_image).toBe('https://example.com/flyer.png');
    expect(again[0].question_image).toBe('https://example.com/q1.png');
    expect(again[1].passage_image).toBe('https://example.com/flyer.png');
  });
});
