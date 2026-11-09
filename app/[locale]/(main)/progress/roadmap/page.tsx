import Link from 'next/link';
import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
import { Breadcrumbs } from '@/shared/ui-composite/Breadcrumbs';
import {
  Map,
  Compass,
  Trophy,
  Target,
  Flag,
  ArrowRight,
  Star,
  CheckCircle2,
  Clock,
  BookOpen,
  Mic,
  FileCheck,
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
      ? 'Lộ trình học tiếng Nhật cá nhân hóa | Mondu'
      : 'Personalized Japanese Roadmap | Mondu',
    description: isVi
      ? 'Kế hoạch học tập tiếng Nhật cá nhân hóa từ số 0 đến JLPT N1 cùng Mondu.'
      : 'Personalized Japanese learning roadmap from beginner to JLPT N1 with Mondu.',
  };
}

const ROADMAP_STEPS = [
  {
    step: 1,
    titleVi: 'Khởi đầu: Bảng chữ cái Kana',
    titleEn: 'Step 1: Kana Foundations',
    descVi:
      'Làm quen và thuần thục Hiragana, Katakana, quy tắc biến âm, âm ghép và trường âm.',
    descEn:
      'Master Hiragana and Katakana alphabets with audio pronunciation and drawing drills.',
    durationVi: '1 - 2 tuần',
    durationEn: '1 - 2 weeks',
    href: '/kana',
    icon: Star,
    color:
      'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400',
    tags: ['Hiragana', 'Katakana', 'Dakuten'],
  },
  {
    step: 2,
    titleVi: 'Nền tảng: Chữ Hán & Bộ thủ cơ bản',
    titleEn: 'Step 2: Essential Kanji & Radicals',
    descVi:
      'Nhớ mặt chữ Kanji qua 214 bộ thủ, âm Hán Việt, cách nhớ bằng mẹo hình ảnh và tập viết nét.',
    descEn:
      'Learn core Kanji radicals, stroke order, and Han-Viet mnemonics for solid recall.',
    durationVi: '3 - 4 tuần',
    durationEn: '3 - 4 weeks',
    href: '/kanji',
    icon: Compass,
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400',
    tags: ['214 Bộ thủ', 'Kanji N5-N4', 'Thứ tự nét'],
  },
  {
    step: 3,
    titleVi: 'Mở rộng: Từ vựng theo cấp độ JLPT',
    titleEn: 'Step 3: Vocabulary by JLPT Level',
    descVi:
      'Học từ vựng chia theo Set 10 từ có thẻ flashcard, ví dụ thực tế và tra cứu từ vựng trực quan.',
    descEn:
      'Study JLPT words arranged in bite-sized sets with meaning, examples, and recall drills.',
    durationVi: 'Hàng ngày',
    durationEn: 'Daily',
    href: '/vocabulary',
    icon: BookOpen,
    color:
      'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400',
    tags: ['JLPT N5-N1', 'Set 10 từ', 'Flashcard'],
  },
  {
    step: 4,
    titleVi: 'Cốt lõi: Ngữ pháp ứng dụng',
    titleEn: 'Step 4: Applied Grammar',
    descVi:
      'Nắm chắc các cấu trúc câu, trợ từ và ngữ pháp ứng dụng từ sơ cấp N5 đến cao cấp N1.',
    descEn:
      'Understand sentence structure, essential particles, and practical grammar patterns.',
    durationVi: 'Hàng tuần',
    durationEn: 'Weekly',
    href: '/grammar',
    icon: Target,
    color: 'from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400',
    tags: ['Mẫu câu', 'Trợ từ', 'Hội thoại'],
  },
  {
    step: 5,
    titleVi: 'Phản xạ: Luyện phát âm & Shadowing',
    titleEn: 'Step 5: Shadowing & Kaiwa Reflexes',
    descVi:
      'Luyện nghe nói phản xạ qua các đoạn hội thoại thực tế, cải thiện ngữ điệu và phát âm chuẩn.',
    descEn:
      'Shadow native dialogues to build natural speaking rhythm and confident conversation.',
    durationVi: '15 phút/ngày',
    durationEn: '15 mins/day',
    href: '/shadowing',
    icon: Mic,
    color:
      'from-purple-500/20 to-violet-500/20 text-purple-600 dark:text-purple-400',
    tags: ['Shadowing', 'Kaiwa', 'Ngữ điệu'],
  },
  {
    step: 6,
    titleVi: 'Đột phá: Cày đề & Thi thử JLPT',
    titleEn: 'Step 6: JLPT Exam Practice',
    descVi:
      'Làm bài kiểm tra trắc nghiệm theo cụm ngữ pháp và luyện các dạng đề chuẩn định dạng JLPT.',
    descEn:
      'Timed quiz drills and exam-style test simulations with instant scoring and explanations.',
    durationVi: 'Giai đoạn ôn thi',
    durationEn: 'Exam prep',
    href: '/exercises',
    icon: FileCheck,
    color: 'from-cyan-500/20 to-sky-500/20 text-cyan-600 dark:text-cyan-400',
    tags: ['Trắc nghiệm', 'Đề thi JLPT', 'Bấm giờ'],
  },
];

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isVi = locale === 'vi';

  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6'>
      <Breadcrumbs
        items={[
          { name: isVi ? 'Trang chủ' : 'Home', url: '/' },
          {
            name: isVi ? 'Tiến trình' : 'Progress',
            url: '/progress',
          },
          {
            name: isVi ? 'Lộ trình cá nhân hóa' : 'Personal Roadmap',
            url: '/progress/roadmap',
          },
        ]}
      />

      {/* Header Banner */}
      <div className='relative overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm sm:p-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex size-14 shrink-0 items-center justify-center rounded-2xl border-b-4 border-(--main-color-accent) bg-(--main-color) text-(--background-color) shadow-md'>
              <Map className='size-7' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <h1 className='text-2xl font-black text-(--main-color) sm:text-3xl'>
                  {isVi ? 'Lộ Trình Cá Nhân Hóa' : 'Personal Learning Roadmap'}
                </h1>
                <span className='inline-flex items-center gap-1 rounded-full bg-(--main-color)/15 px-3 py-0.5 text-xs font-bold text-(--main-color)'>
                  <Trophy className='size-3' />
                  {isVi ? 'Chinh phục tiếng Nhật' : 'Japanese Mastery'}
                </span>
              </div>
              <p className='mt-1 text-sm text-(--secondary-color)'>
                {isVi
                  ? 'Kế hoạch học tập tuần tự từng bước từ bảng chữ cái đến tự tin thi đỗ JLPT.'
                  : 'Structured milestone progression from zero to confident JLPT proficiency.'}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--background-color)/80 px-4 py-2.5 text-xs font-semibold text-(--secondary-color)'>
            <Flag className='size-4 text-(--main-color)' />
            <span>{isVi ? '6 Giai đoạn trọng tâm' : '6 Core Milestones'}</span>
          </div>
        </div>
      </div>

      {/* Roadmap Timeline Grid */}
      <div className='relative space-y-6 before:absolute before:top-4 before:bottom-4 before:left-7 before:hidden before:w-0.5 before:bg-(--border-color) sm:before:block'>
        {ROADMAP_STEPS.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className='relative flex flex-col gap-4 rounded-3xl border border-(--border-color) bg-(--card-color) p-5 shadow-sm transition-all hover:border-(--main-color)/50 sm:flex-row sm:items-center sm:gap-6 sm:p-6'
            >
              {/* Step indicator circle */}
              <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border-color) bg-(--background-color) font-black text-(--main-color) sm:size-14'>
                <Icon className='size-6' />
              </div>

              {/* Main Content */}
              <div className='min-w-0 flex-1 space-y-2'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='rounded-md bg-(--main-color)/10 px-2 py-0.5 text-xs font-bold text-(--main-color)'>
                    {isVi ? `Giai đoạn ${item.step}` : `Phase ${item.step}`}
                  </span>
                  <div className='flex items-center gap-1 text-xs text-(--secondary-color)'>
                    <Clock className='size-3' />
                    <span>{isVi ? item.durationVi : item.durationEn}</span>
                  </div>
                </div>

                <h2 className='text-lg font-bold text-(--foreground-color) sm:text-xl'>
                  {isVi ? item.titleVi : item.titleEn}
                </h2>
                <p className='text-xs leading-relaxed text-(--secondary-color) sm:text-sm'>
                  {isVi ? item.descVi : item.descEn}
                </p>

                {/* Tags */}
                <div className='flex flex-wrap items-center gap-1.5 pt-1'>
                  {item.tags.map(tag => (
                    <span
                      key={tag}
                      className='inline-flex items-center gap-1 rounded-lg border border-(--border-color)/60 bg-(--background-color) px-2 py-0.5 text-[11px] font-medium text-(--secondary-color)'
                    >
                      <CheckCircle2 className='size-2.5 text-(--main-color)' />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className='shrink-0 pt-2 sm:pt-0'>
                <Link
                  href={item.href}
                  className='inline-flex w-full items-center justify-center gap-2 rounded-2xl border-b-3 border-(--main-color-accent) bg-(--main-color) px-5 py-2.5 text-xs font-bold text-(--background-color) shadow-sm transition-transform hover:opacity-95 active:translate-y-0.5 sm:w-auto'
                >
                  <span>{isVi ? 'Học ngay' : 'Start now'}</span>
                  <ArrowRight className='size-3.5' />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
