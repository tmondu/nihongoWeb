'use client';

import { useState } from 'react';
import { Search, Volume2, RotateCcw } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import type { VocabWord } from '../../types/study';

interface VocabTableViewProps {
  words: VocabWord[];
  lessonId: number;
  cursor: number;
  learned: string[];
  onSelectWord: (idx: number) => void;
  onResetLesson: () => void;
}

function speak(text: string) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

export default function VocabTableView({
  words,
  lessonId,
  cursor,
  learned,
  onSelectWord,
  onResetLesson,
}: VocabTableViewProps) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const filtered = words
    .map((w, i) => ({ ...w, _idx: i }))
    .filter(
      w =>
        !search ||
        w.hira.includes(search) ||
        (w.kanji?.includes(search) ?? false) ||
        w.mean.toLowerCase().includes(search.toLowerCase()),
    );

  function handleSelect(idx: number) {
    onSelectWord(idx);
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onResetLesson();
    setConfirmReset(false);
  }

  return (
    <div className='font-vietnamese flex flex-col gap-3'>
      {/* Controls */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-48 flex-1'>
          <Search
            size={14}
            className='absolute top-1/2 left-3 -translate-y-1/2 text-[var(--secondary-color)]'
          />
          <input
            type='text'
            placeholder='Tìm từ...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='w-full rounded-lg border border-[var(--border-color)] bg-[var(--card-color)] py-2 pr-3 pl-9 text-sm text-[var(--foreground-color)] placeholder:text-[var(--secondary-color)] focus:border-[var(--main-color)] focus:outline-none'
          />
        </div>

        <label className='flex cursor-pointer items-center gap-2 text-sm text-[var(--secondary-color)] select-none'>
          <div
            onClick={() => setShowAll(v => !v)}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              showAll ? 'bg-[var(--main-color)]' : 'bg-[var(--border-color)]',
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                showAll ? 'translate-x-4' : 'translate-x-0.5',
              )}
            />
          </div>
          Hiện tất cả
        </label>

        <button
          onClick={handleReset}
          className={cn(
            'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
            confirmReset
              ? 'border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20'
              : 'border-[var(--border-color)] text-[var(--secondary-color)] hover:bg-[var(--card-color)]',
          )}
        >
          <RotateCcw size={13} />
          {confirmReset ? 'Xác nhận reset?' : 'Reset bài'}
        </button>
      </div>

      {/* Table */}
      <div className='overflow-x-auto rounded-xl border border-[var(--border-color)]'>
        <table className='w-full min-w-[560px] text-sm'>
          <thead>
            <tr className='border-b border-[var(--border-color)] bg-[var(--card-color)]'>
              <th className='px-4 py-3 text-left text-xs font-semibold tracking-wide text-[var(--secondary-color)] uppercase'>
                #
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold tracking-wide text-[var(--secondary-color)] uppercase'>
                Hiragana
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold tracking-wide text-[var(--secondary-color)] uppercase'>
                Kanji
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold tracking-wide text-[var(--secondary-color)] uppercase'>
                Nghĩa
              </th>
              <th className='px-4 py-3 text-left text-xs font-semibold tracking-wide text-[var(--secondary-color)] uppercase'>
                Ví dụ
              </th>
              <th className='w-10 px-2 py-3' />
            </tr>
          </thead>
          <tbody className='divide-y divide-[var(--border-color)]'>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className='py-8 text-center text-[var(--secondary-color)]'
                >
                  {words.length === 0
                    ? 'Bài này chưa có dữ liệu.'
                    : 'Không tìm thấy từ nào.'}
                </td>
              </tr>
            )}
            {filtered.map(w => {
              const key = `${lessonId}:${w.hira}`;
              const isLearned = learned.includes(key);
              const isActive = w._idx === cursor;
              const reveal = showAll || isLearned;

              return (
                <tr
                  key={key}
                  onClick={() => handleSelect(w._idx)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isActive
                      ? 'bg-[var(--main-color)]/10'
                      : 'hover:bg-[var(--card-color)]',
                    isLearned && 'opacity-80',
                  )}
                >
                  <td className='px-4 py-3 text-[var(--secondary-color)] tabular-nums'>
                    {w._idx + 1}
                  </td>
                  <td className='px-4 py-3 font-medium text-[var(--foreground-color)]'>
                    <span className='font-japanese text-base' lang='ja'>
                      {w.hira}
                    </span>
                    {isLearned && (
                      <span className='ml-1.5 text-xs text-green-500'>✓</span>
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {reveal ? (
                      <span
                        className='font-japanese text-base text-[var(--foreground-color)]'
                        lang='ja'
                      >
                        {w.kanji ?? '—'}
                      </span>
                    ) : (
                      <span className='inline-block h-4 w-12 rounded bg-[var(--border-color)]' />
                    )}
                  </td>
                  <td className='px-4 py-3'>
                    {reveal ? (
                      <span className='font-vietnamese text-[var(--foreground-color)]'>
                        {w.mean}
                      </span>
                    ) : (
                      <span className='inline-block h-4 w-20 rounded bg-[var(--border-color)]' />
                    )}
                  </td>
                  <td className='max-w-xs truncate px-4 py-3 text-[var(--secondary-color)]'>
                    {reveal ? (
                      <span className='font-japanese text-sm' lang='ja'>
                        {w.ex ?? '—'}
                      </span>
                    ) : (
                      <span className='inline-block h-4 w-32 rounded bg-[var(--border-color)]' />
                    )}
                  </td>
                  <td className='px-2 py-3'>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        speak(w.hira);
                      }}
                      className='rounded-full p-1.5 text-[var(--secondary-color)] hover:bg-[var(--card-color)] hover:text-[var(--foreground-color)]'
                      title='Nghe phát âm'
                    >
                      <Volume2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
