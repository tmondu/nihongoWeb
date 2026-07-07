// import { Link } from '@/i18n/routing';

import { ReactNode } from 'react';

// Updated to receive translations as a parameter instead of using hook
export default function translationGen(t: any) {
  const info = {
    '/': {
      header: (
        <p className='flex flex-1 items-center gap-2 overflow-hidden'>
          {/* render localized content */}
          <span>{t('greeting')}</span>
          <i className='mt-1.5 text-xs text-(--secondary-color) max-md:hidden'>
            {/* v0.1.5 (alpha) */}
          </i>
        </p>
      ),
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>{t('description')}</p>
          <p className='text-lg text-(--secondary-color)'>
            {t('instructions')}
          </p>
        </>
      ),
    },
    '/kana': {
      header: <span>{t('kana.header')}</span>,
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>
            {t('kana.content1')}
          </p>
          <p className='text-lg text-(--secondary-color)'>
            {t.rich('kana.content2', {
              b: (chunks: ReactNode) => <b>{chunks}</b>
            })}
          </p>
        </>
      ),
    },
    '/kanji': {
      header: <span>{t('kanji.header')}</span>,
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>
            {t('kanji.content1')}
          </p>
          <p className='text-lg text-(--secondary-color)'>
            {t.rich('kanji.content2', {
              b: (chunks: ReactNode) => <b>{chunks}</b>
            })}
          </p>
          <p className='text-lg italic'>
            {t.rich('kanji.content3', {
              a: (chunks: ReactNode) => (
                <a
                  href='http://kanjiheatmap.com/'
                  className='hover:underline'
                  rel='noopener'
                  target='_blank'
                >
                  {chunks}
                </a>
              )
            })}
          </p>
        </>
      ),
    },
    '/vocabulary': {
      header: <span>{t('vocabulary.header')}</span>,
      content: (
        <>
          <p className='text-lg text-(--secondary-color)'>
            {t('vocabulary.content1')}
          </p>
          <p className='text-lg text-(--secondary-color)'>
            {t.rich('vocabulary.content2', {
              b: (chunks: ReactNode) => <b>{chunks}</b>
            })}
          </p>
          <p className='text-lg italic'>
            {t.rich('vocabulary.content3', {
              a: (chunks: ReactNode) => (
                <a
                  href='https://jisho.org/'
                  className='hover:underline'
                  rel='noopener'
                  target='_blank'
                >
                  {chunks}
                </a>
              )
            })}
          </p>
        </>
      ),
    },

    jlptMenu: {
      header: <span>{t('jlptMenu.header')}</span>,
      content: (
        <p className='text-lg text-(--secondary-color)'>
          {t('jlptMenu.content')}
        </p>
      ),
    },
    groupMenu: {
      header: <span>{t('groupMenu.header')}</span>,
      content: (
        <p className='text-lg text-(--secondary-color)'>
          {t.rich('groupMenu.content', {
            br: () => <br />
          })}
        </p>
      ),
    },
    wordClassMenu: {
      header: <span>{t('wordClassMenu.header')}</span>,
      content: (
        <p className='text-lg text-(--secondary-color)'>
          {t('wordClassMenu.content')}
        </p>
      ),
    },
  };

  return info;
}

