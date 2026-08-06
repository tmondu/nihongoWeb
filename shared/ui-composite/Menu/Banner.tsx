'use client';

import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import { removeLocaleFromPath } from '@/shared/utils/pathUtils';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

const USE_NEW_BADGE_DESIGN = true;

const newBadgeClasses =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-6 border-(--secondary-color-accent) bg-(--secondary-color) leading-none text-(--background-color) motion-safe:animate-float [--float-distance:-4px]';

const Banner = () => {
  const pathname = usePathname();
  const t = useTranslations('navigation.menu');
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const isKanaRoute = pathWithoutLocale.startsWith('/kana');
  const isKanjiRoute = pathWithoutLocale.startsWith('/kanji');
  const isVocabRoute = pathWithoutLocale.startsWith('/vocabulary');
  const isPreferencesRoute = pathWithoutLocale === '/preferences';
  const shouldShowBanner =
    isKanaRoute || isKanjiRoute || isVocabRoute || isPreferencesRoute;

  if (!shouldShowBanner) {
    return null;
  }

  const text = isKanaRoute
    ? t('kana')
    : isKanjiRoute
      ? t('kanji')
      : isVocabRoute
        ? t('vocabulary')
        : isPreferencesRoute
          ? t('preferences')
          : '';

  const symbol = isKanaRoute
    ? 'あ'
    : isKanjiRoute
      ? '字'
      : isVocabRoute
        ? '語'
        : isPreferencesRoute
          ? '✨'
          : '';

  return (
    <h2
      className={clsx(
        'pt-3 text-3xl lg:pt-6',
        USE_NEW_BADGE_DESIGN
          ? 'flex items-center gap-2 overflow-visible'
          : 'flex items-center gap-2 overflow-hidden',
      )}
    >
      {USE_NEW_BADGE_DESIGN ? (
        <>
          <span className={newBadgeClasses}>
            {isPreferencesRoute ? <Sparkles size={22} /> : symbol}
          </span>
          <span>{text}</span>
        </>
      ) : (
        <>
          <span className='flex items-center justify-center text-(--secondary-color)'>
            {isPreferencesRoute ? <Sparkles size={28} /> : symbol}
          </span>
          <span>{text}</span>
        </>
      )}
    </h2>
  );
};

export default Banner;
