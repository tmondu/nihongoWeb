'use client';

import { Link } from '@/core/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { Search, LayoutGrid, ArrowRight } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { cardBorderStyles } from '@/shared/utils/styles';
import clsx from 'clsx';

export const KanjiQuickNav = () => {
  const t = useTranslations('navigation.menu');
  const locale = useLocale();
  const { playClick } = useClick();

  const isVi = locale === 'vi';
  const isEs = locale === 'es';

  const navItems = [
    {
      href: '/kanji/search',
      title: t('kanjiSearch'),
      description: isVi
        ? 'Tra cứu theo âm Hán, Onyomi, Kunyomi'
        : isEs
          ? 'Buscar por Onyomi, Kunyomi y significado'
          : 'Lookup by Onyomi, Kunyomi & meanings',
      icon: Search,
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    },
    {
      href: '/kanji/thamkanji',
      title: t('thamKanji'),
      description: isVi
        ? 'Bảng tổng hợp Hán tự JLPT N5 - N1'
        : isEs
          ? 'Tabla de referencia Kanji JLPT N5 - N1'
          : 'JLPT N5 - N1 Kanji Reference Table',
      icon: LayoutGrid,
      badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    },
  ];

  return (
    <div className='flex w-full flex-col gap-2.5 lg:hidden'>
      <div className='grid grid-cols-2 gap-2.5'>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              onClick={playClick}
              className={clsx(
                'group relative flex flex-col justify-between gap-2 overflow-hidden rounded-2xl p-3.5 transition-all duration-200',
                'bg-(--card-color) active:scale-[0.98]',
                'hover:border-(--main-color)/40 hover:shadow-md',
                cardBorderStyles,
              )}
            >
              <div className='flex items-center justify-between'>
                <div
                  className={clsx(
                    'flex size-9 items-center justify-center rounded-xl border',
                    item.badgeColor,
                  )}
                >
                  <Icon className='size-4.5' />
                </div>
                <ArrowRight className='size-4 text-(--secondary-color) transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-(--main-color)' />
              </div>

              <div className='flex flex-col'>
                <span className='text-base font-bold text-(--main-color)'>
                  {item.title}
                </span>
                <span className='line-clamp-1 text-xs text-(--secondary-color)'>
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default KanjiQuickNav;
