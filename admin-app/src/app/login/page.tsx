/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Đăng nhập không thành công');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#09090b] p-4 text-slate-100'>
      <div className='w-full max-w-md space-y-6 rounded-3xl border border-[#1e1e24] bg-[#0c0c0e] p-8 shadow-2xl'>
        {/* Brand */}
        <div className='flex flex-col items-center text-center'>
          <div className='flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 font-black text-black shadow-lg shadow-amber-500/20'>
            PT
          </div>
          <h1 className='mt-4 text-xl font-black tracking-tight text-white'>
            PTham Admin Portal
          </h1>
          <p className='mt-1 text-xs text-slate-400'>
            Đăng nhập để quản lý cơ sở dữ liệu và thành viên
          </p>
        </div>

        {error && (
          <div className='flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-400'>
            <AlertCircle className='size-4 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className='space-y-4'>
          <div>
            <label className='block text-xs font-semibold text-slate-300'>
              Tên tài khoản
            </label>
            <div className='relative mt-1.5'>
              <User className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
              <input
                type='text'
                placeholder='admin'
                value={username}
                onChange={e => setUsername(e.target.value)}
                className='w-full rounded-xl border border-[#1e1e24] bg-[#121215] py-2.5 pr-3 pl-9 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none'
              />
            </div>
          </div>

          <div>
            <label className='block text-xs font-semibold text-slate-300'>
              Mật khẩu
            </label>
            <div className='relative mt-1.5'>
              <Lock className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
              <input
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={e => setPassword(e.target.value)}
                className='w-full rounded-xl border border-[#1e1e24] bg-[#121215] py-2.5 pr-3 pl-9 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50'
          >
            {loading ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <ShieldCheck className='size-4' />
            )}
            Đăng Nhập Quản Trị
          </button>
        </form>
      </div>
    </div>
  );
}
