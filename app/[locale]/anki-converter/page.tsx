import { ConverterInterface } from '@/features/AnkiConverter/components/ConverterInterface';
import { routing } from '@/core/i18n/routing';
import { FAQSchema, type FAQItem } from '@/shared/ui-composite/SEO/FAQSchema';
import {
  HowToSchema,
  type HowToStep,
} from '@/shared/ui-composite/SEO/HowToSchema';
import Script from 'next/script';
import type { Metadata } from 'next';
import Link from 'next/link';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

const BASE_URL = 'https://www.pthamnihongo.site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi' || !locale;
  const ogLocale =
    locale === 'es' ? 'es_ES' : locale === 'vi' ? 'vi_VN' : 'en_US';

  const title = isVi
    ? 'Chuyển đổi Anki sang JSON | Công cụ chuyển file APKG miễn phí | PThamSS'
    : 'Anki to JSON Converter | Free APKG Converter | PThamSS';
  const description = isVi
    ? 'Chuyển đổi bộ thẻ flashcard Anki sang định dạng JSON ngay lập tức. Hỗ trợ file APKG, TSV, SQLite và COLPKG. Miễn phí, siêu tốc và bảo mật 100% trong trình duyệt.'
    : 'Convert Anki flashcard decks to JSON format instantly. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private - all processing happens in your browser.';

  return {
    title,
    description,
    keywords: isVi
      ? [
          'chuyen anki sang json',
          'chuyen file apkg sang json',
          'cong cu anki converter',
          'doc file anki',
          'xuat the anki sang json',
          'anki sang json mien phi',
          'anki to json',
          'convert anki deck',
          'apkg to json',
          'anki deck converter',
        ]
      : [
          'anki converter',
          'anki to json',
          'convert anki deck',
          'apkg to json',
          'anki deck converter',
          'anki export json',
          'anki flashcards json',
          'convert apkg file',
          'anki database converter',
          'free anki converter online',
          'anki apkg to json converter',
          'export anki cards to json',
          'anki tsv converter',
          'anki sqlite converter',
          'colpkg to json',
        ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/anki-converter`,
      siteName: 'PThamSS',
      locale: ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/anki-converter`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// FAQ data for Vietnamese
const faqItemsVi: FAQItem[] = [
  {
    question:
      'Dữ liệu của tôi có an toàn khi sử dụng công cụ chuyển đổi Anki này không?',
    answer:
      'Hoàn toàn an toàn! Toàn bộ quá trình chuyển đổi diễn ra trực tiếp trên trình duyệt của bạn bằng Web Worker. Tệp không bao giờ rời khỏi máy tính và không có dữ liệu nào bị gửi lên bất kỳ máy chủ nào.',
  },
  {
    question: 'Hình ảnh và âm thanh trong bộ thẻ Anki sẽ được xử lý ra sao?',
    answer:
      'Các tệp đa phương tiện (hình ảnh, âm thanh, video) không được đưa vào tệp JSON đầu ra. Trình chuyển đổi chỉ trích xuất nội dung văn bản thuần túy, loại bỏ các thẻ media nhưng vẫn giữ nguyên vẹn nội dung chữ xung quanh.',
  },
  {
    question: 'Tôi có thể chuyển đổi bộ thẻ Anki dung lượng lớn không?',
    answer:
      'Có! Trình chuyển đổi có thể xử lý các bộ thẻ chứa hàng chục nghìn thẻ. Phiên bản trình duyệt hỗ trợ tệp lên đến 500MB.',
  },
  {
    question: 'Cấu trúc tệp JSON đầu ra trông như thế nào?',
    answer:
      'Dữ liệu JSON đầu ra được chuẩn hóa theo loại thẻ: thẻ cơ bản (Basic) có 2 mặt front/back, thẻ điền từ (Cloze) giữ các biến thể cloze, và các loại thẻ tùy chỉnh giữ nguyên toàn bộ tên trường và giá trị. Tệp cũng bao gồm metadata (tổng số thẻ, thẻ tag, cấu trúc cây thư mục).',
  },
  {
    question: 'Công cụ hỗ trợ những định dạng tệp Anki nào?',
    answer:
      'Công cụ hỗ trợ tất cả các định dạng Anki phổ biến: APKG (Gói Anki), COLPKG (Bộ sưu tập), ANKI2 (Cơ sở dữ liệu Anki), TSV (Giá trị phân tách bằng Tab), và các tệp cơ sở dữ liệu SQLite (.db, .sqlite).',
  },
  {
    question:
      'Tôi có thể dùng tệp JSON đã chuyển đổi cho các ứng dụng khác không?',
    answer:
      'Chắc chắn rồi! Định dạng JSON là tiêu chuẩn mở, bạn có thể dễ dàng nhập vào tính năng Thamlet trên web PThamSS, các ứng dụng học tập khác, phân tích dữ liệu hoặc sao lưu lưu trữ.',
  },
  {
    question: 'Có phiên bản dòng lệnh (CLI) không?',
    answer:
      'Có! Dành cho lập trình viên cần tự động hóa hàng loạt, bạn có thể chạy lệnh: "npm run anki:convert -- --input deck.apkg --output deck.json" trong mã nguồn dự án.',
  },
  {
    question:
      'Công cụ có giữ nguyên cấu trúc thư mục con (deck hierarchy) không?',
    answer:
      'Có, cấu trúc phân cấp bộ thẻ lồng nhau (sử dụng dấu :: trong Anki) sẽ được giữ nguyên vẹn trong tệp JSON đầu ra.',
  },
];

const faqItemsEn: FAQItem[] = [
  {
    question: 'Is my data safe when using the Anki Converter?',
    answer:
      'Yes! All conversion happens locally in your browser using Web Workers. Your files never leave your device, and no data is sent to any server. This ensures complete privacy and security for your flashcard content.',
  },
  {
    question: 'What happens to images and audio in my Anki deck?',
    answer:
      'Media files (images, audio, video) are not included in the JSON output. The converter extracts only text content, removing all media references while preserving the surrounding text. This keeps the output clean and focused on the textual data.',
  },
  {
    question: 'Can I convert large Anki decks?',
    answer:
      'Yes! The converter can handle decks with thousands of cards. For very large decks (100,000+ cards), we recommend using the command-line tool for better performance. The browser version supports files up to 500MB.',
  },
  {
    question: 'What JSON structure is produced?',
    answer:
      'The output is intelligently structured based on your deck type. Basic cards have front/back fields, cloze cards include all cloze variations, and custom note types preserve all field names and values. The JSON also includes metadata like card counts, tags, and deck hierarchy.',
  },
  {
    question: 'What Anki file formats are supported?',
    answer:
      'The converter supports all major Anki formats: APKG (Anki Package), COLPKG (Collection Package), ANKI2 (Anki Database), TSV (Tab-Separated Values), and SQLite database files (.db, .sqlite).',
  },
  {
    question: 'Can I use the converted JSON in other applications?',
    answer:
      'Absolutely! The JSON output is standard and can be used in any application that reads JSON. Common uses include building custom study apps, importing into other flashcard systems, data analysis, and creating backups in a portable format.',
  },
  {
    question: 'Is there a command-line version?',
    answer:
      'Yes! For developers and power users, we provide a CLI tool that can be run with npm. Use "npm run anki:convert -- --input deck.apkg --output deck.json" to convert files from the command line. This is ideal for batch processing and automation.',
  },
  {
    question: 'Does the converter preserve deck hierarchy?',
    answer:
      'Yes, the converter preserves nested deck structures. If your Anki collection has parent and child decks (using the :: separator), the JSON output will maintain this hierarchy with subdecks nested appropriately.',
  },
];

// How-to steps for Vietnamese
const howToStepsVi: HowToStep[] = [
  {
    name: 'Xuất bộ thẻ từ phần mềm Anki',
    text: 'Mở Anki trên máy tính, chọn bộ thẻ bạn muốn chuyển đổi, vào Tệp (File) → Xuất (Export), và lưu dưới định dạng .apkg hoặc .colpkg.',
  },
  {
    name: 'Tải tệp lên trình chuyển đổi',
    text: 'Kéo và thả tệp Anki đã xuất vào khung bên trên, hoặc bấm để chọn tệp từ máy tính của bạn.',
  },
  {
    name: 'Đợi chuyển đổi',
    text: 'Trình chuyển đổi sẽ xử lý tệp trực tiếp trong trình duyệt của bạn với thanh tiến trình hiển thị rõ ràng.',
  },
  {
    name: 'Tải xuống tệp JSON',
    text: 'Khi chuyển đổi hoàn tất, bấm nút Tải xuống JSON để lưu bộ thẻ đã chuyển đổi về máy.',
  },
];

const howToStepsEn: HowToStep[] = [
  {
    name: 'Export your Anki deck',
    text: 'Open Anki on your computer, select the deck you want to convert, go to File → Export, and save as .apkg or .colpkg format.',
  },
  {
    name: 'Upload the file',
    text: 'Drag and drop your exported Anki file into the converter drop zone above, or click to select the file from your computer.',
  },
  {
    name: 'Wait for conversion',
    text: 'The converter will process your file locally in your browser. You will see a progress indicator showing the conversion status.',
  },
  {
    name: 'Download your JSON',
    text: 'Once conversion is complete, click the Download JSON button to save your converted deck. The file will be named after your original deck.',
  },
];

// WebApplication structured data
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Anki Deck to JSON Converter',
  alternateName: 'Anki Converter',
  url: `${BASE_URL}/anki-converter`,
  applicationCategory: 'UtilityApplication',
  applicationSubCategory: 'File Converter',
  operatingSystem: 'Any',
  browserRequirements:
    'Requires JavaScript. Works with Chrome, Firefox, Safari, Edge.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  description:
    'Convert Anki flashcard decks to JSON format. Supports APKG, TSV, SQLite, and COLPKG files. Free, fast, and completely private.',
  featureList: [
    'APKG file conversion',
    'TSV file conversion',
    'SQLite database conversion',
    'COLPKG file conversion',
    'Cloze deletion support',
    'Custom note type support',
    'Deck hierarchy preservation',
    'Tag preservation',
    'Local processing (100% private)',
    'No file size limits for CLI',
    'Command-line interface available',
  ],
  author: {
    '@type': 'Organization',
    name: 'PThamSS',
    url: BASE_URL,
  },
  creator: {
    '@type': 'Organization',
    name: 'PThamSS',
  },
  isAccessibleForFree: true,
  inLanguage: ['vi', 'en', 'es'],
};

// SoftwareApplication schema for additional SEO
const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Anki to JSON CLI Converter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Windows, macOS, Linux',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description:
    'Command-line tool for converting Anki decks to JSON format. Ideal for batch processing and automation.',
  downloadUrl: 'https://github.com/tmondu/nihongoWeb',
  softwareVersion: '1.0.0',
  author: {
    '@type': 'Organization',
    name: 'PThamSS',
  },
};

export default async function AnkiConverterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isVi = locale === 'vi' || !locale;

  const faqItems = isVi ? faqItemsVi : faqItemsEn;
  const howToSteps = isVi ? howToStepsVi : howToStepsEn;

  return (
    <>
      {/* Structured Data */}
      <Script
        id='anki-converter-webapp-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
      <Script
        id='anki-converter-software-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <FAQSchema faqs={faqItems} />
      <HowToSchema
        name={
          isVi
            ? 'Cách chuyển đổi bộ thẻ Anki sang JSON'
            : 'How to Convert Anki Decks to JSON'
        }
        description={
          isVi
            ? 'Hướng dẫn từng bước chuyển đổi bộ thẻ flashcard Anki sang định dạng JSON bằng công cụ trực tuyến miễn phí.'
            : 'Step-by-step guide to convert your Anki flashcard decks to JSON format using the free online converter.'
        }
        totalTime='PT2M'
        estimatedCost='0'
        steps={howToSteps}
      />

      <article className='mx-auto max-w-7xl px-4 py-8'>
        {/* Main Heading */}
        <header className='mb-8 text-center'>
          <h1 className='mb-4 text-4xl font-bold text-(--main-color)'>
            {isVi
              ? 'Công cụ chuyển đổi Anki sang JSON'
              : 'Anki to JSON Converter'}
          </h1>
          <p className='mx-auto max-w-2xl text-lg text-(--secondary-color)'>
            {isVi
              ? 'Chuyển đổi bộ thẻ flashcard Anki của bạn sang định dạng JSON chuẩn hóa, gọn gàng. Hoàn toàn miễn phí, siêu tốc và bảo mật tuyệt đối — 100% xử lý ngay trên trình duyệt.'
              : 'Convert your Anki flashcard decks to clean, structured JSON format. Free, fast, and completely private — all processing happens in your browser.'}
          </p>
        </header>

        {/* Converter Tool */}
        <section aria-label='Anki Converter Tool' className='mb-12'>
          <ConverterInterface locale={locale} />
        </section>

        {/* Content sections for SEO */}
        <div className='mt-12 space-y-10 text-(--secondary-color)'>
          {/* Supported Formats Section */}
          <section aria-labelledby='supported-formats-heading'>
            <h2
              id='supported-formats-heading'
              className='mb-4 text-2xl font-semibold text-(--main-color)'
            >
              {isVi
                ? 'Các định dạng Anki được hỗ trợ'
                : 'Supported Anki Formats'}
            </h2>
            <p className='mb-4'>
              {isVi
                ? 'Công cụ của chúng tôi hỗ trợ tất cả các định dạng tệp Anki phổ biến, giúp bạn dễ dàng chuyển đổi bất kỳ bộ thẻ nào:'
                : 'Our converter supports all major Anki file formats, making it easy to convert any deck regardless of how it was exported:'}
            </p>
            <ul className='space-y-3'>
              <li>
                <strong className='text-(--main-color)'>
                  {isVi ? 'Tệp APKG (.apkg)' : 'APKG files (.apkg)'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Định dạng gói Anki tiêu chuẩn chứa dữ liệu thẻ, loại ghi chú và siêu dữ liệu (metadata). Đây là định dạng xuất phổ biến nhất từ Anki Desktop và AnkiWeb.'
                  : 'The standard Anki package format containing deck data, note types, and metadata. This is the most common export format from Anki desktop and AnkiWeb.'}
              </li>
              <li>
                <strong className='text-(--main-color)'>
                  {isVi ? 'Tệp TSV (.tsv)' : 'TSV files (.tsv)'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Định dạng giá trị phân tách bằng tab để nhập và xuất thẻ đơn giản. Rất hữu ích cho các bộ thẻ được tạo từ bảng tính Excel hoặc tệp văn bản.'
                  : 'Tab-separated values format for simple deck imports and exports. Useful for decks created from spreadsheets or text files.'}
              </li>
              <li>
                <strong className='text-(--main-color)'>
                  {isVi
                    ? 'Cơ sở dữ liệu SQLite (.db, .sqlite, .anki2)'
                    : 'SQLite databases (.db, .sqlite, .anki2)'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Các tệp cơ sở dữ liệu Anki trực tiếp chứa toàn bộ thông tin bộ thẻ. Nằm trong thư mục hồ sơ (profile) Anki của bạn.'
                  : 'Direct Anki database files containing all deck information. Found in your Anki profile folder.'}
              </li>
              <li>
                <strong className='text-(--main-color)'>
                  {isVi ? 'Tệp COLPKG (.colpkg)' : 'COLPKG files (.colpkg)'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Gói bộ sưu tập bao gồm toàn bộ thư viện Anki của bạn với nhiều bộ thẻ, cài đặt và cấu hình.'
                  : 'Collection packages that include your entire Anki collection with multiple decks, settings, and configurations.'}
              </li>
            </ul>
          </section>

          {/* How to Convert Section */}
          <section aria-labelledby='how-to-convert-heading'>
            <h2
              id='how-to-convert-heading'
              className='mb-4 text-2xl font-semibold text-(--main-color)'
            >
              {isVi
                ? 'Cách chuyển đổi bộ thẻ Anki sang JSON'
                : 'How to Convert Anki Decks to JSON'}
            </h2>
            <ol className='list-decimal space-y-3 pl-6'>
              <li>
                <strong>
                  {isVi ? 'Xuất bộ thẻ từ Anki' : 'Export your deck from Anki'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Mở Anki, chọn bộ thẻ bạn cần chuyển đổi, vào Tệp (File) → Xuất (Export) và lưu dưới dạng .apkg hoặc .colpkg.'
                  : 'Open Anki, select your deck, go to File → Export, and save as .apkg or .colpkg format.'}
              </li>
              <li>
                <strong>{isVi ? 'Tải tệp lên' : 'Upload the file'}</strong> —{' '}
                {isVi
                  ? 'Kéo và thả tệp của bạn vào khung bên trên, hoặc bấm để chọn tệp từ máy tính.'
                  : 'Drag and drop your file into the converter above, or click to select it from your computer.'}
              </li>
              <li>
                <strong>
                  {isVi ? 'Đợi chuyển đổi' : 'Wait for conversion'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Công cụ sẽ xử lý tệp trực tiếp trong trình duyệt của bạn. Bộ thẻ lớn chỉ mất vài giây.'
                  : 'The converter processes your file locally. Large decks may take a few seconds.'}
              </li>
              <li>
                <strong>
                  {isVi ? 'Tải xuống tệp JSON' : 'Download your JSON'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Bấm nút tải xuống để lưu bộ thẻ đã chuyển đổi dưới dạng tệp JSON.'
                  : 'Click the download button to save your converted deck as a JSON file.'}
              </li>
            </ol>
          </section>

          {/* Features Section */}
          <section aria-labelledby='features-heading'>
            <h2
              id='features-heading'
              className='mb-4 text-2xl font-semibold text-(--main-color)'
            >
              {isVi ? 'Tính năng nổi bật' : 'Features'}
            </h2>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4'>
                <h3 className='mb-2 font-semibold text-(--main-color)'>
                  {isVi ? '🔒 100% Riêng tư & Bảo mật' : '🔒 100% Private'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Mọi quá trình chuyển đổi diễn ra trực tiếp trong trình duyệt của bạn. Tệp không bao giờ rời khỏi thiết bị — không có dữ liệu nào được gửi lên máy chủ.'
                    : 'All conversion happens locally in your browser. Your files never leave your device — no data is sent to any server.'}
                </p>
              </div>
              <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4'>
                <h3 className='mb-2 font-semibold text-(--main-color)'>
                  {isVi ? '⚡ Chuyển đổi siêu tốc' : '⚡ Fast Conversion'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Chuyển đổi bộ thẻ hàng nghìn thẻ chỉ trong vài giây. Công nghệ Web Worker giúp giao diện luôn mượt mà trong khi xử lý.'
                    : 'Convert decks with thousands of cards in seconds. Web Workers ensure the UI stays responsive during processing.'}
                </p>
              </div>
              <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4'>
                <h3 className='mb-2 font-semibold text-(--main-color)'>
                  {isVi
                    ? '📁 Hỗ trợ tất cả định dạng'
                    : '📁 All Formats Supported'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Hỗ trợ các tệp APKG, TSV, SQLite, COLPKG và ANKI2. Dễ dàng chuyển đổi bất kỳ bộ thẻ Anki nào.'
                    : 'Supports APKG, TSV, SQLite, COLPKG, and ANKI2 files. Convert any Anki deck regardless of export format.'}
                </p>
              </div>
              <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4'>
                <h3 className='mb-2 font-semibold text-(--main-color)'>
                  {isVi ? '🎯 Trích xuất thông minh' : '🎯 Smart Output'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Định dạng JSON được tối ưu hóa cho từng loại thẻ: thẻ cơ bản (Basic), thẻ điền từ (Cloze) và loại ghi chú tùy chỉnh đều được xử lý chuẩn xác.'
                    : 'JSON output is optimized for each deck type. Basic, cloze, and custom note types are all handled intelligently.'}
                </p>
              </div>
              <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4'>
                <h3 className='mb-2 font-semibold text-(--main-color)'>
                  {isVi ? '🏷️ Giữ nguyên cấu trúc' : '🏷️ Preserves Structure'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Cấu trúc cây thư mục của bộ thẻ, thẻ tag, tên trường và các biến thể cloze đều được giữ nguyên vẹn trong tệp JSON đầu ra.'
                    : 'Deck hierarchy, tags, field names, and cloze deletions are all preserved in the JSON output.'}
                </p>
              </div>
              <div className='rounded-lg border border-(--border-color) bg-(--card-color) p-4'>
                <h3 className='mb-2 font-semibold text-(--main-color)'>
                  {isVi ? '💻 Hỗ trợ dòng lệnh CLI' : '💻 CLI Available'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Công cụ dòng lệnh dành cho lập trình viên. Hoàn hảo để xử lý hàng loạt tự động và xử lý các tệp dữ liệu cực lớn.'
                    : 'Command-line tool for developers. Perfect for batch processing, automation, and handling very large files.'}
                </p>
              </div>
            </div>
          </section>

          {/* Why Convert Section */}
          <section aria-labelledby='why-convert-heading'>
            <h2
              id='why-convert-heading'
              className='mb-4 text-2xl font-semibold text-(--main-color)'
            >
              {isVi
                ? 'Tại sao nên chuyển đổi bộ thẻ Anki sang JSON?'
                : 'Why Convert Anki Decks to JSON?'}
            </h2>
            <p className='mb-4'>
              {isVi
                ? 'Việc chuyển đổi các bộ thẻ Anki sang định dạng JSON mở ra nhiều tiềm năng hữu ích cho việc học tập:'
                : 'Converting Anki decks to JSON format opens up many possibilities for working with your flashcard data:'}
            </p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>
                <strong>
                  {isVi
                    ? 'Nhập vào Thamlet / Flashcards'
                    : 'Build custom applications'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Dễ dàng nhập kho từ vựng khổng lồ từ Anki vào tính năng học thẻ ghi nhớ Thamlet trên PThamSS để ôn tập tiện lợi.'
                  : 'Integrate flashcard data into your own websites, apps, or learning tools.'}
              </li>
              <li>
                <strong>
                  {isVi ? 'Xây dựng ứng dụng riêng' : 'Data analysis'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Tích hợp dữ liệu thẻ ghi nhớ vào trang web, ứng dụng di động hoặc công cụ học tập cá nhân của bạn.'
                  : 'Analyze deck content programmatically using Python, JavaScript, or any language that reads JSON.'}
              </li>
              <li>
                <strong>
                  {isVi
                    ? 'Phân tích dữ liệu từ vựng'
                    : 'Cross-platform compatibility'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Phân tích nội dung bộ thẻ bằng Python, JavaScript hoặc bất kỳ ngôn ngữ lập trình nào hỗ trợ JSON.'
                  : 'Use your Anki content in other flashcard systems or learning platforms.'}
              </li>
              <li>
                <strong>
                  {isVi ? 'Tương thích đa nền tảng' : 'Portable backups'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Sử dụng nội dung từ Anki trên các hệ thống học tập khác mà không bị phụ thuộc vào phần mềm Anki.'
                  : 'Create human-readable backups of your decks that can be easily inspected and modified.'}
              </li>
              <li>
                <strong>
                  {isVi
                    ? 'Bản sao lưu dễ đọc & chỉnh sửa'
                    : 'Content transformation'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Tạo bản sao lưu văn bản rõ ràng mà con người có thể mở ra đọc, kiểm tra và chỉnh sửa nhanh chóng.'
                  : 'Process and transform deck content with scripts for bulk editing or format conversion.'}
              </li>
              <li>
                <strong>
                  {isVi ? 'Tích hợp API và AI' : 'API integration'}
                </strong>{' '}
                —{' '}
                {isVi
                  ? 'Dễ dàng đưa dữ liệu thẻ ghi nhớ vào các API, cơ sở dữ liệu hoặc mô hình học máy AI.'
                  : 'Feed flashcard data into APIs, databases, or machine learning models.'}
              </li>
            </ul>
          </section>

          {/* Command Line Tool Section */}
          <section aria-labelledby='cli-heading'>
            <h2
              id='cli-heading'
              className='mb-4 text-2xl font-semibold text-(--main-color)'
            >
              {isVi ? 'Công cụ dòng lệnh (CLI)' : 'Command Line Tool'}
            </h2>
            <p className='mb-4'>
              {isVi
                ? 'Dành cho các nhà phát triển và người dùng nâng cao muốn tự động hóa xử lý hàng loạt:'
                : 'For developers and power users, we provide a command-line interface for batch processing and automation:'}
            </p>
            <div className='space-y-4'>
              <div>
                <h3 className='mb-2 font-medium text-(--main-color)'>
                  {isVi ? 'Cách dùng cơ bản' : 'Basic Usage'}
                </h3>
                <pre className='overflow-x-auto rounded-lg bg-(--card-color) p-4'>
                  <code className='text-sm text-(--text-color)'>
                    npm run anki:convert -- --input deck.apkg --output deck.json
                  </code>
                </pre>
              </div>
              <div>
                <h3 className='mb-2 font-medium text-(--main-color)'>
                  {isVi ? 'Ví dụ với các tùy chọn' : 'With Options'}
                </h3>
                <pre className='overflow-x-auto rounded-lg bg-(--card-color) p-4'>
                  <code className='text-sm text-(--text-color)'>
                    {`# Bao gồm số liệu thống kê và thẻ tạm ngưng
npm run anki:convert -- -i deck.apkg -o deck.json --include-stats --include-suspended

# Xem hướng dẫn trợ giúp
npm run anki:convert -- --help`}
                  </code>
                </pre>
              </div>
              <div>
                <h3 className='mb-2 font-medium text-(--main-color)'>
                  {isVi ? 'Các tham số CLI' : 'CLI Options'}
                </h3>
                <ul className='list-disc space-y-1 pl-6 text-sm'>
                  <li>
                    <code className='rounded bg-(--card-color) px-1'>
                      -i, --input
                    </code>{' '}
                    —{' '}
                    {isVi
                      ? 'Đường dẫn tệp đầu vào (bắt buộc)'
                      : 'Input file path (required)'}
                  </li>
                  <li>
                    <code className='rounded bg-(--card-color) px-1'>
                      -o, --output
                    </code>{' '}
                    —{' '}
                    {isVi
                      ? 'Đường dẫn tệp JSON đầu ra (bắt buộc)'
                      : 'Output file path (required)'}
                  </li>
                  <li>
                    <code className='rounded bg-(--card-color) px-1'>
                      --include-stats
                    </code>{' '}
                    —{' '}
                    {isVi
                      ? 'Bao gồm dữ liệu thống kê thẻ'
                      : 'Include card statistics in output'}
                  </li>
                  <li>
                    <code className='rounded bg-(--card-color) px-1'>
                      --include-suspended
                    </code>{' '}
                    —{' '}
                    {isVi
                      ? 'Bao gồm các thẻ đang bị tạm ngưng'
                      : 'Include suspended cards'}
                  </li>
                  <li>
                    <code className='rounded bg-(--card-color) px-1'>
                      -h, --help
                    </code>{' '}
                    —{' '}
                    {isVi
                      ? 'Hiển thị tài liệu trợ giúp'
                      : 'Show help documentation'}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section aria-labelledby='faq-heading'>
            <h2
              id='faq-heading'
              className='mb-6 text-2xl font-semibold text-(--main-color)'
            >
              {isVi ? 'Câu hỏi thường gặp' : 'Frequently Asked Questions'}
            </h2>
            <div className='space-y-6'>
              {faqItems.map((faq, index) => (
                <div
                  key={index}
                  className='border-b border-(--border-color) pb-4 last:border-0'
                >
                  <h3 className='mb-2 text-lg font-medium text-(--main-color)'>
                    {faq.question}
                  </h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Tools Section */}
          <section aria-labelledby='related-tools-heading'>
            <h2
              id='related-tools-heading'
              className='mb-4 text-2xl font-semibold text-(--main-color)'
            >
              {isVi
                ? 'Các công cụ học tiếng Nhật liên quan'
                : 'Related Japanese Learning Tools'}
            </h2>
            <p className='mb-4'>
              {isVi
                ? 'Khám phá thêm các công cụ hữu ích miễn phí trên PThamSS để nâng cao hiệu quả học tiếng Nhật:'
                : 'Explore more free tools on PThamSS to enhance your Japanese learning:'}
            </p>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <Link
                href='/translate/english-to-japanese'
                className='block rounded-lg border border-(--border-color) bg-(--card-color) p-4 transition-colors hover:border-(--main-color)'
              >
                <h3 className='mb-1 font-semibold text-(--main-color)'>
                  {isVi
                    ? 'Dịch tiếng Nhật đa năng'
                    : 'English → Japanese Translator'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Dịch câu, từ vựng tiếng Nhật kèm phát âm Romaji và phân tích nghĩa chi tiết.'
                    : 'Translate English to Japanese with romaji pronunciation support.'}
                </p>
              </Link>
              <Link
                href='/conjugate'
                className='block rounded-lg border border-(--border-color) bg-(--card-color) p-4 transition-colors hover:border-(--main-color)'
              >
                <h3 className='mb-1 font-semibold text-(--main-color)'>
                  {isVi ? 'Chia động từ tiếng Nhật' : 'Verb Conjugator'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Tra cứu và luyện tập tất cả các thể chia động từ tiếng Nhật ngay lập tức.'
                    : 'Get all Japanese verb conjugation forms instantly.'}
                </p>
              </Link>
              <Link
                href='/kana-chart'
                className='block rounded-lg border border-(--border-color) bg-(--card-color) p-4 transition-colors hover:border-(--main-color)'
              >
                <h3 className='mb-1 font-semibold text-(--main-color)'>
                  {isVi ? 'Bảng chữ cái Kana' : 'Kana Chart'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Bảng tra cứu Hiragana và Katakana đầy đủ kèm phát âm và thứ tự nét viết.'
                    : 'Complete Hiragana and Katakana reference chart.'}
                </p>
              </Link>
              <Link
                href='/kanji'
                className='block rounded-lg border border-(--border-color) bg-(--card-color) p-4 transition-colors hover:border-(--main-color)'
              >
                <h3 className='mb-1 font-semibold text-(--main-color)'>
                  {isVi ? 'Luyện chữ Hán (Kanji)' : 'Kanji Study'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Luyện tập hơn 2000 chữ Hán được phân loại theo cấp độ JLPT từ N5 đến N1.'
                    : 'Practice Kanji organized by JLPT levels from N5 to N1.'}
                </p>
              </Link>
              <Link
                href='/vocabulary'
                className='block rounded-lg border border-(--border-color) bg-(--card-color) p-4 transition-colors hover:border-(--main-color)'
              >
                <h3 className='mb-1 font-semibold text-(--main-color)'>
                  {isVi ? 'Kho từ vựng JLPT' : 'Vocabulary Builder'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Xây dựng vốn từ vựng tiếng Nhật với hàng nghìn từ được phân chia khoa học theo bài học.'
                    : 'Build your Japanese vocabulary with thousands of words by JLPT level.'}
                </p>
              </Link>
              <Link
                href='/resources'
                className='block rounded-lg border border-(--border-color) bg-(--card-color) p-4 transition-colors hover:border-(--main-color)'
              >
                <h3 className='mb-1 font-semibold text-(--main-color)'>
                  {isVi ? 'Tài nguyên học tập' : 'Learning Resources'}
                </h3>
                <p className='text-sm'>
                  {isVi
                    ? 'Khám phá các tài liệu, ứng dụng và giáo trình học tiếng Nhật chất lượng cao được tuyển chọn.'
                    : 'Discover curated Japanese learning resources, apps, and textbooks.'}
                </p>
              </Link>
            </div>
          </section>

          {/* Last Updated */}
          <footer className='border-t border-(--border-color) pt-6 text-center text-sm text-(--secondary-color)'>
            <p>
              {isVi
                ? 'Cập nhật lần cuối: 2025 • '
                : 'Last updated: January 2025 • '}
              <Link
                href='/privacy'
                className='ml-1 underline hover:text-(--main-color)'
              >
                {isVi ? 'Chính sách bảo mật' : 'Privacy Policy'}
              </Link>
            </p>
          </footer>
        </div>
      </article>
    </>
  );
}
