'use client';

import React from 'react';
import { Link } from '@/core/i18n/routing';
import {
  ScrollText,
  FileLock2,
  Cookie,
  Sun,
  Moon,
  Heart,
  FileDiff,
} from 'lucide-react';
import clsx from 'clsx';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useThemePreferences } from '@/features/Preferences';
import HomeSearchHub from './components/HomeSearchHub';

const legalLinks = [
  { name: 'terms', href: '/terms', icon: ScrollText },
  { name: 'privacy', href: '/privacy', icon: Cookie },
  { name: 'security', href: '/security', icon: FileLock2 },
  { name: 'patch notes', href: '/patch-notes', icon: FileDiff },
];

export default function MainMenu() {
  const { theme, setTheme } = useThemePreferences();
  const { playClick } = useClick();

  return (
    <div className='flex w-full flex-col items-center gap-6 px-1 pt-2 pb-12 sm:px-2 md:pt-4'>
      {/* Top Header: Brand identity right next to sidebar */}
      <header className='flex w-full max-w-4xl items-center justify-between border-b border-(--border-color)/50 pb-4'>
        <div className='flex items-center gap-3'>
          <Link
            href='/'
            className='group flex items-center gap-2 select-none'
            title='PThamSS Trang chủ'
          >
            <h1 className='flex items-center gap-1.5 text-2xl font-black tracking-tight text-(--main-color) sm:text-3xl'>
              PThamSS
              <Heart className='inline-block size-5 fill-current text-red-500 transition-transform group-hover:scale-110 sm:size-6' />
            </h1>
          </Link>
          <span className='hidden h-5 w-[1px] bg-(--border-color) md:inline-block' />
        </div>

        {/* Theme Toggle Button */}
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={() => {
              playClick();
              setTheme(theme === 'dark' ? 'light' : 'dark');
            }}
            className={clsx(
              'flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-(--border-color) bg-(--card-color)',
              'text-(--secondary-color) transition-all hover:border-(--main-color) hover:text-(--main-color) active:scale-95',
            )}
            aria-label='Toggle theme'
            title={
              theme === 'dark'
                ? 'Chuyển giao diện sáng'
                : 'Chuyển giao diện tối'
            }
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Center Search Hub & Handwriting Canvas */}
      <main className='flex w-full justify-center'>
        <HomeSearchHub />
      </main>

      {/* Subtle Footer Links */}
      <footer className='mt-8 flex w-full max-w-4xl flex-wrap items-center justify-center gap-4 border-t border-(--border-color)/40 pt-6 text-xs text-(--secondary-color) sm:justify-between'>
        <span className='text-xs opacity-70'>
          © {new Date().getFullYear()} PThamSS. Đồng hành học tiếng Nhật mỗi
          ngày.
        </span>
        <div className='flex items-center gap-4'>
          {legalLinks.map((link, i) => (
            <Link
              href={link.href}
              prefetch={false}
              key={i}
              className='flex items-center gap-1.5 transition-colors hover:text-(--main-color)'
              onClick={() => playClick()}
            >
              <link.icon className='size-3.5' />
              <span className='capitalize'>{link.name}</span>
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
