import type { Metadata } from 'next';
import Link from 'next/link';
import {
  buildTranslatorMetadata,
  buildTranslatorSchema,
  type TranslatorFaqEntry,
} from '@/features/Translator/lib/seo';
import { StructuredData } from '@/shared/ui-composite/SEO/StructuredData';
import { routing } from '@/core/i18n/routing';
import {
  ArrowRight,
  Languages,
  Sparkles,
  BookOpen,
  Lightbulb,
} from 'lucide-react';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

const enMetadataConfig = {
  pathname: '/translate/romaji',
  title: 'Japanese to Romaji Guide | Pronunciation & Reading | PThamSS',
  description:
    'Learn how to use Japanese to romaji output for pronunciation support, reading checks, and beginner-friendly verification without treating romaji as a full replacement for kana.',
  keywords: [
    'romaji translator',
    'japanese to romaji',
    'japanese romaji guide',
    'romaji pronunciation',
    'kana to romaji',
  ],
  schemaName: 'Japanese to Romaji Guide',
  breadcrumbName: 'Romaji Guide',
};

const viMetadataConfig = {
  pathname: '/translate/romaji',
  title:
    'Hướng dẫn phiên âm Romaji tiếng Nhật | Cách đọc & Phát âm chuẩn | PThamSS',
  description:
    'Tìm hiểu cách sử dụng phiên âm Romaji tiếng Nhật để hỗ trợ luyện phát âm, kiểm tra cách đọc và làm quen với bảng chữ cái tiếng Nhật một cách chuẩn xác nhất.',
  keywords: [
    'romaji tiếng nhật',
    'dịch romaji',
    'phiên âm tiếng nhật',
    'cách đọc romaji',
    'romaji translator',
    'japanese to romaji',
    'kana sang romaji',
    'pthamss romaji',
  ],
  schemaName: 'Hướng dẫn phiên âm Romaji tiếng Nhật',
  breadcrumbName: 'Hướng dẫn Romaji',
};

const enFaqItems: TranslatorFaqEntry[] = [
  {
    question: 'What is romaji useful for?',
    answer:
      'Romaji is useful for pronunciation support, quick reading checks, and helping beginners bridge into kana.',
  },
  {
    question: 'Should I rely on romaji alone?',
    answer:
      'No. Romaji is a bridge, not a replacement for learning hiragana, katakana, and eventually kanji.',
  },
  {
    question: 'When should I use this page instead of the translator pages?',
    answer:
      'Use this page when pronunciation help is the main goal rather than translating meaning between English and Japanese.',
  },
];

const viFaqItems: TranslatorFaqEntry[] = [
  {
    question: 'Romaji có tác dụng gì trong việc học tiếng Nhật?',
    answer:
      'Romaji giúp hỗ trợ phát âm đúng ngay từ đầu, kiểm tra cách đọc nhanh chóng và làm cầu nối cho người mới bắt đầu tiếp cận bảng chữ cái Kana.',
  },
  {
    question:
      'Tôi có nên chỉ dựa hoàn toàn vào Romaji khi học tiếng Nhật không?',
    answer:
      'Không nên. Romaji chỉ là chiếc cầu nối ban đầu, không thể thay thế việc học Hiragana, Katakana và Kanji nếu bạn muốn thành thạo tiếng Nhật.',
  },
  {
    question: 'Khi nào tôi nên dùng trang này thay vì các trang dịch nghĩa?',
    answer:
      'Hãy sử dụng trang này khi mục tiêu chính của bạn là hỗ trợ phát âm và cách đọc, thay vì dịch nghĩa hai chiều giữa các ngôn ngữ.',
  },
];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi' || !locale;

  const metadataConfig = isVi ? viMetadataConfig : enMetadataConfig;
  const faqItems = isVi ? viFaqItems : enFaqItems;

  return buildTranslatorMetadata({
    ...metadataConfig,
    faq: faqItems,
  });
}

export default async function RomajiPage({ params }: PageProps) {
  const { locale } = await params;
  const isVi = locale === 'vi' || !locale;

  const metadataConfig = isVi ? viMetadataConfig : enMetadataConfig;
  const faqItems = isVi ? viFaqItems : enFaqItems;

  const examples = [
    {
      ja: 'こんにちは',
      romaji: 'konnichiwa',
      meaningEn: 'Hello',
      meaningVi: 'Xin chào',
    },
    {
      ja: 'ありがとう',
      romaji: 'arigatou',
      meaningEn: 'Thank you',
      meaningVi: 'Cảm ơn bạn',
    },
    {
      ja: '駅はどこですか',
      romaji: 'eki wa doko desu ka',
      meaningEn: 'Where is the station?',
      meaningVi: 'Nhà ga ở đâu?',
    },
    {
      ja: '漢字',
      romaji: 'kanji',
      meaningEn: 'Chinese character / kanji',
      meaningVi: 'Chữ Hán / Hán tự',
    },
    {
      ja: '日本語を勉強しています',
      romaji: 'nihongo o benkyou shite imasu',
      meaningEn: 'I am studying Japanese',
      meaningVi: 'Tôi đang học tiếng Nhật',
    },
    {
      ja: '大丈夫です',
      romaji: 'daijoubu desu',
      meaningEn: 'It is okay',
      meaningVi: 'Không sao đâu / Ổn cả',
    },
  ];

  return (
    <>
      <StructuredData
        data={buildTranslatorSchema({
          ...metadataConfig,
          faq: faqItems,
        })}
      />
      <main className='mx-auto max-w-4xl px-4 py-10'>
        {/* Header Section */}
        <div className='mb-3 flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-(--main-color)/20 bg-(--main-color)/10 px-3 py-1 text-xs font-semibold text-(--main-color)'>
            <Languages className='h-3.5 w-3.5' />
            {isVi ? 'Cẩm nang phiên âm Romaji' : 'Romaji Guide'}
          </span>
          <span className='inline-flex items-center gap-1 text-xs text-(--secondary-color)'>
            <Sparkles className='h-3 w-3 text-amber-500' />
            {isVi ? 'Phát âm chuẩn tiếng Nhật' : 'Pronunciation support'}
          </span>
        </div>

        <h1 className='text-3xl font-extrabold tracking-tight text-(--main-color) sm:text-4xl'>
          {isVi
            ? 'Hướng Dẫn Phiên Âm Romaji Tiếng Nhật'
            : 'Japanese to Romaji Guide'}
        </h1>

        <p className='mt-4 text-base leading-relaxed text-(--secondary-color) sm:text-lg'>
          {isVi
            ? 'Romaji là hệ thống ghi âm tiếng Nhật bằng chữ cái Latinh. Nó rất hữu ích cho việc hỗ trợ phát âm và kiểm tra cách đọc nhanh chóng, nhưng sẽ phát huy hiệu quả tốt nhất khi bạn sử dụng nó như một chiếc cầu nối để học bảng chữ cái Kana thay vì dùng để thay thế hoàn toàn.'
            : 'Romaji writes Japanese sounds with the Latin alphabet. It is helpful for pronunciation support and quick reading checks, but it works best when you use it as a bridge into kana rather than a replacement.'}
        </p>

        {/* Section 1: How to use properly */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='flex items-center gap-2 text-xl font-bold text-(--main-color)'>
            <Lightbulb className='h-5 w-5 text-amber-500' />
            {isVi
              ? 'Cách sử dụng Romaji đúng đắn'
              : 'How to use romaji correctly'}
          </h2>
          <ul className='mt-4 space-y-2.5 text-sm text-(--secondary-color) sm:text-base'>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Sử dụng để phát âm từ mới và xác nhận nhanh cách đọc chuẩn.'
                  : 'Use it to pronounce new words and confirm readings quickly.'}
              </span>
            </li>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Luôn đối chiếu song song với chữ Hiragana hoặc Katakana bất cứ khi nào có thể.'
                  : 'Cross-check against hiragana or katakana whenever possible.'}
              </span>
            </li>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Không lạm dụng Romaji thay thế cho việc học chữ viết tiếng Nhật thực tế.'
                  : 'Do not treat it as a replacement for Japanese script study.'}
              </span>
            </li>
          </ul>
        </section>

        {/* Action Banner */}
        <div className='mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-(--main-color)/20 bg-linear-to-r from-(--main-color)/5 via-transparent to-(--main-color)/10 p-5 sm:flex-row sm:items-center sm:p-6'>
          <div>
            <h2 className='flex items-center gap-2 text-lg font-bold text-(--main-color)'>
              <Sparkles className='h-5 w-5 text-amber-500' />
              {isVi
                ? 'Bạn muốn tra cứu phiên âm Romaji tự động?'
                : 'Want instant romaji breakdown for any text?'}
            </h2>
            <p className='mt-1 text-sm text-(--secondary-color)'>
              {isVi
                ? 'Dán bất kỳ câu tiếng Nhật nào vào trình dịch PThamSS để nhận ngay Romaji và phát âm.'
                : 'Paste any Japanese text into the PThamSS translator to view full romaji pronunciation.'}
            </p>
          </div>
          <Link
            href='/translate?from=ja&to=en'
            className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-(--main-color) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90'
          >
            {isVi ? 'Mở Trình Phân Tích Romaji' : 'Open Translator'}
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>

        {/* Section 2: Examples Table */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='flex items-center gap-2 text-xl font-bold text-(--main-color)'>
            <BookOpen className='h-5 w-5 text-(--main-color)' />
            {isVi
              ? 'Bảng ví dụ tiếng Nhật sang Romaji'
              : 'Japanese to romaji examples'}
          </h2>
          <div className='mt-4 overflow-x-auto rounded-xl border border-(--border-color)'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-(--border-color) bg-(--main-color)/5 font-semibold text-(--main-color)'>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Tiếng Nhật' : 'Japanese'}
                  </th>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Phiên âm Romaji' : 'Romaji'}
                  </th>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Ý nghĩa (Việt & Anh)' : 'Meaning'}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-(--border-color)/60 text-(--secondary-color)'>
                {examples.map(row => (
                  <tr
                    key={row.ja}
                    className='transition-colors hover:bg-(--main-color)/5'
                  >
                    <td className='px-3.5 py-2.5 text-base font-medium text-(--main-color)'>
                      {row.ja}
                    </td>
                    <td className='px-3.5 py-2.5 text-sm text-(--secondary-color) italic'>
                      {row.romaji}
                    </td>
                    <td className='px-3.5 py-2.5'>
                      <div className='font-medium text-(--main-color)'>
                        {isVi ? row.meaningVi : row.meaningEn}
                      </div>
                      {isVi && (
                        <div className='mt-0.5 text-xs text-(--secondary-color)/80'>
                          {row.meaningEn}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: When romaji helps and when it does not */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='flex items-center gap-2 text-xl font-bold text-(--main-color)'>
            <Languages className='h-5 w-5 text-(--main-color)' />
            {isVi
              ? 'Khi nào Romaji hữu ích và khi nào không?'
              : 'When romaji helps and when it does not'}
          </h2>
          <div className='mt-3 space-y-3 text-sm leading-relaxed text-(--secondary-color) sm:text-base'>
            <p>
              {isVi
                ? 'Romaji rất hữu ích khi bạn cần một gợi ý phát âm nhanh hoặc kiểm tra cách đọc của một câu tiếng Nhật mà bạn chưa thể đọc trôi chảy ngay lập tức.'
                : 'Romaji is useful when you need a pronunciation prompt or a quick sanity check on a Japanese line you cannot read fluently yet.'}
            </p>
            <p>
              {isVi
                ? 'Romaji ít hữu ích hơn nhiều khi bạn cần hiểu sắc thái, chính tả hoặc ranh giới giữa các từ vựng. Trong các trường hợp đó, hãy kết hợp Romaji với Kana, Kanji và các trang tra cứu dịch thuật chuyên sâu.'
                : 'It is much less useful when you need to understand nuance, spelling, or word boundaries. For that, pair romaji with kana, kanji, and a meaning-focused translation page.'}
            </p>
          </div>
        </section>

        {/* Section 4: FAQ */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='mb-4 text-xl font-bold text-(--main-color)'>
            {isVi ? 'Câu hỏi thường gặp' : 'Frequently Asked Questions'}
          </h2>
          <div className='space-y-4'>
            {faqItems.map(faq => (
              <div
                key={faq.question}
                className='border-b border-(--border-color)/50 pb-3.5 last:border-0 last:pb-0'
              >
                <h3 className='text-base font-semibold text-(--main-color)'>
                  {faq.question}
                </h3>
                <p className='mt-1 text-sm leading-relaxed text-(--secondary-color)'>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Navigation Links */}
        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            href='/translate'
            className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-sm font-medium text-(--main-color) shadow-xs transition-colors hover:bg-(--main-color)/5'
          >
            {isVi ? 'Trình dịch chính' : 'Open translator hub'}
          </Link>
          <Link
            href='/kana'
            className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-sm font-medium text-(--main-color) shadow-xs transition-colors hover:bg-(--main-color)/5'
          >
            {isVi ? 'Luyện bảng chữ cái Kana' : 'Practice kana'}
          </Link>
          <Link
            href='/translate/english-to-japanese'
            className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-sm font-medium text-(--main-color) shadow-xs transition-colors hover:bg-(--main-color)/5'
          >
            {isVi ? 'Dịch Anh → Nhật' : 'English to Japanese'}
          </Link>
        </div>
      </main>
    </>
  );
}
