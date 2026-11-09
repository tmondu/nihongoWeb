import Link from 'next/link';
import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
import { Breadcrumbs } from '@/shared/ui-composite/Breadcrumbs';
import {
  BookOpen,
  ArrowRight,
  MessageCircle,
  GraduationCap,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi';

  return {
    title: isVi
      ? 'Tổng hợp Ngữ pháp Tiếng Nhật JLPT N5 - N1 | Mondu'
      : 'Japanese Grammar Guide JLPT N5 - N1 | Mondu',
    description: isVi
      ? 'Tra cứu và học ngữ pháp tiếng Nhật từ N5 đến N1 kèm mẫu câu hội thoại thực tế.'
      : 'Comprehensive Japanese grammar reference and practice from JLPT N5 to N1.',
  };
}

const GRAMMAR_LEVELS = [
  {
    level: 'n5',
    charIcon: 'N5',
    titleVi: 'Ngữ Pháp JLPT N5',
    titleEn: 'JLPT N5 Grammar',
    levelLabel: 'Sơ cấp 1',
    countVi: '~100 mẫu cấu trúc',
    countEn: '~100 patterns',
    descVi:
      'Cấu trúc cơ bản: trợ từ (は, が, を, に, で), các thể động từ (て, ない, た) và mẫu câu chào hỏi hàng ngày.',
    descEn:
      'Core sentence patterns, basic particles, polite forms, and fundamental verb conjugations.',
    examples: ['～は～です', '～てください', '～てもいいです', '～たいです'],
  },
  {
    level: 'n4',
    charIcon: 'N4',
    titleVi: 'Ngữ Pháp JLPT N4',
    titleEn: 'JLPT N4 Grammar',
    levelLabel: 'Sơ cấp 2',
    countVi: '~120 mẫu cấu trúc',
    countEn: '~120 patterns',
    descVi:
      'Ngữ pháp kết hợp: câu điều kiện (ば, たら, なら), thể bị động, thể sai khiến, kính ngữ và mẫu cho nhận.',
    descEn:
      'Conditionals, passive and causative forms, basic honorifics, and giving/receiving expressions.',
    examples: ['～たら / ～ば', '～られる', '～させる', '～てあげる / もらう'],
  },
  {
    level: 'n3',
    charIcon: 'N3',
    titleVi: 'Ngữ Pháp JLPT N3',
    titleEn: 'JLPT N3 Grammar',
    levelLabel: 'Trung cấp 1',
    countVi: '~140 mẫu cấu trúc',
    countEn: '~140 patterns',
    descVi:
      'Cầu nối trung cấp: diễn đạt suy đoán, ý định, nguyên nhân - hệ quả và các mẫu câu phức trong giao tiếp.',
    descEn:
      'Intermediate bridge grammar: expressions of intention, conjectures, nuances, and natural conjunctions.',
    examples: ['～わけがない', '～ようにする', '～わりに(は)', '～ことにする'],
  },
  {
    level: 'n2',
    charIcon: 'N2',
    titleVi: 'Ngữ Pháp JLPT N2',
    titleEn: 'JLPT N2 Grammar',
    levelLabel: 'Trung cấp 2',
    countVi: '~160 mẫu cấu trúc',
    countEn: '~160 patterns',
    descVi:
      'Ngữ pháp nâng cao: cấu trúc văn bản thương mại, xã luận báo chí, cách diễn đạt tinh tế trong đời sống và công việc.',
    descEn:
      'Upper-intermediate grammar: formal written expressions, business phrasing, and nuanced sentence connectors.',
    examples: [
      '～に違いない',
      '～どころではない',
      '～にかかわらず',
      '～ざるを得ない',
    ],
  },
  {
    level: 'n1',
    charIcon: 'N1',
    titleVi: 'Ngữ Pháp JLPT N1',
    titleEn: 'JLPT N1 Grammar',
    levelLabel: 'Cao cấp',
    countVi: '~180 mẫu cấu trúc',
    countEn: '~180 patterns',
    descVi:
      'Đỉnh cao tiếng Nhật: ngữ pháp cổ điển, diễn ngôn văn học, văn phong học thuật và các mẫu câu mang sắc thái mạnh.',
    descEn:
      'Advanced native grammar: formal written styles, literary conjunctions, and high-level abstract expressions.',
    examples: ['～であれ', '～ならではの', '～を皮切りに', '～まみれ'],
  },
  {
    level: 'kaiwa',
    icon: MessageCircle,
    titleVi: 'Hội Thoại Kaiwa Thực Tế',
    titleEn: 'Practical Kaiwa Dialogues',
    levelLabel: 'Giao tiếp',
    countVi: 'Đa dạng tình huống',
    countEn: 'Real-life situations',
    descVi:
      'Tổng hợp mẫu câu hội thoại đời sống, ứng xử nơi công sở, giao tiếp tự nhiên và cách nói tắt của người bản xứ.',
    descEn:
      'Casual conversation habits, workplace communication, slang, and native phrasing patterns.',
    examples: ['～ちゃう / ～じゃう', '～んじゃない？', '～ってば', '～っけ'],
  },
];

export default async function GrammarIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isVi = locale === 'vi';

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6'>
      <Breadcrumbs
        items={[
          { name: isVi ? 'Trang chủ' : 'Home', url: '/' },
          { name: isVi ? 'Ngữ pháp' : 'Grammar', url: '/grammar' },
        ]}
      />

      {/* Hero Banner */}
      <div className='relative overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl border-b-4 border-(--main-color-accent) bg-(--main-color) text-2xl font-black text-(--background-color) shadow-md'>
              文
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-black text-(--main-color) sm:text-3xl'>
                  {isVi ? 'Ngữ Pháp Tiếng Nhật' : 'Japanese Grammar Reference'}
                </h1>
                <span className='inline-flex items-center gap-1 rounded-full bg-(--main-color)/15 px-3 py-0.5 text-xs font-bold text-(--main-color)'>
                  <GraduationCap className='size-3.5' />
                  JLPT N5 - N1 & Kaiwa
                </span>
              </div>
              <p className='mt-1 text-sm text-(--secondary-color)'>
                {isVi
                  ? 'Hệ thống ngữ pháp phân cấp rõ ràng từ cơ bản đến nâng cao cùng ví dụ minh họa trực quan.'
                  : 'Structured grammar progression with clear explanations and real-life conversational examples.'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color)/80 px-4 py-2.5 text-xs font-semibold text-(--secondary-color)'>
            <Layers className='size-4 text-(--main-color)' />
            <span>{isVi ? '6 Cấp độ học tập' : '6 Learning Tiers'}</span>
          </div>
        </div>
      </div>

      {/* Levels Grid */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {GRAMMAR_LEVELS.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.level}
              href={`/grammar/${item.level}`}
              className='group flex flex-col justify-between rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-(--main-color) hover:shadow-lg'
            >
              <div className='space-y-4'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                  <span className='flex size-12 items-center justify-center rounded-2xl border-2 border-(--border-color) bg-(--background-color) text-lg font-black text-(--main-color) transition-colors group-hover:border-(--main-color)'>
                    {item.charIcon ? (
                      item.charIcon
                    ) : Icon ? (
                      <Icon className='size-6' />
                    ) : null}
                  </span>
                  <div className='flex flex-col items-end'>
                    <span className='rounded-full bg-(--main-color)/10 px-2.5 py-0.5 text-xs font-bold text-(--main-color)'>
                      {item.levelLabel}
                    </span>
                    <span className='mt-0.5 text-[11px] text-(--secondary-color)'>
                      {isVi ? item.countVi : item.countEn}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className='space-y-1.5'>
                  <h2 className='text-lg font-bold text-(--foreground-color) transition-colors group-hover:text-(--main-color) sm:text-xl'>
                    {isVi ? item.titleVi : item.titleEn}
                  </h2>
                  <p className='text-xs leading-relaxed text-(--secondary-color)'>
                    {isVi ? item.descVi : item.descEn}
                  </p>
                </div>

                {/* Sample Grammar Tags */}
                <div className='flex flex-wrap gap-1.5 pt-2'>
                  {item.examples.map(ex => (
                    <span
                      key={ex}
                      className='inline-flex items-center gap-1 rounded-md border border-(--border-color)/50 bg-(--background-color) px-2 py-0.5 text-[11px] font-medium text-(--secondary-color)'
                    >
                      <CheckCircle2 className='size-2.5 text-(--main-color)' />
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action */}
              <div className='mt-6 flex items-center justify-between border-t border-(--border-color)/60 pt-4 text-xs font-bold text-(--main-color)'>
                <span className='flex items-center gap-1'>
                  <BookOpen className='size-3.5' />
                  {isVi ? 'Xem danh sách bài học' : 'Explore patterns'}
                </span>
                <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
