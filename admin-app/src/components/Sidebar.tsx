'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Languages,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    label: 'Tổng quan',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Từ Vựng (Vocab)',
    href: '/vocabulary',
    icon: BookOpen,
  },
  {
    label: 'Chữ Hán (Kanji)',
    href: '/kanji',
    icon: Languages,
  },
  {
    label: 'Thành Viên (Users)',
    href: '/users',
    icon: Users,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className='fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#1e1e24] bg-[#0c0c0e] text-slate-300'>
      {/* Brand Header */}
      <div className='flex h-16 items-center gap-3 border-b border-[#1e1e24] px-6'>
        <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-black text-black shadow-lg shadow-amber-500/20'>
          PT
        </div>
        <div>
          <h1 className='text-sm font-bold tracking-tight text-white'>
            PTham Admin
          </h1>
          <p className='text-[10px] font-medium text-amber-500'>
            Quản trị hệ thống
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav className='flex-1 space-y-1.5 p-4'>
        <p className='px-3 py-1 text-[10px] font-bold tracking-wider text-slate-500 uppercase'>
          Chức năng
        </p>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'border border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:bg-[#16161a] hover:text-slate-100'
              }`}
            >
              <Icon
                className={`size-4.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className='border-t border-[#1e1e24] p-4'>
        <button
          onClick={handleLogout}
          className='flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-950/20 hover:text-red-300'
        >
          <LogOut className='size-4.5' />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
