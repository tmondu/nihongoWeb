'use client';

import { Database, ShieldCheck, ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className='sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1e1e24] bg-[#09090b]/80 px-8 backdrop-blur-md'>
      {/* Database Status */}
      <div className='flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400'>
        <span className='size-2 animate-pulse rounded-full bg-emerald-400' />
        <Database className='size-3.5' />
        <span>MySQL Live Connected</span>
      </div>

      {/* Right Controls */}
      <div className='flex items-center gap-4'>
        <a
          href='https://www.pthamnihongo.site'
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-amber-400'
        >
          <span>Xem web học</span>
          <ExternalLink className='size-3.5' />
        </a>

        <div className='flex items-center gap-2 border-l border-[#1e1e24] pl-4'>
          <div className='flex size-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30'>
            <ShieldCheck className='size-4' />
          </div>
          <span className='text-xs font-bold text-slate-200'>Admin</span>
        </div>
      </div>
    </header>
  );
}
