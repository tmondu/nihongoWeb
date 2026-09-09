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
  pathname: '/translate/english-to-japanese',
  title: 'English to Japanese Translator | with Romaji Support | PThamSS',
  description:
    'Translate English to Japanese online for free. Get Japanese output, romaji support, and practical guidance for travel phrases, messages, and study examples.',
  keywords: [
    'english to japanese translator',
    'translate english to japanese',
    'english japanese translator online',
    'english to japanese with romaji',
    'free english to japanese translator',
  ],
  schemaName: 'English to Japanese Translator',
  breadcrumbName: 'English to Japanese',
};

const viMetadataConfig = {
  pathname: '/translate/english-to-japanese',
  title: 'Dịch tiếng Anh sang tiếng Nhật | Có phiên âm Romaji | PThamSS',
  description:
    'Dịch tiếng Anh sang tiếng Nhật trực tuyến miễn phí. Nhận kết quả chữ Nhật chuẩn xác, phiên âm Romaji luyện phát âm, câu mẫu giao tiếp du lịch và mẹo viết tự nhiên.',
  keywords: [
    'dịch tiếng anh sang tiếng nhật',
    'dịch tiếng anh sang nhật',
    'dịch anh nhật có romaji',
    'trình dịch tiếng nhật trực tuyến',
    'english to japanese translator',
    'translate english to japanese',
    'pthamss dịch thuật',
  ],
  schemaName: 'Trình dịch tiếng Anh sang tiếng Nhật có Romaji',
  breadcrumbName: 'Anh → Nhật',
};

const enFaqItems: TranslatorFaqEntry[] = [
  {
    question: 'What is this page best for?',
    answer:
      'This page is best for turning English phrases and short paragraphs into Japanese while reviewing output and pronunciation support.',
  },
  {
    question: 'Does it include romaji?',
    answer:
      'Yes. Romaji is available as pronunciation support when the output is Japanese.',
  },
  {
    question: 'How do I get more natural Japanese output?',
    answer:
      'Write short, direct English sentences and avoid vague pronouns or missing context when precision matters.',
  },
];

const viFaqItems: TranslatorFaqEntry[] = [
  {
    question: 'Trang này phù hợp nhất cho mục đích gì?',
    answer:
      'Trang này giúp bạn chuyển đổi các câu tiếng Anh, cụm từ giao tiếp hoặc đoạn văn ngắn sang tiếng Nhật chuẩn xác, đồng thời cung cấp phiên âm Romaji để hỗ trợ luyện phát âm và tra cứu ngữ cảnh.',
  },
  {
    question: 'Kết quả dịch có bao gồm phiên âm Romaji không?',
    answer:
      'Có. Mọi kết quả tiếng Nhật đều có phiên âm chữ Latinh (Romaji) đi kèm bên dưới, giúp người mới học hoặc khách du lịch dễ dàng đọc chuẩn ngữ điệu.',
  },
  {
    question: 'Làm thế nào để bản dịch tiếng Nhật tự nhiên nhất?',
    answer:
      'Nên sử dụng câu tiếng Anh ngắn gọn, rõ ràng, xác định cụ thể chủ ngữ và hạn chế các đại từ mơ hồ như "it" hoặc "that" khi cần độ chính xác cao.',
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

export default async function EnglishToJapanesePage({ params }: PageProps) {
  const { locale } = await params;
  const isVi = locale === 'vi' || !locale;

  const metadataConfig = isVi ? viMetadataConfig : enMetadataConfig;
  const faqItems = isVi ? viFaqItems : enFaqItems;

  const examples = [
    {
      en: 'Where is the station?',
      vi: 'Nhà ga ở đâu?',
      ja: '駅はどこですか？',
      romaji: 'Eki wa doko desu ka?',
    },
    {
      en: 'I need help',
      vi: 'Tôi cần giúp đỡ',
      ja: '助けが必要です',
      romaji: 'Tasuke ga hitsuyo desu',
    },
    {
      en: 'How much is this?',
      vi: 'Cái này giá bao nhiêu?',
      ja: 'これはいくらですか？',
      romaji: 'Kore wa ikura desu ka?',
    },
    {
      en: 'Please speak slowly',
      vi: 'Xin hãy nói chậm lại một chút',
      ja: 'ゆっくり話してください',
      romaji: 'Yukkuri hanashite kudasai',
    },
    {
      en: 'Can I pay by card?',
      vi: 'Tôi có thể thanh toán bằng thẻ không?',
      ja: 'カードで払えますか？',
      romaji: 'Kaado de haraemasu ka?',
    },
    {
      en: 'I am learning Japanese',
      vi: 'Tôi đang học tiếng Nhật',
      ja: '日本語を勉強しています',
      romaji: 'Nihongo o benkyo shite imasu',
    },
    {
      en: 'Nice to meet you',
      vi: 'Rất vui được gặp bạn',
      ja: 'はじめまして',
      romaji: 'Hajimemashite',
    },
    {
      en: 'What does this kanji mean?',
      vi: 'Chữ Hán tự này có nghĩa là gì?',
      ja: 'この漢字はどういう意味ですか？',
      romaji: 'Kono kanji wa do iu imi desu ka?',
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
            {isVi ? 'Anh → Nhật (Romaji)' : 'English → Japanese (Romaji)'}
          </span>
          <span className='inline-flex items-center gap-1 text-xs text-(--secondary-color)'>
            <Sparkles className='h-3 w-3 text-amber-500' />
            {isVi ? 'Kèm phiên âm chuẩn' : 'Pronunciation included'}
          </span>
        </div>

        <h1 className='text-3xl font-extrabold tracking-tight text-(--main-color) sm:text-4xl'>
          {isVi
            ? 'Dịch Tiếng Anh Sang Tiếng Nhật'
            : 'English → Japanese Translator'}
        </h1>

        <p className='mt-4 text-base leading-relaxed text-(--secondary-color) sm:text-lg'>
          {isVi
            ? 'Sử dụng trang này khi mục tiêu của bạn là tạo văn bản tiếng Nhật từ tiếng Anh. Rất thích hợp cho các câu giao tiếp hàng ngày, kiểm tra ngữ pháp khi viết, câu hỏi khi du lịch Nhật Bản, bài tập thực hành và tin nhắn ngắn kèm phiên âm Romaji trực quan.'
            : 'Use this page when your goal is to produce Japanese text from English. It is strongest for everyday phrases, quick writing checks, travel questions, study prompts, and short messages where you want readable Japanese plus romaji support.'}
        </p>

        {/* Bullet Points */}
        <ul className='mt-5 space-y-2.5 text-sm text-(--secondary-color) sm:text-base'>
          <li className='flex items-start gap-2.5'>
            <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
            <span>
              {isVi
                ? 'Tối ưu cho các cụm từ hàng ngày, bài tập mẫu và hỗ trợ soạn thảo câu tiếng Nhật nhanh.'
                : 'Best for everyday phrases, study prompts, and quick writing help.'}
            </span>
          </li>
          <li className='flex items-start gap-2.5'>
            <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
            <span>
              {isVi
                ? 'Kết quả bao gồm cả chữ Nhật (Kanji/Kana) và phiên âm Romaji để luyện phát âm chính xác.'
                : 'Output includes Japanese text and romaji for pronunciation support.'}
            </span>
          </li>
          <li className='flex items-start gap-2.5'>
            <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
            <span>
              {isVi
                ? 'Nên giữ câu tiếng Anh đầu vào ngắn gọn và cụ thể để đạt độ chính xác cao nhất.'
                : 'Keep English input short and specific for cleaner results.'}
            </span>
          </li>
        </ul>

        {/* Direct Action Banner */}
        <div className='mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-(--main-color)/20 bg-linear-to-r from-(--main-color)/5 via-transparent to-(--main-color)/10 p-5 sm:flex-row sm:items-center sm:p-6'>
          <div>
            <h2 className='flex items-center gap-2 text-lg font-bold text-(--main-color)'>
              <Sparkles className='h-5 w-5 text-amber-500' />
              {isVi
                ? 'Bạn muốn dịch văn bản ngay bây giờ?'
                : 'Want to translate text right now?'}
            </h2>
            <p className='mt-1 text-sm text-(--secondary-color)'>
              {isVi
                ? 'Mở trình dịch tương tác trực tiếp với bộ phân tích Romaji và hỗ trợ phát âm.'
                : 'Open the interactive live translator with instant romaji breakdown and audio.'}
            </p>
          </div>
          <Link
            href='/translate?from=en&to=ja'
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
            {isVi ? 'Khi nào nên sử dụng trang này?' : 'When to use this page'}
          </h2>
          <div className='mt-3 space-y-3 text-sm leading-relaxed text-(--secondary-color) sm:text-base'>
            <p>
              {isVi
                ? 'Hãy sử dụng trang này khi bạn cần bản dịch tiếng Nhật chuẩn xác để sử dụng ngay trong thực tế. Dù là soạn câu hỏi khi du lịch Nhật Bản, kiểm tra ngữ pháp câu khi tự học, hay chuyển đổi một ghi chú tiếng Anh sang tiếng Nhật, đây là hướng dẫn hữu ích nhất.'
                : 'Use this route when the final output matters. If you are drafting a travel phrase, checking a sentence for study, or turning an English note into Japanese, this page should be the primary destination.'}
            </p>
            <p>
              {isVi
                ? 'Để có kết quả tốt nhất, hãy giữ chủ ngữ rõ ràng, tránh các thành ngữ phức tạp của tiếng Anh và kiểm tra lại từ xưng hô, kính ngữ trước khi áp dụng vào các văn cảnh trang trọng.'
                : 'For best results, keep the subject clear, avoid idioms when you can, and double-check names, honorifics, and slang before reusing the output in something important.'}
            </p>
          </div>
        </section>

        {/* Section 2: Examples Table */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='flex items-center gap-2 text-xl font-bold text-(--main-color)'>
            <Languages className='h-5 w-5 text-(--main-color)' />
            {isVi
              ? 'Bảng câu mẫu thông dụng (Anh → Nhật)'
              : 'Example phrases (English to Japanese)'}
          </h2>
          <p className='mt-1 text-xs text-(--secondary-color) sm:text-sm'>
            {isVi
              ? 'Một số mẫu câu giao tiếp phổ biến giúp bạn làm quen với cấu trúc câu và cách phát âm Romaji:'
              : 'Common conversational phrases to help you understand sentence structure and romaji pronunciation:'}
          </p>
          <div className='mt-4 overflow-x-auto rounded-xl border border-(--border-color)'>
            <table className='w-full text-left text-sm'>
              <thead>
                <tr className='border-b border-(--border-color) bg-(--main-color)/5 font-semibold text-(--main-color)'>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Tiếng Anh & Tiếng Việt' : 'English'}
                  </th>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Tiếng Nhật (Kanji / Kana)' : 'Japanese'}
                  </th>
                  <th className='px-3.5 py-2.5'>
                    {isVi ? 'Phiên âm Romaji' : 'Romaji'}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-(--border-color)/60 text-(--secondary-color)'>
                {examples.map(row => (
                  <tr
                    key={row.en}
                    className='transition-colors hover:bg-(--main-color)/5'
                  >
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
                    <td className='px-3.5 py-2.5 text-base font-medium text-(--main-color)'>
                      {row.ja}
                    </td>
                    <td className='px-3.5 py-2.5 text-sm text-(--secondary-color) italic'>
                      {row.romaji}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Tips */}
        <section className='mt-8 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 sm:p-6'>
          <h2 className='flex items-center gap-2 text-xl font-bold text-(--main-color)'>
            <Lightbulb className='h-5 w-5 text-amber-500' />
            {isVi
              ? 'Mẹo dịch để có kết quả tiếng Nhật chuẩn xác hơn'
              : 'Translation tips for better Japanese output'}
          </h2>
          <ul className='mt-4 space-y-3 text-sm text-(--secondary-color) sm:text-base'>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Ưu tiên câu tiếng Anh ngắn gọn, trực diện thay vì đoạn văn dài chứa nhiều ý phức tạp.'
                  : 'Prefer short, direct English over long paragraphs with mixed ideas.'}
              </span>
            </li>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Thay thế các đại từ mơ hồ như "it" hoặc "that" bằng danh từ cụ thể bất cứ khi nào có thể.'
                  : 'Replace vague words like "it" or "that" with the actual noun when possible.'}
              </span>
            </li>
            <li className='flex items-start gap-2.5'>
              <span className='mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--main-color)' />
              <span>
                {isVi
                  ? 'Xem xét kỹ cả chữ viết tiếng Nhật (Kanji/Kana) thay vì chỉ phụ thuộc vào Romaji trước khi sao chép và sử dụng.'
                  : 'Review the Japanese script, not just the romaji, before you copy the result.'}
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
            href='/translate/japanese-to-english'
            className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2.5 text-sm font-medium text-(--main-color) shadow-xs transition-colors hover:bg-(--main-color)/5'
          >
            {isVi ? 'Dịch Nhật → Anh' : 'Japanese to English'}
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
