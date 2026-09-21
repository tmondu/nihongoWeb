'use client';

import React from 'react';
import type { IRadical } from '@/entities/radical';
import { useRadicalsStore } from '../store/useRadicalsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/components/dialog';
import { Layers, Plus, BookOpen } from 'lucide-react';
import clsx from 'clsx';

interface RadicalDetailModalProps {
  radical: IRadical | null;
  onClose: () => void;
}

export const RadicalDetailModal: React.FC<RadicalDetailModalProps> = ({
  radical,
  onClose,
}) => {
  const { setActiveTab, addSynthesizerRadical, setDecomposerTarget } =
    useRadicalsStore();

  if (!radical) return null;

  const handleSynthesize = () => {
    addSynthesizerRadical(radical.char);
    setActiveTab('synthesize');
    onClose();
  };

  const handleDecomposeExample = (kanji: string) => {
    setDecomposerTarget(kanji);
    setActiveTab('decompose');
    onClose();
  };

  const layerLabel = {
    core: 'Tầng Cốt Lõi (Core 50)',
    extended: 'Tầng Mở Rộng (Extended 80)',
    rare: 'Tầng Hiếm Gặp (Rare)',
  }[radical.layer];

  const layerBadgeColor = {
    core: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    extended: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    rare: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  }[radical.layer];

  return (
    <Dialog open={!!radical} onOpenChange={open => !open && onClose()}>
      <DialogContent className='max-w-md border border-(--border-color) bg-(--card-color) p-6 sm:max-w-lg'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <span
              className={clsx(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                layerBadgeColor,
              )}
            >
              {layerLabel}
            </span>
            <span className='text-xs text-(--secondary-color)'>
              Bộ số #{radical.id} • {radical.strokeCount} nét
            </span>
          </div>
          <DialogTitle className='mt-2 flex items-baseline gap-3'>
            <span className='text-5xl font-extrabold text-(--main-color)'>
              {radical.char}
            </span>
            <span className='text-foreground text-2xl font-bold tracking-wide'>
              {radical.hanviet}
            </span>
          </DialogTitle>
          <DialogDescription className='text-sm text-(--secondary-color)'>
            {radical.meaning_vi}
          </DialogDescription>
        </DialogHeader>

        <div className='mt-4 flex flex-col gap-4'>
          {/* Alt forms */}
          {radical.altForms.length > 0 && (
            <div className='bg-background/50 flex items-center gap-2 rounded-xl border border-(--border-color) p-3'>
              <span className='text-xs font-medium text-(--secondary-color)'>
                Biến thể thường gặp:
              </span>
              <div className='flex gap-1.5'>
                {radical.altForms.map(alt => (
                  <span
                    key={alt}
                    className='flex size-7 items-center justify-center rounded-lg bg-(--main-color)/10 text-base font-bold text-(--main-color)'
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Example kanji */}
          {radical.exampleKanji.length > 0 && (
            <div className='flex flex-col gap-2'>
              <span className='text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'>
                Các chữ Kanji tiêu biểu chứa bộ này:
              </span>
              <div className='flex flex-wrap gap-2'>
                {radical.exampleKanji.map(k => (
                  <button
                    key={k}
                    type='button'
                    onClick={() => handleDecomposeExample(k)}
                    className='group bg-background/60 text-foreground flex items-center gap-1.5 rounded-xl border border-(--border-color) px-3 py-2 text-lg font-bold transition-all hover:border-(--main-color) hover:bg-(--main-color)/10 hover:text-(--main-color)'
                  >
                    <span>{k}</span>
                    <BookOpen className='size-3.5 opacity-50 transition-transform group-hover:scale-110 group-hover:opacity-100' />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className='mt-2 flex flex-col gap-2 sm:flex-row'>
            <button
              type='button'
              onClick={handleSynthesize}
              className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-(--main-color) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 active:scale-[0.98]'
            >
              <Plus className='size-4' />
              <span>Ghép chữ với bộ này</span>
            </button>
            <button
              type='button'
              onClick={() => {
                if (radical.exampleKanji[0]) {
                  handleDecomposeExample(radical.exampleKanji[0]);
                }
              }}
              className='bg-background hover:text-foreground flex items-center justify-center gap-2 rounded-xl border border-(--border-color) px-4 py-2.5 text-sm font-semibold text-(--secondary-color) transition-all hover:border-(--main-color) active:scale-[0.98]'
            >
              <Layers className='size-4' />
              <span>Phân tích chữ mẫu</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RadicalDetailModal;
