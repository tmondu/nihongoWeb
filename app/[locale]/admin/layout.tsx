import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyJwt } from '@/shared/utils/auth';
import { getDbPool } from '@/shared/infra/server/db';
import { RowDataPacket } from 'mysql2';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

import AdminLogoutButton from '@/shared/ui/components/AdminLogoutButton';

async function checkAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const payload = await verifyJwt(token);
  if (!payload || !payload.userId) return null;

  try {
    const pool = getDbPool();
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id, email, is_approved, is_admin FROM users WHERE id = ?',
      [payload.userId as number],
    );
    const user = users[0];
    if (user && user.is_admin && user.is_approved) {
      return user;
    }
  } catch (e) {
    console.error('Failed to verify admin layout:', e);
  }
  return null;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await checkAdmin();

  // If not authenticated or not an admin, redirect to homepage
  if (!admin) {
    redirect('/');
  }

  return (
    <div className='flex min-h-screen bg-[#0d0d0f] font-sans text-slate-100 antialiased'>
      {/* Sidebar */}
      <aside className='flex w-64 shrink-0 flex-col border-r border-[#1a1a1f] bg-[#09090b] select-none'>
        {/* Brand Logo */}
        <div className='flex h-16 items-center gap-3 border-b border-[#1a1a1f] px-6'>
          <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-lg font-bold text-black shadow-md shadow-amber-500/20'>
            BO
          </div>
          <div>
            <h1 className='text-sm leading-tight font-bold tracking-tight text-white'>
              PThamSS Admin
            </h1>
            <p className='text-[10px] font-medium text-slate-500'>
              BẢNG ĐIỀU KHIỂN
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className='flex-1 space-y-1 px-4 py-6'>
          <Link
            href='/admin'
            className='group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-[#16161a] hover:text-white'
          >
            <LayoutDashboard className='size-4 text-slate-400 transition-colors group-hover:text-amber-400' />
            Tổng quan
          </Link>
          <Link
            href='/admin/users'
            className='group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-[#16161a] hover:text-white'
          >
            <Users className='size-4 text-slate-400 transition-colors group-hover:text-amber-400' />
            Thành viên
          </Link>
          <Link
            href='/admin/vocabulary'
            className='group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-[#16161a] hover:text-white'
          >
            <BookOpen className='size-4 text-slate-400 transition-colors group-hover:text-amber-400' />
            Từ vựng
          </Link>
          <Link
            href='/admin/kanji'
            className='group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-[#16161a] hover:text-white'
          >
            <Sparkles className='size-4 text-slate-400 transition-colors group-hover:text-amber-400' />
            Chữ Kanji
          </Link>
        </nav>

        {/* Footer actions */}
        <div className='space-y-1 border-t border-[#1a1a1f] bg-[#09090b] p-4'>
          <Link
            href='/'
            className='flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-[#16161a] hover:text-white'
          >
            <ArrowLeft className='size-3.5' />
            Quay lại ứng dụng
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
        {/* Header */}
        <header className='flex h-16 shrink-0 items-center justify-between border-b border-[#1a1a1f] bg-[#09090b] px-8'>
          <div className='flex items-center gap-2'>
            <span className='rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500'>
              Admin Mode
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <span className='font-mono text-xs text-slate-400 select-all'>
              {admin.email}
            </span>
            <div className='flex h-8 w-8 items-center justify-center rounded-full border border-[#2b2b35] bg-[#1a1a1f] text-xs font-bold text-amber-400'>
              AD
            </div>
          </div>
        </header>

        {/* Main Content scrollable container */}
        <main className='flex-1 overflow-y-auto p-8'>
          <div className='animate-in fade-in mx-auto max-w-6xl space-y-8 duration-300'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
