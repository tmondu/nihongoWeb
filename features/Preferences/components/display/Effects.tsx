'use client';
import clsx from 'clsx';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { buttonBorderStyles } from '@/shared/utils/styles';
import { useHasFinePointer } from '@/shared/hooks/generic/useHasFinePointer';
import { EFFECTS, CLICK_EFFECTS } from '../../data/effects/effectsData';
import { CLICK_SOUND_OPTIONS } from '../../data/audio/clickSounds';
import CollapsibleSection from '../shared/CollapsibleSection';
import { MousePointer2, Volume2, Zap, PenTool } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

function EffectCard({
  name,
  emoji,
  isSelected,
  onSelect,
  onClick,
  group,
}: {
  name: string;
  emoji: string;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
  group: 'cursor-trail' | 'click';
}) {
  return (
    <label
      className={clsx(
        'flex h-20 flex-col items-center justify-center gap-1',
        buttonBorderStyles,
        'rounded-3xl',
        'border border-(--card-color)',
        'cursor-pointer px-2 py-2.5',
      )}
      onClick={onClick}
      style={{
        backgroundColor: isSelected ? 'var(--secondary-color)' : undefined,
        transition: 'background-color 275ms',
      }}
    >
      <input
        type='radio'
        name={`effect-${group}`}
        className='hidden'
        onChange={onSelect}
        checked={isSelected}
        aria-label={name}
      />
      <span className='text-xl'>{emoji}</span>
      <span
        className={clsx(
          'text-center text-xs font-semibold select-none',
          isSelected ? 'text-(--background-color)' : 'text-(--main-color)',
        )}
      >
        {name.toLowerCase()}
      </span>
    </label>
  );
}

function SoundEffectCard({
  name,
  isSelected,
  onSelect,
  onClick,
}: {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  return (
    <label
      className={clsx(
        'flex min-h-20 items-center justify-center text-center',
        buttonBorderStyles,
        'rounded-3xl border border-(--card-color) px-3 py-4',
        'cursor-pointer',
      )}
      onClick={onClick}
      style={{
        backgroundColor: isSelected ? 'var(--secondary-color)' : undefined,
        transition: 'background-color 275ms',
      }}
    >
      <input
        type='radio'
        name='effect-sound'
        className='hidden'
        onChange={onSelect}
        checked={isSelected}
        aria-label={name}
      />
      <span
        className='text-lg leading-tight'
        style={{
          color: isSelected ? 'var(--background-color)' : 'var(--main-color)',
          transition: 'color 275ms',
        }}
      >
        {name.toLowerCase()}
      </span>
    </label>
  );
}

type EffectsProps = {
  useNewIconDesign?: boolean;
};

const Effects = ({ useNewIconDesign = false }: EffectsProps) => {
  const hasFinePointer = useHasFinePointer();
  const { playClick, playClickById } = useClick();
  const customCursor = usePreferencesStore(s => s.customCursor);
  const setCustomCursor = usePreferencesStore(s => s.setCustomCursor);
  const cursorTrailEffect = usePreferencesStore(s => s.cursorTrailEffect);
  const setCursorTrailEffect = usePreferencesStore(s => s.setCursorTrailEffect);
  const clickEffect = usePreferencesStore(s => s.clickEffect);
  const setClickEffect = usePreferencesStore(s => s.setClickEffect);
  const clickSoundId = usePreferencesStore(s => s.clickSoundId);
  const setClickSoundId = usePreferencesStore(s => s.setClickSoundId);

  return (
    <div className='flex flex-col gap-6'>
      {hasFinePointer && (
        <CollapsibleSection
          title='Calligraphy Cursor'
          icon={<PenTool size={18} />}
          useNewIconDesign={useNewIconDesign}
          level='subsection'
          defaultOpen={true}
          storageKey='prefs-effects-fude-cursor'
        >
          <div className='flex items-center justify-between rounded-2xl border border-(--border-color) bg-(--card-color)/40 p-4 transition-colors hover:border-(--main-color)/40'>
            <div className='flex items-center gap-3.5'>
              <div className='flex size-11 items-center justify-center rounded-xl border border-(--border-color) bg-(--card-color) shadow-xs'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src='/cursors/fude-default.svg'
                  alt='Bút lông thư pháp Fude'
                  className='size-7 drop-shadow-xs select-none'
                />
              </div>
              <div>
                <p className='text-sm font-bold text-(--main-color)'>
                  Bút lông thư pháp (Fude Brush)
                </p>
                <p className='text-xs text-(--secondary-color)/70'>
                  Con trỏ chuột phong cách cọ thư pháp Nhật Bản truyền thống
                  (chuyển mực đỏ son khi di vào nút bấm)
                </p>
              </div>
            </div>
            <label className='relative inline-flex cursor-pointer items-center'>
              <input
                type='checkbox'
                checked={customCursor}
                onChange={e => {
                  setCustomCursor(e.target.checked);
                  playClick();
                }}
                className='peer sr-only'
              />
              <div className="peer h-6 w-11 rounded-full border border-(--border-color) bg-(--card-color) peer-checked:border-(--main-color) peer-checked:bg-(--main-color) after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-(--background-color) after:transition-all after:content-[''] peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title='Sound Effects'
        icon={<Volume2 size={18} />}
        useNewIconDesign={useNewIconDesign}
        level='subsection'
        defaultOpen={true}
        storageKey='prefs-effects-click-sounds'
      >
        <fieldset className='grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
          {CLICK_SOUND_OPTIONS.map(option => {
            const isSelected = clickSoundId === option.id;
            return (
              <SoundEffectCard
                key={option.id}
                name={option.label}
                isSelected={isSelected}
                onSelect={() => setClickSoundId(option.id)}
                onClick={() => playClickById(option.id)}
              />
            );
          })}
        </fieldset>
      </CollapsibleSection>

      {hasFinePointer && (
        <CollapsibleSection
          title='Cursor Trail'
          icon={<MousePointer2 size={18} />}
          useNewIconDesign={useNewIconDesign}
          level='subsection'
          defaultOpen={true}
          storageKey='prefs-effects-cursor'
        >
          <fieldset className='grid grid-cols-4 gap-3 p-1 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7'>
            {EFFECTS.map(effect => (
              <EffectCard
                key={effect.id}
                name={effect.name}
                emoji={effect.emoji}
                isSelected={cursorTrailEffect === effect.id}
                onSelect={() => setCursorTrailEffect(effect.id)}
                onClick={() => playClick()}
                group='cursor-trail'
              />
            ))}
          </fieldset>
        </CollapsibleSection>
      )}

      <CollapsibleSection
        title='Click Effects'
        icon={<Zap size={18} />}
        useNewIconDesign={useNewIconDesign}
        level='subsection'
        defaultOpen={true}
        storageKey='prefs-effects-click'
      >
        <fieldset className='grid grid-cols-4 gap-3 p-1 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7'>
          {CLICK_EFFECTS.map(effect => (
            <EffectCard
              key={effect.id}
              name={effect.name}
              emoji={effect.emoji}
              isSelected={clickEffect === effect.id}
              onSelect={() => setClickEffect(effect.id)}
              onClick={() => playClick()}
              group='click'
            />
          ))}
        </fieldset>
      </CollapsibleSection>
    </div>
  );
};

export default Effects;
