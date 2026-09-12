'use client';
import clsx from 'clsx';
import { useState, useMemo } from 'react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { buttonBorderStyles } from '@/shared/utils/styles';
import fonts from '../../data/fonts/fonts';
import { isRecommendedFont } from '../../data/fonts/recommendedFonts';
import vietnameseFonts from '../../data/fonts/vietnameseFonts';
import { Star, Type, Languages } from 'lucide-react';
import CollapsibleSection from '../shared/CollapsibleSection';

type FontsProps = {
  useNewIconDesign?: boolean;
};

const Fonts = ({ useNewIconDesign = false }: FontsProps) => {
  const { playClick } = useClick();
  const [activeTab, setActiveTab] = useState<'japanese' | 'vietnamese'>(
    'japanese',
  );

  const currentJapaneseFont = usePreferencesStore(state => state.font);
  const setJapaneseFont = usePreferencesStore(state => state.setFont);

  const currentVietnameseFont = usePreferencesStore(
    state => state.vietnameseFont || 'Be Vietnam Pro',
  );
  const setVietnameseFont = usePreferencesStore(
    state => state.setVietnameseFont,
  );

  // Separate fonts into recommended and other categories
  const { recommendedFonts, otherFonts } = useMemo(() => {
    const recommended = fonts.filter(f => isRecommendedFont(f.name));
    const other = fonts.filter(f => !isRecommendedFont(f.name));
    return { recommendedFonts: recommended, otherFonts: other };
  }, []);

  const renderJapaneseFontCard = (fontObj: (typeof fonts)[number]) => (
    <label
      key={fontObj.name}
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center',
        buttonBorderStyles,
        'border-1 border-(--card-color) px-4 py-4',
        'flex-1',
      )}
      style={{
        outline: 'none',
        backgroundColor:
          fontObj.name === currentJapaneseFont
            ? 'var(--secondary-color)'
            : 'var(--card-color)',
        transition: 'background-color 275ms, color 275ms',
      }}
      onClick={() => {
        playClick();
        setJapaneseFont(fontObj.name);
      }}
    >
      <input
        type='radio'
        name='selectedJapaneseFont'
        checked={fontObj.name === currentJapaneseFont}
        onChange={() => {
          setJapaneseFont(fontObj.name);
        }}
        className='hidden'
      />
      <p
        className={clsx(
          'text-center text-lg font-bold',
          fontObj.font.className,
        )}
      >
        <span
          style={{
            color:
              fontObj.name === currentJapaneseFont
                ? 'var(--background-color)'
                : 'var(--main-color)',
          }}
        >
          {fontObj.name}
          {(fontObj.name === 'UD Digi Kyokasho N-R' ||
            fontObj.name === 'Zen Maru Gothic') && (
            <span
              style={{
                color:
                  fontObj.name === currentJapaneseFont
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
        className={clsx('mt-1 text-sm tracking-wide', fontObj.font.className)}
        style={{
          color:
            fontObj.name === currentJapaneseFont
              ? 'var(--background-color)'
              : 'var(--secondary-color)',
        }}
      >
        日本語 かな道場
      </p>
    </label>
  );

  const renderVietnameseFontCard = (
    fontObj: (typeof vietnameseFonts)[number],
  ) => (
    <label
      key={fontObj.name}
      className={clsx(
        'flex cursor-pointer flex-col items-center justify-center',
        buttonBorderStyles,
        'border-1 border-(--card-color) px-4 py-4',
        'flex-1',
      )}
      style={{
        outline: 'none',
        backgroundColor:
          fontObj.name === currentVietnameseFont
            ? 'var(--secondary-color)'
            : 'var(--card-color)',
        transition: 'background-color 275ms, color 275ms',
      }}
      onClick={() => {
        playClick();
        setVietnameseFont(fontObj.name);
      }}
    >
      <input
        type='radio'
        name='selectedVietnameseFont'
        checked={fontObj.name === currentVietnameseFont}
        onChange={() => {
          setVietnameseFont(fontObj.name);
        }}
        className='hidden'
      />
      <p
        className={clsx(
          'text-center text-lg font-bold',
          fontObj.font.className,
        )}
      >
        <span
          style={{
            color:
              fontObj.name === currentVietnameseFont
                ? 'var(--background-color)'
                : 'var(--main-color)',
          }}
        >
          {fontObj.name}
          {fontObj.name === 'Be Vietnam Pro' && (
            <span
              style={{
                color:
                  fontObj.name === currentVietnameseFont
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
        className={clsx('mt-1 text-sm tracking-wide', fontObj.font.className)}
        style={{
          color:
            fontObj.name === currentVietnameseFont
              ? 'var(--background-color)'
              : 'var(--secondary-color)',
        }}
      >
        Mặt trăng đã ló dạng, học tiếng Nhật
      </p>
    </label>
  );

  return (
    <div className='flex flex-col gap-6'>
      {/* Language Switch Tabs */}
      <div className='flex rounded-2xl border border-(--border-color)/80 bg-(--card-color)/60 p-1'>
        <button
          type='button'
          onClick={() => {
            playClick();
            setActiveTab('japanese');
          }}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all sm:text-sm',
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
            'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all sm:text-sm',
            activeTab === 'vietnamese'
              ? 'bg-(--secondary-color) text-(--background-color) shadow-xs'
              : 'text-(--secondary-color) hover:text-(--main-color)',
          )}
        >
          <span>🇻🇳</span>
          <span>Phông Tiếng Việt (Giao diện)</span>
        </button>
      </div>

      {activeTab === 'japanese' ? (
        <>
          {/* Recommended Fonts Section */}
          <CollapsibleSection
            title='Khuyên dùng (Sách giáo khoa & Chuẩn)'
            icon={<Star size={18} />}
            useNewIconDesign={useNewIconDesign}
            level='subsubsection'
            defaultOpen={true}
            storageKey='prefs-fonts-recommended'
          >
            <fieldset
              className={clsx(
                'grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
              )}
            >
              {recommendedFonts.map(renderJapaneseFontCard)}
            </fieldset>
          </CollapsibleSection>

          {/* Other Fonts Section */}
          <CollapsibleSection
            title='Các phông chữ khác'
            icon={<Type size={18} />}
            useNewIconDesign={useNewIconDesign}
            level='subsubsection'
            defaultOpen={false}
            storageKey='prefs-fonts-other'
          >
            <fieldset
              className={clsx(
                'grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
              )}
            >
              {otherFonts.map(renderJapaneseFontCard)}
            </fieldset>
          </CollapsibleSection>

          <div className='flex flex-col gap-2 pt-2'>
            <h4 className='text-lg font-bold'>
              Xem trước Hiragana & Katakana:
            </h4>
            <p
              className='font-japanese text-3xl text-(--secondary-color)'
              lang='ja'
            >
              {'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん'.slice(
                0,
                20,
              )}
            </p>
            <h4 className='text-lg font-bold'>Xem trước chữ Kanji:</h4>
            <p
              className='font-japanese text-3xl text-(--secondary-color)'
              lang='ja'
            >
              人日大小学 校生先円上下中外右左名前時分国
            </p>
          </div>
        </>
      ) : (
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-xs font-medium text-(--secondary-color)/80'>
            <Languages size={16} className='text-(--main-color)' />
            <span>
              Phông chữ hiển thị cho các từ dịch nghĩa, câu dịch tiếng Việt và
              toàn bộ nút bấm giao diện.
            </span>
          </div>

          <fieldset
            className={clsx(
              'grid grid-cols-1 gap-4 p-1 sm:grid-cols-2 md:grid-cols-3',
            )}
          >
            {vietnameseFonts.map(renderVietnameseFontCard)}
          </fieldset>

          <div className='flex flex-col gap-2 rounded-2xl border border-(--border-color)/60 bg-(--card-color) p-5 pt-4'>
            <h4 className='text-base font-bold text-(--main-color)'>
              Xem trước câu mẫu Tiếng Việt:
            </h4>
            <p className='text-xl leading-relaxed text-(--secondary-color)'>
              Mặt trăng đã ló dạng. Nhiều tháng trôi qua mà vẫn không có tin tức
              gì về anh.
            </p>
            <p className='text-sm text-(--secondary-color)/80'>
              Bảng chữ cái đầy đủ dấu tiếng Việt: a à á ả ã ạ ă ằ ắ ẳ ẵ ặ â ầ ấ
              ẩ ẫ ậ e è é ẻ ẽ ẹ ê ề ế ể ễ ệ o ò ó ỏ õ ọ ô ồ ố ổ ỗ ộ ơ ờ ớ ở ỡ ợ
              u ù ú ủ ũ ụ ư ừ ứ ử ữ ự i ì í ỉ ĩ ị y ỳ ý ỷ ỹ ỵ d đ.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fonts;
