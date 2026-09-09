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
  AlertCircle,
} from 'lucide-react';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

const enMetadataConfig = {
  pathname: '/translate/japanese-to-english',
  title: 'Japanese to English Translator | with Romaji Support | PThamSS',
  description:
    'Translate Japanese to English online for free. Use this page to understand hiragana, katakana, kanji, subtitles, messages, and mixed Japanese text more clearly.',
  keywords: [
    'japanese to english translator',
    'translate japanese to english',
    'hiragana to english',
    'kanji to english translator',
    'japanese text translator online',
  ],
  schemaName: 'Japanese to English Translator',
  breadcrumbName: 'Japanese to English',
};

const viMetadataConfig = {
  pathname: '/translate/japanese-to-english',
  title: 'Dịch tiếng Nhật sang tiếng Anh & Việt | Có phiên âm Romaji | PThamSS',
  description:
    'Dịch tiếng Nhật sang tiếng Anh và tiếng Việt trực tuyến miễn phí. Hỗ trợ nhận diện Hiragana, Katakana, Kanji, phụ đề, tin nhắn và văn bản tiếng Nhật với phiên âm Romaji chuẩn xác.',
  keywords: [
    'dịch tiếng nhật sang tiếng anh',
    'dịch tiếng nhật sang tiếng việt',
    'dịch tiếng nhật',
    'dịch kanji',
    'dịch hiragana sang tiếng việt',
    'japanese to english translator',
    'translate japanese to english',
    'pthamss dịch tiếng nhật',
  ],
  schemaName: 'Trình dịch tiếng Nhật sang tiếng Anh có Romaji',
  breadcrumbName: 'Nhật → Anh',
};

const enFaqItems: TranslatorFaqEntry[] = [
  {
    question: 'What is this page best for?',
    answer:
      'This page is best for understanding Japanese text, subtitles, notes, names, and mixed script input that includes hiragana, katakana, and kanji.',
  },
  {
    question: 'Can it handle mixed Japanese scripts?',
    answer:
      'Yes. It works with hiragana, katakana, kanji, and combinations of all three in one request.',
  },
  {
    question: 'What should I double-check after translating?',
    answer:
      'Double-check names, slang, honorifics, and context-heavy lines because machine translation can miss nuance.',
  },
];

const viFaqItems: TranslatorFaqEntry[] = [
  {
    question: 'Trang này phù hợp nhất cho mục đích gì?',
    answer:
      'Trang này tối ưu để hiểu văn bản tiếng Nhật, phụ đề phim, ghi chú học tập, tên gọi và văn bản kết hợp cả Hiragana, Katakana và Kanji.',
  },
  {
    question:
      'Trình dịch có xử lý được câu tiếng Nhật kết hợp nhiều loại chữ không?',
    answer:
      'Có. Hệ thống tự động nhận diện và xử lý mượt mà sự kết hợp giữa Hiragana, Katakana, Kanji và số/chữ Latinh trong cùng một câu.',
  },
  {
    question: 'Tôi nên lưu ý kiểm tra lại những gì sau khi dịch?',
    answer:
      'Nên kiểm tra lại tên riêng, tiếng lóng, kính ngữ và các câu lược bỏ chủ ngữ vì các yếu tố ngữ cảnh này có thể mang nhiều tầng nghĩa.',
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

export default async function JapaneseToEnglishPage({ params }: PageProps) {
  const { locale } = await params;
  const isVi = locale === 'vi' || !locale;

  const metadataConfig = isVi ? viMetadataConfig : enMetadataConfig;
  const faqItems = isVi ? viFaqItems : enFaqItems;

  const examples = [
    {
      ja: 'おはようございます',
      en: 'Good morning',
      vi: 'Chào buổi sáng',
      romaji: 'Ohayo gozaimasu',
    },
    {
      ja: 'よろしくお願いします',
      en: 'Please treat me favorably',
      vi: 'Rất mong nhận được sự giúp đỡ / Hợp tác vui vẻ',
      romaji: 'Yoroshiku onegaishimasu',
    },
    {
      ja: '本日は晴天なり',
      en: 'Today is clear weather',
      vi: 'Hôm nay trời nắng đẹp',
      romaji: 'Honjitsu wa seiten nari',
    },
    {
      ja: 'この漢字は難しい',
      en: 'This kanji is difficult',
      vi: 'Chữ Hán tự này khó quá',
      romaji: 'Kono kanji wa muzukashii',
    },
    {
      ja: '電車が遅れています',
      en: 'The train is delayed',
      vi: 'Chuyến tàu đang bị trễ',
      romaji: 'Densha ga okurete imasu',
    },
    {
      ja: '明日の予定を教えてください',
      en: "Please tell me tomorrow's plan",
      vi: 'Xin hãy cho tôi biết lịch trình ngày mai',
      romaji: 'Ashita no yotei o oshiete kudasai',
    },
    {
      ja: '今何時ですか',
      en: 'What time is it now?',
      vi: 'Bây giờ là mấy giờ rồi?',
      romaji: 'Ima nanji desu ka',
    },
    {
      ja: 'ここで写真を撮ってもいいですか',
      en: 'May I take a photo here?',
      vi: 'Tôi có thể chụp ảnh ở đây được không?',
      romaji: 'Koko de shashin o totte mo ii desu ka',
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
            {isVi ? 'Nhật → Anh (Romaji)' : 'Japanese → English (Romaji)'}
          </span>
          <span className='inline-flex items-center gap-1 text-xs text-(--secondary-color)'>
            <Sparkles className='h-3 w-3 text-amber-500' />
            {isVi ? 'Hỗ trợ Kanji & Kana' : 'Kanji & Kana supported'}
          </span>
        </div>

        <h1 className='text-3xl font-extrabold tracking-tight text-(--main-color) sm:text-4xl'>
          {isVi
            ? 'Dịch Tiếng Nhật Sang Tiếng Anh'
            : 'Japanese → English Translator'}
        </h1>

        <p className='mt-4 text-base leading-relaxed text-(--secondary-color) sm:text-lg'>
          {isVi
            ? 'Sử dụng trang này khi mục tiêu của bạn là hiểu nghĩa của văn bản tiếng Nhật. Rất lý tưởng để tra cứu Hiragana, Katakana, Kanji, kiểm tra phụ đề phim, tin nhắn, ghi chú ngắn và đọc hiểu nhanh khi bạn cần nắm bắt ý nghĩa trước tiên.'
            : 'Use this page when your goal is to understand Japanese input. It is ideal for hiragana, katakana, kanji, subtitle checks, messages, short notes, and quick reading support when you want meaning first.'}
        </p>

        {/* Bullet Points */}
        <ul className='mt-5 space-y-2.5 text-sm text-(--secondary-color) sm:text-base'>
          <li className='flex items-start gap-2.5'>
            <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
            <span>
              {isVi
                ? 'Hữu ích cho phụ đề phim ảnh, ghi chú tự học, tra cứu tên gọi và luyện đọc thực tế.'
                : 'Useful for subtitles, study notes, names, and reading practice.'}
            </span>
          </li>
          <li className='flex items-start gap-2.5'>
            <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
            <span>
              {isVi
                ? 'Xử lý mượt mà văn bản tiếng Nhật kết hợp Hiragana, Katakana và Kanji trong cùng một câu.'
                : 'Handles mixed Japanese scripts in one request.'}
            </span>
          </li>
          <li className='flex items-start gap-2.5'>
            <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
            <span>
              {isVi
                ? 'Tối ưu cho việc hỗ trợ đọc hiểu ý nghĩa và cách phát âm Romaji chuẩn xác.'
                : 'Best when you want comprehension support, not polished Japanese output.'}
            </span>
          </li>
        </ul>

        {/* Direct Action Banner */}
        <div className='mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-(--main-color)/20 bg-linear-to-r from-(--main-color)/5 via-transparent to-(--main-color)/10 p-5 sm:flex-row sm:items-center sm:p-6'>
          <div>
            <h2 className='flex items-center gap-2 text-lg font-bold text-(--main-color)'>
              <Sparkles className='h-5 w-5 text-amber-500' />
              {isVi
                ? 'Bạn muốn dịch câu tiếng Nhật ngay bây giờ?'
                : 'Want to translate Japanese text right now?'}
            </h2>
            <p className='mt-1 text-sm text-(--secondary-color)'>
              {isVi
                ? 'Mở trình dịch tương tác trực tiếp với phân tích Romaji tự động và nghe phát âm.'
                : 'Open the interactive live translator with instant romaji breakdown and audio.'}
            </p>
          </div>
          <Link
            href='/translate?from=ja&to=en'
            className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-(--main-color) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90'
          >
            {isVi ? 'Mở Trình Dịch Trực Tiếp' : 'Open Live Translator'}
            <ArrowRight className='h-4 w-4' />
          </Link>
        </div>

        {/* Section 1: When to use */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='flex items-center gap-2 text-xl font-bold text-(--main-color)'>
            <BookOpen className='h-5 w-5 text-(--main-color)' />
            {isVi
              ? 'Cách sử dụng trang này hiệu quả nhất'
              : 'How to use this page well'}
          </h2>
          <div className='mt-3 space-y-3 text-sm leading-relaxed text-(--secondary-color) sm:text-base'>
            <p>
              {isVi
                ? 'Trang này được xây dựng chuyên biệt để giải nghĩa. Khi bạn đọc tiếng Nhật và muốn kiểm tra nghĩa nhanh, hãy dán câu văn vào đây trước khi quyết định xem có cần tra cứu chuyên sâu từ điển hay ngữ pháp hay không.'
                : 'This route is built for interpretation. If you are reading Japanese and want to check the meaning quickly, paste the line here first before you decide whether you need a deeper dictionary or grammar breakdown.'}
            </p>
            <p>
              {isVi
                ? 'Chất lượng bản dịch có thể bị ảnh hưởng nếu câu phụ thuộc nhiều vào ngữ điệu, chủ ngữ bị ẩn, chơi chữ hoặc văn hóa bản địa. Do đó hãy xem bản dịch là bước giải nghĩa ban đầu để nắm bắt đại ý một cách chính xác.'
                : 'Translation quality drops when a line depends heavily on tone, omitted subjects, jokes, or cultural references, so treat tricky lines as a first-pass explanation rather than a final answer.'}
            </p>
          </div>
        </section>

        {/* Section 2: Examples Table */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='flex items-center gap-2 text-xl font-bold text-(--main-color)'>
            <Languages className='h-5 w-5 text-(--main-color)' />
            {isVi
              ? 'Bảng câu mẫu thông dụng (Nhật → Anh)'
              : 'Example phrases (Japanese to English)'}
          </h2>
          <p className='mt-1 text-xs text-(--secondary-color) sm:text-sm'>
            {isVi
              ? 'Một số câu tiếng Nhật phổ biến kèm phiên âm Romaji và ý nghĩa dịch sang tiếng Anh / tiếng Việt:'
              : 'Common conversational Japanese phrases with romaji pronunciation and translations:'}
          </p>
          <div className='mt-4 overflow-x-auto rounded-xl border border-(--border-color)'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-(--border-color) bg-(--main-color)/5 font-semibold text-(--main-color)'>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Tiếng Nhật (Kanji / Kana)' : 'Japanese'}
                  </th>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Phiên âm Romaji' : 'Romaji'}
                  </th>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Bản dịch Anh & Việt' : 'English Translation'}
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
                        {row.en}
                      </div>
                      {isVi && (
                        <div className='mt-0.5 text-xs text-(--secondary-color)/80'>
                          {row.vi}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Limitations */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='flex items-center gap-2 text-xl font-bold text-(--main-color)'>
            <AlertCircle className='h-5 w-5 text-amber-500' />
            {isVi
              ? 'Các lưu ý thường gặp khi dịch'
              : 'Common limitations to keep in mind'}
          </h2>
          <ul className='mt-4 space-y-3 text-sm text-(--secondary-color) sm:text-base'>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Tên riêng tiếng Nhật có thể có nhiều cách đọc và cách dịch khác nhau tùy ngữ cảnh.'
                  : 'Names can have multiple valid readings and translations.'}
              </span>
            </li>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Cách nói trong anime, phim ảnh và tiếng lóng giới trẻ thường cần thêm ngữ cảnh để diễn giải đúng ý.'
                  : 'Anime-style phrasing and slang often need extra context.'}
              </span>
            </li>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Sắc thái kính ngữ (Keigo) và các câu bị lược bỏ chủ ngữ trong giao tiếp tiếng Nhật cần người học để ý thêm.'
                  : 'Honorific nuance and omitted subjects may not translate cleanly.'}
              </span>
            </li>
          </ul>
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
            href='/translate/english-to-japanese'
            className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-sm font-medium text-(--main-color) shadow-xs transition-colors hover:bg-(--main-color)/5'
          >
            {isVi ? 'Dịch Anh → Nhật' : 'English to Japanese'}
          </Link>
          <Link
            href='/translate/romaji'
            className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-sm font-medium text-(--main-color) shadow-xs transition-colors hover:bg-(--main-color)/5'
          >
            {isVi ? 'Hướng dẫn Romaji' : 'Romaji guide'}
          </Link>
        </div>
      </main>
    </>
  );
}
