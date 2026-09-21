'use client';

import React, { useState, useEffect } from 'react';
import type { IKanjiComposition } from '@/entities/radical';
import { radicalDataService } from '../services/radicalDataService';
import { useRadicalsStore } from '../store/useRadicalsStore';
import { Search, Puzzle, BookOpen, Layers } from 'lucide-react';
import clsx from 'clsx';

const SAMPLE_KANJI = [
  '千',
  '万',
  '百',
  '円',
  '年',
  '休',
  '明',
  '安',
  '好',
  '森',
  '林',
  '間',
  '聞',
  '問',
  '信',
  '語',
  '話',
  '読',
  '花',
  '鮮',
  '泪',
  '岩',
  '相',
  '海',
  '時',
  '校',
  '家',
  '道',
  '意',
  '酒',
  '買',
  '痛',
  '上',
  '下',
  '中',
  '大',
  '小',
  '男',
  '女',
  '子',
  '父',
  '母',
];

export const KanjiDecomposer: React.FC = () => {
  const {
    decomposerTarget,
    setDecomposerTarget,
    setActiveTab,
    addSynthesizerRadical,
  } = useRadicalsStore();

  const [inputVal, setInputVal] = useState<string>(decomposerTarget);
  const [composition, setComposition] = useState<IKanjiComposition | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!decomposerTarget) return;

    void (async () => {
      await Promise.resolve();
      if (!isMounted) return;
      setIsLoading(true);
      try {
        const res =
          await radicalDataService.getCompositionByKanji(decomposerTarget);
        if (isMounted) {
          setComposition(res);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setComposition(null);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [decomposerTarget]);

  const handleSearch = (char: string) => {
    const trimmed = char.trim();
    if (!trimmed) return;
    const targetChar = Array.from(trimmed)[0] || '';
    setDecomposerTarget(targetChar);
    setInputVal(targetChar);
  };

  const handleSelectSample = (char: string) => {
    setInputVal(char);
    setDecomposerTarget(char);
  };

  const handleSynthesizeRadical = (rad: string) => {
    addSynthesizerRadical(rad);
    setActiveTab('synthesize');
  };

  const structureLabels: Record<string, string> = {
    'left-right': 'Cấu trúc Trái - Phải (左右)',
    'top-bottom': 'Cấu trúc Trên - Dưới (上下)',
    enclosure: 'Cấu trúc Bao quanh (包囲)',
    triangular: 'Cấu trúc Tam giác xếp chồng (品字)',
    solo: 'Chữ đơn độc lập (独体)',
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Header & input card */}
      <div className='flex flex-col gap-4 rounded-2xl border border-(--border-color) bg-(--card-color) p-5 md:p-6'>
        <div>
          <h3 className='text-foreground text-lg font-bold'>
            Phân rã Hán tự & Chiết tự (Kanji Decomposer)
          </h3>
          <p className='text-xs text-(--secondary-color)'>
            Bóc tách chữ Hán thành từng khối bộ thủ Lego và khám phá câu chuyện
            gợi nhớ nguồn gốc
          </p>
        </div>

        {/* Input box */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSearch(inputVal);
          }}
          className='flex gap-2'
        >
          <div className='relative flex-1'>
            <Search className='absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--secondary-color)' />
            <input
              type='text'
              value={inputVal}
              onChange={e => {
                const val = e.target.value;
                setInputVal(val);
                const trimmed = val.trim();
                if (trimmed.length > 0) {
                  const targetChar = Array.from(trimmed)[0] || '';
                  setDecomposerTarget(targetChar);
                }
              }}
              placeholder='Nhập chữ Kanji muốn phân tích (ví dụ: 千, 万, 休, 明, 安, 語...)'
              maxLength={10}
              className='bg-background text-foreground w-full rounded-xl border border-(--border-color) py-2.5 pr-4 pl-10 text-sm focus:border-(--main-color) focus:outline-none'
            />
          </div>
          <button
            type='submit'
            className='rounded-xl bg-(--main-color) px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95'
          >
            Phân tích
          </button>
        </form>

        {/* Quick sample chips */}
        <div className='flex flex-col gap-2'>
          <span className='text-xs font-medium text-(--secondary-color)'>
            Hán tự mẫu gợi ý:
          </span>
          <div className='flex flex-wrap gap-1.5'>
            {SAMPLE_KANJI.map(k => (
              <button
                key={k}
                type='button'
                onClick={() => handleSelectSample(k)}
                className={clsx(
                  'flex size-8 items-center justify-center rounded-lg text-sm font-bold transition-all',
                  decomposerTarget === k
                    ? 'bg-(--main-color) text-white shadow-xs'
                    : 'bg-background text-foreground border border-(--border-color) hover:border-(--main-color) hover:text-(--main-color)',
                )}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decomposition display card */}
      {isLoading ? (
        <div className='h-72 animate-pulse rounded-2xl border border-(--border-color) bg-(--card-color)/50' />
      ) : composition ? (
        <div className='flex flex-col gap-6 rounded-2xl border border-(--border-color) bg-(--card-color) p-6 md:p-8'>
          {/* Main kanji hero section */}
          <div className='flex flex-col items-center justify-between gap-6 border-b border-(--border-color) pb-6 md:flex-row'>
            <div className='flex items-center gap-6'>
              {/* Giant kanji box */}
              <div className='flex size-28 items-center justify-center rounded-3xl border-2 border-(--main-color)/30 bg-(--main-color)/5 shadow-inner'>
                <span className='text-6xl font-extrabold text-(--main-color)'>
                  {composition.kanji}
                </span>
              </div>

              <div className='flex flex-col gap-1.5'>
                <div className='flex items-center gap-2'>
                  <span className='text-foreground text-2xl font-black tracking-wider'>
                    {composition.hanviet}
                  </span>
                  {composition.level && (
                    <span className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-500'>
                      JLPT {composition.level}
                    </span>
                  )}
                </div>
                <span className='text-foreground/80 text-sm font-medium'>
                  {composition.meanings.join(', ')}
                </span>
                <span className='text-xs font-medium text-(--secondary-color)'>
                  {structureLabels[composition.structure] ||
                    composition.structure}
                </span>
              </div>
            </div>

            {/* Readings */}
            <div className='bg-background/50 flex flex-col gap-2 rounded-xl border border-(--border-color) p-4 text-xs'>
              {composition.onyomi.length > 0 && (
                <div className='flex items-baseline gap-2'>
                  <span className='font-bold text-(--secondary-color)'>
                    Onyomi:
                  </span>
                  <span className='text-foreground font-mono font-semibold'>
                    {composition.onyomi.join(', ')}
                  </span>
                </div>
              )}
              {composition.kunyomi.length > 0 && (
                <div className='flex items-baseline gap-2'>
                  <span className='font-bold text-(--secondary-color)'>
                    Kunyomi:
                  </span>
                  <span className='text-foreground font-mono font-semibold'>
                    {composition.kunyomi.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Lego brick breakdown */}
          <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-2'>
              <Puzzle className='size-4 text-(--main-color)' />
              <h4 className='text-foreground text-sm font-bold tracking-wider uppercase'>
                Các bộ thủ Lego cấu thành:
              </h4>
            </div>

            <div className='flex flex-wrap items-center gap-3'>
              {composition.radicals.map((rad, idx) => {
                const name = composition.radicalNames[idx] || '';
                return (
                  <React.Fragment key={`${rad}-${idx}`}>
                    {idx > 0 && (
                      <span className='text-xl font-black text-(--secondary-color)'>
                        +
                      </span>
                    )}
                    <button
                      type='button'
                      onClick={() => handleSynthesizeRadical(rad)}
                      title='Bấm để thử ghép chữ với bộ này'
                      className='group bg-background/80 flex items-center gap-3 rounded-2xl border border-(--border-color) p-3.5 transition-all hover:border-(--main-color) hover:shadow-sm'
                    >
                      <span className='flex size-11 items-center justify-center rounded-xl bg-(--main-color)/10 text-3xl font-extrabold text-(--main-color) transition-transform group-hover:scale-105'>
                        {rad}
                      </span>
                      <div className='flex flex-col text-left'>
                        <span className='text-foreground text-sm font-bold'>
                          {name}
                        </span>
                        <span className='text-xs text-(--secondary-color)'>
                          Bộ thủ #{composition.radicalIds[idx] || '?'}
                        </span>
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}

              <span className='text-xl font-black text-(--secondary-color)'>
                =
              </span>

              <div className='flex size-14 items-center justify-center rounded-2xl bg-(--main-color) text-3xl font-black text-white shadow-md'>
                {composition.kanji}
              </div>
            </div>
          </div>

          {/* Mnemonic Story Box */}
          <div className='flex flex-col gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5'>
            <div className='flex items-center gap-2 text-amber-500'>
              <BookOpen className='size-4' />
              <span className='text-xs font-bold tracking-wider uppercase'>
                Chiết tự & Câu chuyện gợi nhớ:
              </span>
            </div>
            <p className='text-foreground text-sm leading-relaxed font-medium'>
              &ldquo;{composition.story}&rdquo;
            </p>
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-(--border-color) p-12 text-center'>
          <Layers className='size-8 text-(--secondary-color)/40' />
          <p className='text-foreground text-base font-semibold'>
            Chưa tìm thấy dữ liệu phân rã cho chữ &quot;{decomposerTarget}&quot;
          </p>
          <p className='text-xs text-(--secondary-color)'>
            Hãy chọn một trong các chữ Kanji phổ biến ở danh sách gợi ý phía
            trên
          </p>
        </div>
      )}
    </div>
  );
};

export default KanjiDecomposer;
