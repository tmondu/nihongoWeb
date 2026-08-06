'use client';

import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className='flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2 text-left text-xs font-medium text-red-400 transition-all hover:bg-red-950/20 hover:text-red-300'
    >
      <LogOut className='size-3.5' />
      Đăng xuất
    </button>
  );
}
