import type { Metadata } from 'next';
import { routing } from '@/core/i18n/routing';
import { Moon } from 'lucide-react';

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isVi = locale === 'vi';
  return {
    title: isVi ? 'Chúc Bạn Ngủ Ngon 🌙 | PThamSS' : 'Good Night 🌙 | PThamSS',
    robots: {
      index: false,
      follow: false,
    },
  };
}

interface SleepPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SleepPage({ params }: SleepPageProps) {
  const { locale } = await params;
  const isVi = locale === 'vi';

  return (
    <div className='relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-radial from-slate-900 to-slate-950 text-white'>
      {/* Background Starry Sky Twinkling Effects */}
      <div className='absolute inset-0 z-0'>
        <div className='absolute top-[20%] left-[30%] h-1 w-1 animate-pulse rounded-full bg-white opacity-40 duration-1000' />
        <div className='absolute top-[40%] left-[75%] h-1.5 w-1.5 animate-pulse rounded-full bg-white opacity-60 duration-700' />
        <div className='absolute top-[70%] left-[15%] h-1 w-1 animate-pulse rounded-full bg-white opacity-30 duration-1500' />
        <div className='absolute top-[80%] left-[60%] h-2 w-2 animate-pulse rounded-full bg-white opacity-50 duration-1000' />
        <div className='absolute top-[10%] left-[85%] h-1 w-1 animate-pulse rounded-full bg-white opacity-40 duration-2000' />
        <div className='absolute top-[60%] left-[90%] h-1.5 w-1.5 animate-pulse rounded-full bg-white opacity-70 duration-500' />
      </div>

      {/* Main Content Card */}
      <div className='z-10 flex max-w-lg flex-col items-center px-6 text-center'>
        {/* Glowing floating Moon */}
        <div className='relative mb-8 flex h-24 w-24 animate-bounce items-center justify-center rounded-full bg-indigo-500/10 text-yellow-200 shadow-[0_0_50px_rgba(234,179,8,0.2)] duration-[3000ms]'>
          <Moon className='size-16 fill-current drop-shadow-[0_0_15px_rgba(254,240,138,0.6)]' />
        </div>

        {/* Localized message */}
        <h1 className='mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl'>
          <span className='bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-200 bg-clip-text text-transparent'>
            {isVi ? 'Chúc bạn ngủ ngon!' : 'Good Night!'}
          </span>{' '}
          🌙
        </h1>

        <p className='text-base leading-relaxed font-medium text-slate-300'>
          {isVi
            ? 'Hãy tắt màn hình thiết bị, nhắm mắt lại và dành cho bản thân thời gian nghỉ ngơi thật trọn vẹn nhé.'
            : 'It is time to turn off your screen, close your eyes, and get some well-deserved rest.'}
        </p>

        <p className='mt-6 text-sm text-slate-500 italic'>
          {isVi
            ? 'Hẹn gặp lại bạn vào ngày mai khi tràn đầy năng lượng! ✨'
            : 'See you tomorrow with fresh energy! ✨'}
        </p>
      </div>
    </div>
  );
}
