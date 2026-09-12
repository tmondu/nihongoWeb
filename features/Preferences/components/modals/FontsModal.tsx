'use client';

import fonts from '@/features/Preferences/data/fonts/fonts';
import { isRecommendedFont } from '@/features/Preferences/data/fonts/recommendedFonts';
import vietnameseFonts from '@/features/Preferences/data/fonts/vietnameseFonts';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/generic/useAudio';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, BookOpen, Star, Type, Languages } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import CollapsibleSection from '@/features/Preferences/components/shared/CollapsibleSection';

interface FontsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FontCardProps {
  fontName: string;
  fontClassName: string;
  previewText: string;
  isSelected: boolean;
  isDefault: boolean;
  onClick: (name: string) => void;
}

const FontCard = memo(function FontCard({
  fontName,
  fontClassName,
  previewText,
  isSelected,
  isDefault,
  onClick,
}: FontCardProps) {
  return (
    <label
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-0 bg-(--card-color) p-4 text-center transition-all',
        isSelected && 'ring-2 ring-(--secondary-color)',
      )}
      style={{
        outline: 'none',
        backgroundColor: isSelected
          ? 'var(--secondary-color)'
          : 'var(--card-color)',
        transition: 'background-color 275ms, color 275ms',
      }}
      onClick={() => onClick(fontName)}
    >
      <p className={clsx('text-base font-bold sm:text-lg', fontClassName)}>
        <span
          style={{
            color: isSelected ? 'var(--background-color)' : 'var(--main-color)',
          }}
        >
          {fontName}
          {isDefault && (
            <span
              style={{
                color: isSelected
                  ? 'var(--background-color)'
                  : 'var(--main-color)',
              }}
              className='text-xs opacity-80'
            >
              {' (mặc định)'}
            </span>
          )}
        </span>
      </p>

      <p
        className={clsx(
          'mt-1 text-sm tracking-wide sm:text-base',
          fontClassName,
        )}
        style={{
          color: isSelected
            ? 'var(--background-color)'
            : 'var(--secondary-color)',
        }}
      >
        {previewText}
      </p>
    </label>
  );
});

export default function FontsModal({ open, onOpenChange }: FontsModalProps) {
  const { playClick } = useClick();
  const [activeTab, setActiveTab] = useState<'japanese' | 'vietnamese'>(
    'japanese',
  );

  const selectedJapaneseFont = usePreferencesStore(state => state.font);
  const setSelectedJapaneseFont = usePreferencesStore(state => state.setFont);

  const selectedVietnameseFont = usePreferencesStore(
    state => state.vietnameseFont || 'Be Vietnam Pro',
  );
  const setSelectedVietnameseFont = usePreferencesStore(
    state => state.setVietnameseFont,
  );

  // Separate Japanese fonts into recommended and other categories
  const { recommendedFonts, otherFonts } = useMemo(() => {
    const recommended = fonts.filter(f => isRecommendedFont(f.name));
    const other = fonts.filter(f => !isRecommendedFont(f.name));
    return { recommendedFonts: recommended, otherFonts: other };
  }, []);

  const handleJapaneseFontClick = useCallback(
    (fontName: string) => {
      playClick();
      setSelectedJapaneseFont(fontName);
    },
    [playClick, setSelectedJapaneseFont],
  );

  const handleVietnameseFontClick = useCallback(
    (fontName: string) => {
      playClick();
      setSelectedVietnameseFont(fontName);
    },
    [playClick, setSelectedVietnameseFont],
  );

  const handleClose = useCallback(() => {
    playClick();
    onOpenChange(false);
  }, [playClick, onOpenChange]);

  if (!open) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80' />
        <DialogPrimitive.Content
          className='fixed top-1/2 left-1/2 z-50 flex max-h-[88vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 rounded-3xl border-0 border-(--border-color) bg-(--background-color) p-0 sm:max-h-[82vh] sm:w-[90vw]'
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {/* Header */}
          <div className='sticky top-0 z-10 flex flex-col gap-3 rounded-t-3xl border-b border-(--border-color) bg-(--background-color) px-6 pt-6 pb-4'>
            <div className='flex flex-row items-center justify-between'>
              <DialogPrimitive.Title className='flex items-center gap-2 text-2xl font-bold text-(--main-color)'>
                <span className='motion-safe:animate-float flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) leading-none text-(--background-color) [--float-distance:-3px]'>
                  <Type size={20} />
                </span>
                Cài đặt phông chữ
              </DialogPrimitive.Title>
              <button
                onClick={handleClose}
                className='shrink-0 rounded-xl p-2 hover:cursor-pointer hover:bg-(--card-color)'
              >
                <X size={22} className='text-(--secondary-color)' />
              </button>
            </div>

            {/* Language Selector Tabs */}
            <div className='flex rounded-2xl border border-(--border-color)/80 bg-(--card-color)/60 p-1'>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setActiveTab('japanese');
                }}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all sm:text-sm',
                  activeTab === 'japanese'
                    ? 'bg-(--secondary-color) text-(--background-color) shadow-xs'
                    : 'text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                <span>🇯🇵</span>
                <span>Phông Tiếng Nhật (Kanji & Kana)</span>
              </button>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setActiveTab('vietnamese');
                }}
                className={clsx(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all sm:text-sm',
                  activeTab === 'vietnamese'
                    ? 'bg-(--secondary-color) text-(--background-color) shadow-xs'
                    : 'text-(--secondary-color) hover:text-(--main-color)',
                )}
              >
                <span>🇻🇳</span>
                <span>Phông Tiếng Việt (Giao diện)</span>
              </button>
            </div>
          </div>

          {/* Modal Scroll Content */}
          <div id='modal-scroll' className='flex-1 overflow-y-auto px-6 py-6'>
            {activeTab === 'japanese' ? (
              <div className='space-y-6'>
                <CollapsibleSection
                  title={
                    <span className='font-bold text-(--main-color)'>
                      Khuyên dùng (Sách giáo khoa & Chuẩn học tập)
                    </span>
                  }
                  icon={<Star size={16} />}
                  useNewIconDesign
                  level='subsection'
                  defaultOpen={true}
                  storageKey='fonts-modal-recommended'
                  className='gap-3'
                >
                  <div className='grid grid-cols-1 gap-3.5 p-1 sm:grid-cols-2 lg:grid-cols-3'>
                    {recommendedFonts.map(fontObj => (
                      <FontCard
                        key={fontObj.name}
                        fontName={fontObj.name}
                        fontClassName={fontObj.font.className}
                        previewText='日本語 かな道場 漢字'
                        isSelected={selectedJapaneseFont === fontObj.name}
                        isDefault={
                          fontObj.name === 'UD Digi Kyokasho N-R' ||
                          fontObj.name === 'Zen Maru Gothic'
                        }
                        onClick={handleJapaneseFontClick}
                      />
                    ))}
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title={
                    <span className='font-bold text-(--main-color)'>
                      Các phông chữ khác
                    </span>
                  }
                  icon={<BookOpen size={16} />}
                  useNewIconDesign
                  level='subsection'
                  defaultOpen={false}
                  storageKey='fonts-modal-other'
                  className='gap-3'
                >
                  <div className='grid grid-cols-1 gap-3.5 p-1 sm:grid-cols-2 lg:grid-cols-3'>
                    {otherFonts.map(fontObj => (
                      <FontCard
                        key={fontObj.name}
                        fontName={fontObj.name}
                        fontClassName={fontObj.font.className}
                        previewText='日本語 かな道場 漢字'
                        isSelected={selectedJapaneseFont === fontObj.name}
                        isDefault={false}
                        onClick={handleJapaneseFontClick}
                      />
                    ))}
                  </div>
                </CollapsibleSection>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 text-xs font-medium text-(--secondary-color)/80'>
                  <Languages size={15} className='text-(--main-color)' />
                  <span>
                    Phông chữ hiển thị cho các từ dịch nghĩa, câu dịch tiếng
                    Việt và toàn bộ nút bấm giao diện.
                  </span>
                </div>

                <div className='grid grid-cols-1 gap-3.5 p-1 sm:grid-cols-2 lg:grid-cols-3'>
                  {vietnameseFonts.map(fontObj => (
                    <FontCard
                      key={fontObj.name}
                      fontName={fontObj.name}
                      fontClassName={fontObj.font.className}
                      previewText='Mặt trăng đã ló dạng, học tiếng Nhật'
                      isSelected={selectedVietnameseFont === fontObj.name}
                      isDefault={fontObj.name === 'Be Vietnam Pro'}
                      onClick={handleVietnameseFontClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
