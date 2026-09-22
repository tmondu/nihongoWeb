import { describe, expect, it, vi } from 'vitest';
import { generatePageMetadata } from './metadata-helpers';

vi.mock('./routing', () => ({
  routing: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    localePrefix: 'never',
  },
}));

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(
    async () =>
      ((key: string) => {
        if (key.endsWith('.title')) return 'Sample Title';
        if (key.endsWith('.titleShort')) return 'Sample Title Short';
        if (key.endsWith('.description'))
          return 'Sample description for metadata';
        if (key.endsWith('.keywords')) return 'kana, kanji, vocabulary';
        return key;
      }) as (key: string) => string,
  ),
}));

describe('generatePageMetadata canonical + hreflang', () => {
  it('uses no locale prefix in canonical for localePrefix=never', async () => {
    const metadata = await generatePageMetadata('kana', {
      locale: 'en',
      pathname: '/kana',
      baseUrl: 'https://www.pthamnihongo.site/',
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://www.pthamnihongo.site/kana',
    );
  });

  it('keeps locale alternates reciprocal and stable in no-prefix routing', async () => {
    const metadata = await generatePageMetadata('kanjiJlptN5', {
      locale: 'en',
      pathname: '/kanji/jlpt-n5',
      baseUrl: 'https://www.pthamnihongo.site',
    });

    expect(metadata.alternates?.languages).toEqual({
      vi: 'https://www.pthamnihongo.site/kanji/jlpt-n5',
      en: 'https://www.pthamnihongo.site/kanji/jlpt-n5',
      'x-default': 'https://www.pthamnihongo.site/kanji/jlpt-n5',
    });
  });

  it('normalizes unknown locale to canonical no-prefix URL', async () => {
    const metadata = await generatePageMetadata('vocabulary', {
      locale: 'fr',
      pathname: '/vocabulary',
      baseUrl: 'https://www.pthamnihongo.site',
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://www.pthamnihongo.site/vocabulary',
    );
    expect(metadata.openGraph?.url).toBe(
      'https://www.pthamnihongo.site/vocabulary',
    );
  });
});
