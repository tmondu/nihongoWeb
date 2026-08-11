'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Successful login, clear sessionStorage to force reload fresh DB state
      sessionStorage.removeItem('vocab-cache');
      sessionStorage.removeItem('kanji-cache');
      sessionStorage.setItem('is_logged_in', 'true');

      window.location.href = redirectPath;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-12 text-[#fafafa] selection:bg-rose-500 selection:text-white'>
      <div className='w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 shadow-2xl backdrop-blur-md'>
        <div className='mb-8 text-center'>
          <h1 className='bg-gradient-to-r from-rose-500 via-violet-500 to-indigo-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent'>
            PThamSS
          </h1>
          <p className='mt-2 text-sm text-zinc-400'>
            Đăng nhập để tiếp tục học tập và bảo mật tài khoản
          </p>
        </div>

        {error && (
          <div className='mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-zinc-300'
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none'
              placeholder='ten@viethoc.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-sm font-medium text-zinc-300'
            >
              Mật khẩu
            </label>
            <input
              id='password'
              type='password'
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='flex w-full justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50'
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <p className='mt-8 text-center text-xs text-zinc-500'>
          Chưa có tài khoản?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            className='font-semibold text-rose-500 hover:text-rose-400'
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
