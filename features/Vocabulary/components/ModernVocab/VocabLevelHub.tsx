'use client';

import { BookOpen, Mic, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import useVocabStudyStore from '../../store/useVocabStudyStore';
import { getLessons, LESSON_COUNT } from '../../data/lessonsN5';
import type { VocabLevel } from '../../types/study';

interface VocabLevelHubProps {
  level?: VocabLevel;
}

export default function VocabLevelHub({ level = 'n5' }: VocabLevelHubProps) {
  const { learned, scores } = useVocabStudyStore();
  const lessons = getLessons(level);
  const totalLessons = LESSON_COUNT[level];

  // Calculate totals
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

  const vocabProgressPct =
    totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;
  const speakProgressPct =
    totalWords > 0 ? Math.round((totalScored / totalWords) * 100) : 0;

  const levelUpper = level.toUpperCase();

  return (
    <div className='font-vietnamese mx-auto flex max-w-5xl flex-col gap-8 py-4 sm:py-8'>
      {/* Header */}
      <div>
        <p className='text-xs font-medium text-[var(--secondary-color)]'>
          <Link
            href='/vocabulary'
            className='transition-colors hover:text-[var(--main-color)]'
          >
            Từ vựng
          </Link>{' '}
          &rsaquo; {levelUpper}
        </p>
        <div className='mt-2 flex flex-wrap items-center gap-3'>
          <h1 className='text-2xl font-bold tracking-tight text-[var(--foreground-color)] sm:text-3xl'>
            Từ vựng JLPT {levelUpper}
          </h1>
          <span className='rounded-full border border-[var(--main-color)]/30 bg-[var(--main-color)]/10 px-3 py-0.5 text-xs font-semibold text-[var(--main-color)]'>
            {totalLessons} bài học
          </span>
        </div>
        <p className='mt-2 max-w-2xl text-sm leading-relaxed text-[var(--secondary-color)]'>
          Khóa từ vựng theo giáo trình Minna no Nihongo chuẩn JLPT {levelUpper}.
          Hãy chọn hình thức học bên dưới để bắt đầu:
        </p>
      </div>

      {/* 2 Selection Cards */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* Card 1: 1000 từ vựng */}
        <Link
          href={`/vocabulary/jlpt-${level}/words`}
          className='group relative flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--main-color)] hover:shadow-xl'
        >
          <div>
            {/* Badge & Icon */}
            <div className='flex items-start justify-between'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--main-color)]/10 text-[var(--main-color)] transition-transform group-hover:scale-105'>
                <BookOpen size={28} />
              </div>
              <span className='rounded-full bg-[var(--border-color)] px-2.5 py-1 text-[11px] font-medium text-[var(--secondary-color)]'>
                Thẻ nhớ & Bảng từ
              </span>
            </div>

            {/* Title & Desc */}
            <h2 className='mt-5 text-xl font-bold text-[var(--foreground-color)] transition-colors group-hover:text-[var(--main-color)]'>
              1000 từ vựng
            </h2>
            <p className='mt-2 text-sm leading-relaxed text-[var(--secondary-color)]'>
              Luyện phản xạ ghi nhớ từ vựng qua Flashcard 2 mặt, tra cứu bảng từ
              toàn diện kèm Kanji, giải nghĩa và câu ví dụ.
            </p>

            {/* Feature bullets */}
            <ul className='mt-5 space-y-2 text-xs text-[var(--foreground-color)]/80'>
              <li className='flex items-center gap-2'>
                <CheckCircle2 size={14} className='shrink-0 text-green-500' />
                <span>Flashcard 2 mặt tương tác & phím tắt tốc độ cao</span>
              </li>
              <li className='flex items-center gap-2'>
                <CheckCircle2 size={14} className='shrink-0 text-green-500' />
                <span>Mặt nạ che đáp án & đánh dấu từ đã thuộc</span>
              </li>
              <li className='flex items-center gap-2'>
                <CheckCircle2 size={14} className='shrink-0 text-green-500' />
                <span>Tìm kiếm từ khóa nhanh & phát âm audio mẫu</span>
              </li>
            </ul>
          </div>

          <div className='mt-8 border-t border-[var(--border-color)] pt-4'>
            {/* Progress */}
            {totalWords > 0 && (
              <div className='mb-4'>
                <div className='flex items-center justify-between text-xs text-[var(--secondary-color)]'>
                  <span>Tiến độ ghi nhớ</span>
                  <span className='font-semibold text-[var(--foreground-color)] tabular-nums'>
                    {totalLearned}/{totalWords} từ ({vocabProgressPct}%)
                  </span>
                </div>
                <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--border-color)]'>
                  <div
                    className='h-full rounded-full bg-[var(--main-color)] transition-all duration-500'
                    style={{ width: `${vocabProgressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className='flex items-center justify-between rounded-xl bg-[var(--main-color)] px-4 py-3 text-sm font-semibold text-white transition-opacity group-hover:opacity-90'>
              <span>Vào học từ vựng</span>
              <ArrowRight
                size={16}
                className='transition-transform group-hover:translate-x-1'
              />
            </div>
          </div>
        </Link>

        {/* Card 2: Luyện phát âm */}
        <Link
          href={`/vocabulary/jlpt-${level}/pronounce`}
          className='group relative flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--main-color)] hover:shadow-xl'
        >
          <div>
            {/* Badge & Icon */}
            <div className='flex items-start justify-between'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 transition-transform group-hover:scale-105'>
                <Mic size={28} />
              </div>
              <span className='rounded-full bg-[var(--border-color)] px-2.5 py-1 text-[11px] font-medium text-[var(--secondary-color)]'>
                Phòng thu AI
              </span>
            </div>

            {/* Title & Desc */}
            <h2 className='mt-5 text-xl font-bold text-[var(--foreground-color)] transition-colors group-hover:text-[var(--main-color)]'>
              Luyện phát âm
            </h2>
            <p className='mt-2 text-sm leading-relaxed text-[var(--secondary-color)]'>
              Luyện nói tiếng Nhật chuẩn Tokyo qua micro, hiển thị sóng âm sống
              động và hệ thống AI nhận diện giọng nói chấm điểm chính xác.
            </p>

            {/* Feature bullets */}
            <ul className='mt-5 space-y-2 text-xs text-[var(--foreground-color)]/80'>
              <li className='flex items-center gap-2'>
                <CheckCircle2 size={14} className='shrink-0 text-purple-500' />
                <span>Nghe mẫu phát âm chuẩn tự nhiên từ người bản xứ</span>
              </li>
              <li className='flex items-center gap-2'>
                <CheckCircle2 size={14} className='shrink-0 text-purple-500' />
                <span>Thu âm trực tiếp qua mic & hiển thị sóng âm</span>
              </li>
              <li className='flex items-center gap-2'>
                <CheckCircle2 size={14} className='shrink-0 text-purple-500' />
                <span>Thuật toán AI phân tích độ chính xác theo %</span>
              </li>
            </ul>
          </div>

          <div className='mt-8 border-t border-[var(--border-color)] pt-4'>
            {/* Progress */}
            {totalWords > 0 && (
              <div className='mb-4'>
                <div className='flex items-center justify-between text-xs text-[var(--secondary-color)]'>
                  <span>Tiến độ phát âm</span>
                  <span className='font-semibold text-[var(--foreground-color)] tabular-nums'>
                    {totalScored}/{totalWords} từ ({speakProgressPct}%)
                  </span>
                </div>
                <div className='mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--border-color)]'>
                  <div
                    className='h-full rounded-full bg-purple-500 transition-all duration-500'
                    style={{ width: `${speakProgressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action CTA */}
            <div className='flex items-center justify-between rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-opacity group-hover:opacity-90'>
              <span>Vào luyện phát âm</span>
              <ArrowRight
                size={16}
                className='transition-transform group-hover:translate-x-1'
              />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
