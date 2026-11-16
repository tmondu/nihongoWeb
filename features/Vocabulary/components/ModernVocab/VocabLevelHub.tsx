'use client';

import { BookOpen, Mic, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { cn } from '@/shared/utils/utils';
import useVocabStudyStore from '../../store/useVocabStudyStore';
import { getLessons, LESSON_COUNT } from '../../data/lessonsN5';
import type { VocabLevel } from '../../types/study';

interface VocabLevelHubProps {
  level?: VocabLevel;
}

interface ModeCardProps {
  href: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  points: string[];
  progressLabel: string;
  done: number;
  total: number;
  cta: string;
}

function ModeCard({
  href,
  icon: Icon,
  tag,
  title,
  description,
  points,
  progressLabel,
  done,
  total,
  cta,
}: ModeCardProps) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col justify-between rounded-3xl border bg-[var(--card-color)] p-6 transition-all duration-300 ease-out sm:p-8',
        'hover:-translate-y-1 hover:border-[var(--main-color)] hover:shadow-[0_20px_40px_-18px_color-mix(in_srgb,var(--main-color)_35%,transparent)]',
        'active:translate-y-0 active:scale-[0.99]',
        'border-[var(--border-color)]',
      )}
    >
      <div>
        <div className='flex items-center justify-between gap-3'>
          <span className='flex size-11 items-center justify-center rounded-xl bg-[var(--main-color)]/10 text-[var(--main-color)]'>
            <Icon size={22} strokeWidth={1.75} />
          </span>
          <span className='text-xs font-medium tracking-wide text-[var(--secondary-color)]'>
            {tag}
          </span>
        </div>

        <h2 className='mt-8 text-2xl font-bold tracking-tight text-[var(--foreground-color)]'>
          {title}
        </h2>
        <p className='mt-2 max-w-[48ch] text-sm leading-relaxed text-[var(--secondary-color)]'>
          {description}
        </p>

        <ul className='mt-6 divide-y divide-[var(--border-color)] border-y border-[var(--border-color)] text-sm text-[var(--foreground-color)]/80'>
          {points.map(point => (
            <li key={point} className='py-2.5'>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className='mt-8'>
        <div className='flex items-baseline justify-between text-xs text-[var(--secondary-color)]'>
          <span>{progressLabel}</span>
          <span className='font-mono text-[var(--foreground-color)] tabular-nums'>
            {total > 0 ? `${done}/${total} · ${pct}%` : 'Sắp có'}
          </span>
        </div>
        <div className='mt-2 h-1 overflow-hidden rounded-full bg-[var(--border-color)]'>
          <div
            className='h-full rounded-full bg-[var(--main-color)] transition-[width] duration-700'
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className='mt-6 flex items-center justify-between text-sm font-semibold text-[var(--main-color)]'>
          <span>{cta}</span>
          <ArrowUpRight
            size={18}
            strokeWidth={1.75}
            className='transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
          />
        </div>
      </div>
    </Link>
  );
}

export default function VocabLevelHub({ level = 'n5' }: VocabLevelHubProps) {
  const { learned, scores } = useVocabStudyStore();
  const lessons = getLessons(level);
  const totalLessons = LESSON_COUNT[level];

  let totalWords = 0;
  let totalLearned = 0;
  let totalScored = 0;

  for (let i = 1; i <= totalLessons; i++) {
    const words = lessons[i]?.words ?? [];
    totalWords += words.length;
    for (const w of words) {
      const key = `${i}:${w.hira}`;
      if (learned.includes(key)) totalLearned++;
      if (scores[key] !== undefined) totalScored++;
    }
  }

  const levelUpper = level.toUpperCase();

  return (
    <div className='font-vietnamese mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:py-10'>
      <header className='max-w-2xl'>
        <p className='text-xs font-medium text-[var(--secondary-color)]'>
          <Link
            href='/vocabulary'
            className='transition-colors hover:text-[var(--main-color)]'
          >
            Từ vựng
          </Link>{' '}
          &rsaquo; {levelUpper}
        </p>
        <h1 className='mt-3 text-3xl font-bold tracking-tight text-[var(--foreground-color)] sm:text-4xl'>
          Từ vựng JLPT {levelUpper}
        </h1>
        <p className='mt-3 text-sm leading-relaxed text-[var(--secondary-color)]'>
          <span className='font-mono text-[var(--foreground-color)]'>
            {totalLessons}
          </span>{' '}
          bài học theo giáo trình Minna no Nihongo. Chọn cách học bên dưới để
          bắt đầu.
        </p>
      </header>

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6'>
        <ModeCard
          href={`/vocabulary/jlpt-${level}/words`}
          icon={BookOpen}
          tag='Thẻ nhớ & bảng từ'
          title='1000 từ vựng'
          description='Ghi nhớ từ qua flashcard hai mặt, tra bảng từ kèm Kanji, nghĩa và câu ví dụ.'
          points={[
            'Flashcard hai mặt, phím tắt thao tác nhanh',
            'Che đáp án và đánh dấu từ đã thuộc',
            'Tìm từ khóa nhanh, nghe phát âm mẫu',
          ]}
          progressLabel='Tiến độ ghi nhớ'
          done={totalLearned}
          total={totalWords}
          cta='Vào học từ vựng'
        />
        <ModeCard
          href={`/vocabulary/jlpt-${level}/pronounce`}
          icon={Mic}
          tag='Phòng thu AI'
          title='Luyện phát âm'
          description='Thu âm qua micro, xem sóng âm trực tiếp và nhận điểm phát âm theo từng từ.'
          points={[
            'Nghe mẫu giọng chuẩn Tokyo',
            'Thu âm trực tiếp, hiển thị sóng âm',
            'Chấm độ chính xác theo phần trăm',
          ]}
          progressLabel='Tiến độ phát âm'
          done={totalScored}
          total={totalWords}
          cta='Vào luyện phát âm'
        />
      </div>
    </div>
  );
}
