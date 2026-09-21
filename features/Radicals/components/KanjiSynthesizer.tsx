'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { IKanjiComposition, IRadical } from '@/entities/radical';
import { radicalDataService } from '../services/radicalDataService';
import { useRadicalsStore } from '../store/useRadicalsStore';
import {
  Trash2,
  ArrowRight,
  Lightbulb,
  Check,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import clsx from 'clsx';

// Common radicals for quick palette
const QUICK_PALETTE = [
  { char: '亻', name: 'Nhân (người)' },
  { char: '木', name: 'Mộc (cây)' },
  { char: '日', name: 'Nhật (mặt trời)' },
  { char: '月', name: 'Nguyệt (mặt trăng)' },
  { char: '宀', name: 'Miên (mái nhà)' },
  { char: '女', name: 'Nữ (phụ nữ)' },
  { char: '口', name: 'Khẩu (miệng)' },
  { char: '氵', name: 'Thủy (nước)' },
  { char: '火', name: 'Hỏa (lửa)' },
  { char: '言', name: 'Ngôn (lời nói)' },
  { char: '門', name: 'Môn (cánh cổng)' },
  { char: '艹', name: 'Thảo (cây cỏ)' },
  { char: '田', name: 'Điền (ruộng)' },
  { char: '力', name: 'Lực (sức mạnh)' },
  { char: '金', name: 'Kim (kim loại)' },
  { char: '雨', name: 'Vũ (mưa)' },
  { char: '疒', name: 'Nạch (bệnh)' },
  { char: '目', name: 'Mục (mắt)' },
  { char: '耳', name: 'Nhĩ (tai)' },
  { char: '辶', name: 'Xước (bước đi)' },
  { char: '魚', name: 'Ngư (con cá)' },
  { char: '羊', name: 'Dương (con dê)' },
  { char: '鳥', name: 'Điểu (con chim)' },
];

export const KanjiSynthesizer: React.FC = () => {
  const {
    synthesizerRadicals,
    addSynthesizerRadical,
    removeSynthesizerRadical,
    clearSynthesizerRadicals,
    setDecomposerTarget,
    setActiveTab,
  } = useRadicalsStore();

  const [compositions, setCompositions] = useState<IKanjiComposition[]>([]);
  const [allRadicals, setAllRadicals] = useState<IRadical[]>([]);
  const [searchPalette, setSearchPalette] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    radicalDataService.getCompositions().then(data => {
      if (isMounted) setCompositions(data);
    });
    radicalDataService.getRadicals().then(data => {
      if (isMounted) setAllRadicals(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Exact matching kanji created from the selected radicals
  const exactMatches = useMemo(() => {
    if (synthesizerRadicals.length === 0) return [];
    return compositions.filter(c => {
      // Must contain all selected radicals
      return synthesizerRadicals.every(
        r => c.radicals.includes(r) || c.radicalNames.some(n => n.includes(r)),
      );
    });
  }, [compositions, synthesizerRadicals]);

  // Suggested next radicals to combine with current selections
  const potentialSuggestions = useMemo(() => {
    if (synthesizerRadicals.length === 0) return [];

    // Find all compositions that contain at least one of the selected radicals
    const candidates = compositions.filter(c =>
      synthesizerRadicals.some(
        r => c.radicals.includes(r) || c.radicalNames.some(n => n.includes(r)),
      ),
    );

    // Return the ones that still need more radicals
    return candidates.filter(
      c => !exactMatches.some(match => match.kanji === c.kanji),
    );
  }, [compositions, synthesizerRadicals, exactMatches]);

  const handleInspectKanji = (kanji: string) => {
    setDecomposerTarget(kanji);
    setActiveTab('decompose');
  };

  const filteredPalette = useMemo(() => {
    if (!searchPalette.trim()) return QUICK_PALETTE;
    const q = searchPalette.toLowerCase().trim();
    return allRadicals
      .filter(
        r =>
          r.char.includes(q) ||
          r.hanviet.toLowerCase().includes(q) ||
          r.meaning_vi.toLowerCase().includes(q),
      )
      .slice(0, 16)
      .map(r => ({
        char: r.char,
        name: `${r.hanviet} (${r.meaning_vi})`,
      }));
  }, [allRadicals, searchPalette]);

  return (
    <div className='flex flex-col gap-6'>
      {/* Workbench Section */}
      <div className='flex flex-col gap-5 rounded-2xl border border-(--border-color) bg-(--card-color) p-6 md:p-8'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h3 className='text-foreground text-lg font-bold'>
              Bàn Ghép Bộ Thủ (Kanji Synthesizer)
            </h3>
            <p className='text-xs text-(--secondary-color)'>
              Chọn các bộ thủ để kết hợp thành chữ Hán mới và khám phá câu
              chuyện chiết tự
            </p>
          </div>

          {synthesizerRadicals.length > 0 && (
            <button
              type='button'
              onClick={clearSynthesizerRadicals}
              className='bg-background/80 flex items-center gap-1.5 rounded-xl border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--secondary-color) transition-all hover:text-rose-500 active:scale-95'
            >
              <RotateCcw className='size-3.5' />
              <span>Xóa tất cả</span>
            </button>
          )}
        </div>

        {/* Selected Radicals Formula Row */}
        <div className='bg-background/40 flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-(--border-color) p-5'>
          {synthesizerRadicals.length === 0 ? (
            <div className='flex flex-col items-center gap-1.5 text-center'>
              <span className='text-foreground/70 text-sm font-semibold'>
                Chưa có bộ thủ nào được chọn
              </span>
              <span className='text-xs text-(--secondary-color)'>
                Bấm vào các bộ thủ gợi ý bên dưới để bắt đầu ghép chữ (ví dụ:
                bấm &quot;亻&quot; rồi bấm &quot;木&quot;)
              </span>
            </div>
          ) : (
            <div className='flex flex-wrap items-center justify-center gap-3'>
              {synthesizerRadicals.map((char, index) => (
                <React.Fragment key={`${char}-${index}`}>
                  {index > 0 && (
                    <span className='text-2xl font-black text-(--secondary-color)'>
                      +
                    </span>
                  )}
                  <div className='group relative flex flex-col items-center justify-center rounded-2xl border-2 border-(--main-color) bg-(--main-color)/10 p-3 shadow-xs'>
                    <span className='text-4xl font-extrabold text-(--main-color)'>
                      {char}
                    </span>
                    <button
                      type='button'
                      onClick={() => removeSynthesizerRadical(char)}
                      className='absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs transition-transform hover:scale-110 active:scale-90'
                      title='Bỏ bộ thủ này'
                    >
                      <Trash2 className='size-3' />
                    </button>
                  </div>
                </React.Fragment>
              ))}

              <span className='text-2xl font-black text-(--secondary-color)'>
                =
              </span>

              {exactMatches.length > 0 ? (
                <div className='flex flex-wrap items-center gap-2'>
                  {exactMatches.map(match => (
                    <div
                      key={match.kanji}
                      className='animate-in zoom-in-50 flex size-14 items-center justify-center rounded-2xl bg-(--main-color) text-3xl font-black text-white shadow-lg ring-4 ring-(--main-color)/20 duration-300'
                    >
                      {match.kanji}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='flex size-14 items-center justify-center rounded-2xl border-2 border-dashed border-(--secondary-color)/40 text-2xl font-bold text-(--secondary-color)'>
                  ?
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Radical Picker Palette */}
        <div className='flex flex-col gap-3'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <span className='text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
              Bảng chọn bộ thủ thông dụng:
            </span>
            <input
              type='text'
              value={searchPalette}
              onChange={e => setSearchPalette(e.target.value)}
              placeholder='Tìm thêm bộ thủ khác...'
              className='bg-background text-foreground rounded-lg border border-(--border-color) px-3 py-1 text-xs focus:border-(--main-color) focus:outline-none'
            />
          </div>

          <div className='flex flex-wrap gap-2'>
            {filteredPalette.map(item => {
              const isSelected = synthesizerRadicals.includes(item.char);
              return (
                <button
                  key={item.char}
                  type='button'
                  onClick={() => {
                    if (isSelected) {
                      removeSynthesizerRadical(item.char);
                    } else {
                      addSynthesizerRadical(item.char);
                    }
                  }}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all active:scale-95',
                    isSelected
                      ? 'border-(--main-color) bg-(--main-color) text-white shadow-xs'
                      : 'bg-background text-foreground border-(--border-color) hover:border-(--main-color)/60 hover:bg-(--main-color)/5',
                  )}
                >
                  <span className='text-xl font-bold'>{item.char}</span>
                  <span className='text-xs opacity-80'>{item.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {exactMatches.length > 0 && (
        <div className='flex flex-col gap-4'>
          <div className='flex items-center gap-2 text-emerald-500'>
            <Check className='size-5' />
            <h4 className='text-foreground text-base font-bold'>
              Ghép thành công {exactMatches.length} chữ Hán!
            </h4>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {exactMatches.map(item => (
              <div
                key={item.kanji}
                className='flex flex-col gap-4 rounded-2xl border-2 border-(--main-color)/40 bg-(--card-color) p-5 shadow-sm'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='flex size-16 items-center justify-center rounded-2xl bg-(--main-color) text-3xl font-black text-white shadow-md'>
                      {item.kanji}
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-foreground text-xl font-black'>
                        {item.hanviet}
                      </span>
                      <span className='text-sm font-medium text-(--secondary-color)'>
                        {item.meanings.join(', ')}
                      </span>
                    </div>
                  </div>

                  {item.level && (
                    <span className='rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-500'>
                      JLPT {item.level}
                    </span>
                  )}
                </div>

                {/* Mnemonic story */}
                <div className='flex flex-col gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5'>
                  <div className='flex items-center gap-1.5 text-xs font-bold text-amber-500'>
                    <BookOpen className='size-3.5' />
                    <span>Chiết tự ghép chữ:</span>
                  </div>
                  <p className='text-foreground text-xs leading-relaxed font-medium'>
                    &ldquo;{item.story}&rdquo;
                  </p>
                </div>

                <div className='flex items-center justify-between text-xs text-(--secondary-color)'>
                  <span>
                    Ghép từ:{' '}
                    <strong className='text-(--main-color)'>
                      {item.radicals.join(' + ')}
                    </strong>
                  </span>
                  <button
                    type='button'
                    onClick={() => handleInspectKanji(item.kanji)}
                    className='flex items-center gap-1 font-semibold text-(--main-color) hover:underline'
                  >
                    <span>Xem chi tiết chữ này</span>
                    <ArrowRight className='size-3' />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Section: What can be formed if you add another radical */}
      {synthesizerRadicals.length > 0 && potentialSuggestions.length > 0 && (
        <div className='flex flex-col gap-3 rounded-2xl border border-(--border-color) bg-(--card-color) p-5'>
          <div className='flex items-center gap-2 text-amber-500'>
            <Lightbulb className='size-4' />
            <h4 className='text-xs font-bold tracking-wider uppercase'>
              Gợi ý các chữ có thể ghép tiếp từ bộ đang chọn:
            </h4>
          </div>

          <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3'>
            {potentialSuggestions.slice(0, 9).map(cand => (
              <div
                key={cand.kanji}
                className='bg-background/60 flex items-center justify-between rounded-xl border border-(--border-color) p-3'
              >
                <div className='flex items-center gap-2.5'>
                  <span className='flex size-9 items-center justify-center rounded-lg bg-(--main-color)/10 text-xl font-black text-(--main-color)'>
                    {cand.kanji}
                  </span>
                  <div className='flex flex-col'>
                    <span className='text-foreground text-xs font-bold'>
                      {cand.hanviet}
                    </span>
                    <span className='line-clamp-1 text-[11px] text-(--secondary-color)'>
                      {cand.radicals.join(' + ')}
                    </span>
                  </div>
                </div>

                <button
                  type='button'
                  onClick={() => {
                    cand.radicals.forEach(r => addSynthesizerRadical(r));
                  }}
                  className='rounded-lg bg-(--main-color)/10 px-2.5 py-1 text-xs font-semibold text-(--main-color) transition-all hover:bg-(--main-color) hover:text-white'
                >
                  Ghép chữ này
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default KanjiSynthesizer;
