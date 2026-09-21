import { describe, expect, it } from 'vitest';
import radicalsData from '@/public/data-kanji/radicals.json';
import compositionsData from '@/public/data-kanji/radical_kanji_map.json';
import type { IRadical, IKanjiComposition } from '@/entities/radical';

const radicals = radicalsData as IRadical[];
const compositions = compositionsData as IKanjiComposition[];

describe('Kangxi Radicals Dataset', () => {
  it('contains exactly 214 Kangxi radicals with sequential IDs', () => {
    expect(radicals.length).toBe(214);
    radicals.forEach((r, idx) => {
      expect(r.id).toBe(idx + 1);
      expect(r.char).toBeDefined();
      expect(r.strokeCount).toBeGreaterThan(0);
      expect(r.hanviet).toBeDefined();
      expect(r.meaning_vi).toBeDefined();
      expect(['core', 'extended', 'rare']).toContain(r.layer);
    });
  });

  it('includes core radicals in the top layer', () => {
    const coreRadicals = radicals.filter(r => r.layer === 'core');
    const coreChars = coreRadicals.map(r => r.char);

    // Common essential radicals must be present in core layer
    expect(coreChars).toContain('人');
    expect(coreChars).toContain('水');
    expect(coreChars).toContain('木');
    expect(coreChars).toContain('日');
    expect(coreChars).toContain('月');
    expect(coreChars).toContain('女');
    expect(coreChars).toContain('口');
    expect(coreChars).toContain('言');
  });
});

describe('Kanji Synthesis & Composition Map', () => {
  it('correctly maps radical combinations to Kanji with stories', () => {
    expect(compositions.length).toBeGreaterThanOrEqual(30);

    // 休 = 亻 + 木
    const kyuu = compositions.find(c => c.kanji === '休');
    expect(kyuu).toBeDefined();
    expect(kyuu?.hanviet).toBe('HƯU');
    expect(kyuu?.radicals).toContain('亻');
    expect(kyuu?.radicals).toContain('木');
    expect(kyuu?.story).toContain('nghỉ ngơi');

    // 明 = 日 + 月
    const mei = compositions.find(c => c.kanji === '明');
    expect(mei).toBeDefined();
    expect(mei?.hanviet).toBe('MINH');
    expect(mei?.radicals).toContain('日');
    expect(mei?.radicals).toContain('月');

    // 千 = 丿 + 十
    const sen = compositions.find(c => c.kanji === '千');
    expect(sen).toBeDefined();
    expect(sen?.hanviet).toBe('THIÊN');
    expect(sen?.radicals).toContain('丿');
    expect(sen?.radicals).toContain('十');
    expect(sen?.level).toBe('N5');
  });

  it('covers all repository Kanji from N5 to N1 (> 2000 Kanji)', () => {
    expect(compositions.length).toBeGreaterThanOrEqual(2000);
  });
});
