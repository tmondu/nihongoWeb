import type { Metadata } from 'next';
import TranslatorPage from '@/features/Translator/components/TranslatorPage';
import {
  buildTranslatorMetadata,
  buildTranslatorSchema,
  type TranslatorFaqEntry,
} from '@/features/Translator/lib/seo';
import { StructuredData } from '@/shared/ui-composite/SEO/StructuredData';

import { routing } from '@/core/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

interface TranslatePageProps {
  params: Promise<{ locale: string }>;
}

const metadataConfig = {
  pathname: '/translate',
  title: 'Japanese Translator | English ⇄ Japanese with Romaji | PThamSS',
  description:
    'Free Japanese translator for English to Japanese and Japanese to English text. Translate quickly, review romaji support, and jump into direction-specific pages for better context.',
  keywords: [
    'japanese translator',
    'english to japanese translator',
    'japanese to english translator',
    'japanese translator with romaji',
    'free japanese translator',
    'translate japanese text',
    'translate english to japanese online',
  ],
  schemaName: 'Japanese Translator with Romaji',
  breadcrumbName: 'Japanese Translator',
  includeSoftwareApplication: true,
};

const schemaFaqEntries: TranslatorFaqEntry[] = [
  {
    question: 'Is this Japanese translator free to use?',
    answer:
      'Yes. The translator is free to use and does not require registration.',
  },
  {
    question: 'What can I use this page for?',
    answer:
      'Use the main translator as a hub for quick two-way translation, then open the direction-specific pages when you need examples or more focused guidance.',
  },
  {
    question: 'What is the maximum text length per translation?',
    answer: 'You can translate up to 5,000 characters per request.',
  },
  {
    question: 'Are there usage limits?',
    answer:
      'Yes. Fair-use limits apply during high demand to keep the service stable.',
  },
];

export async function generateMetadata({
  params,
}: TranslatePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi';

  const localizedConfig = {
    ...metadataConfig,
    title: isVi
      ? 'Trình dịch tiếng Nhật | Dịch Anh/Việt ⇄ Nhật có Romaji | PThamSS'
      : metadataConfig.title,
    description: isVi
      ? 'Trình dịch tiếng Nhật trực tuyến miễn phí cho tiếng Anh/Việt sang tiếng Nhật và ngược lại. Dịch nhanh chóng, hỗ trợ phiên âm romaji và hướng dẫn học tập.'
      : metadataConfig.description,
    schemaName: isVi
      ? 'Trình dịch tiếng Nhật có Romaji'
      : metadataConfig.schemaName,
    breadcrumbName: isVi
      ? 'Trình dịch tiếng Nhật'
      : metadataConfig.breadcrumbName,
  };

  const localizedFaq = isVi
    ? [
        {
          question: 'Trình dịch tiếng Nhật này có miễn phí không?',
          answer:
            'Có. Trình dịch này hoàn toàn miễn phí và không yêu cầu đăng ký tài khoản.',
        },
        {
          question: 'Tôi có thể sử dụng trang này cho mục đích gì?',
          answer:
            'Sử dụng trình dịch chính để dịch nhanh hai chiều giữa tiếng Việt/Anh và tiếng Nhật.',
        },
        {
          question: 'Độ dài văn bản tối đa cho mỗi lần dịch là bao nhiêu?',
          answer: 'Bạn có thể dịch tối đa 5.000 ký tự cho mỗi yêu cầu.',
        },
        {
          question: 'Có giới hạn lượt sử dụng không?',
          answer:
            'Có. Giới hạn sử dụng hợp lý được áp dụng khi lưu lượng truy cập cao để giữ dịch vụ ổn định.',
        },
      ]
    : schemaFaqEntries;

  return buildTranslatorMetadata({
    ...localizedConfig,
    faq: localizedFaq,
  });
}

export default async function TranslatePage({ params }: TranslatePageProps) {
  const { locale } = await params;
  const isVi = locale === 'vi';

  const localizedConfig = {
    ...metadataConfig,
    title: isVi
      ? 'Trình dịch tiếng Nhật | Dịch Anh/Việt ⇄ Nhật có Romaji | PThamSS'
      : metadataConfig.title,
    description: isVi
      ? 'Trình dịch tiếng Nhật trực tuyến miễn phí cho tiếng Anh/Việt sang tiếng Nhật và ngược lại. Dịch nhanh chóng, hỗ trợ phiên âm romaji và hướng dẫn học tập.'
      : metadataConfig.description,
    schemaName: isVi
      ? 'Trình dịch tiếng Nhật có Romaji'
      : metadataConfig.schemaName,
    breadcrumbName: isVi
      ? 'Trình dịch tiếng Nhật'
      : metadataConfig.breadcrumbName,
  };

  const localizedFaq = isVi
    ? [
        {
          question: 'Trình dịch tiếng Nhật này có miễn phí không?',
          answer:
            'Có. Trình dịch này hoàn toàn miễn phí và không yêu cầu đăng ký tài khoản.',
        },
        {
          question: 'Tôi có thể sử dụng trang này cho mục đích gì?',
          answer:
            'Sử dụng trình dịch chính để dịch nhanh hai chiều giữa tiếng Việt/Anh và tiếng Nhật.',
        },
        {
          question: 'Độ dài văn bản tối đa cho mỗi lần dịch là bao nhiêu?',
          answer: 'Bạn có thể dịch tối đa 5.000 ký tự cho mỗi yêu cầu.',
        },
        {
          question: 'Có giới hạn lượt sử dụng không?',
          answer:
            'Không giới hạn. Hiện tại trình dịch được cung cấp miễn phí cho mọi người dùng.',
        },
      ]
    : schemaFaqEntries;

  return (
    <>
      <StructuredData
        data={buildTranslatorSchema({
          ...localizedConfig,
          faq: localizedFaq,
        })}
      />
      <main className='min-h-screen'>
        <a
          href='#translator'
          className='sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-(--main-color) focus:px-4 focus:py-2 focus:text-white'
        >
          Skip to translator
        </a>
        <article
          itemScope
          itemType='https://schema.org/SoftwareApplication'
          id='translator'
        >
          <meta
            itemProp='name'
            content={
              isVi
                ? 'Trình dịch tiếng Nhật PThamSS'
                : 'PThamSS Japanese Translator'
            }
          />
          <meta
            itemProp='applicationCategory'
            content='EducationalApplication'
          />
          <meta itemProp='operatingSystem' content='Any' />
          <meta
            itemProp='description'
            content={
              isVi
                ? 'Dịch tiếng Anh, tiếng Việt và tiếng Nhật với hỗ trợ romaji.'
                : 'Translate English and Japanese text with romaji support and learner-focused context.'
            }
          />
          <TranslatorPage locale={locale} />
          <section
            className='mx-auto mt-8 w-full max-w-6xl rounded-2xl border border-(--border-color) bg-(--card-color) p-4 sm:p-6'
            aria-labelledby='translate-quick-faq'
          >
            <h2
              id='translate-quick-faq'
              className='text-xl font-semibold text-(--main-color)'
            >
              {isVi ? 'Câu hỏi thường gặp' : 'Quick FAQ'}
            </h2>
            <div className='mt-4 space-y-4'>
              {localizedFaq.map(item => (
                <div key={item.question}>
                  <h3 className='font-medium text-(--main-color)'>
                    {item.question}
                  </h3>
                  <p className='text-sm text-(--secondary-color)'>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
