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
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030303] px-4 py-12 text-[#fafafa] selection:bg-blue-500 selection:text-white'>
      {/* Liquid background blobs */}
      <div className='pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-blue-500/20 mix-blend-screen blur-[120px]' />
      <div className='pointer-events-none absolute right-1/4 bottom-1/4 h-96 w-96 translate-x-1/2 translate-y-1/2 animate-pulse rounded-full bg-cyan-500/20 mix-blend-screen blur-[120px] [animation-delay:2s]' />
      <div className='pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 mix-blend-screen blur-[150px]' />

      {/* Glassmorphic Card Container */}
      <div className='relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-xl transition-all duration-500 hover:border-white/20'>
        <div className='mb-8 text-center'>
          <h1 className='bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)] filter'>
            PThamSS
          </h1>
          <p className='mt-3 text-xs font-semibold tracking-wide text-zinc-400 uppercase'>
            Đăng nhập để tiếp tục học tập và bảo mật tài khoản
          </p>
        </div>

        {error && (
          <div className='mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400 backdrop-blur-md'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='email'
              className='block text-xs font-semibold tracking-wider text-zinc-300 uppercase'
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='mt-2 block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 shadow-sm transition-all duration-300 focus:border-blue-500 focus:bg-white/[0.07] focus:ring-1 focus:ring-blue-500 focus:outline-none'
              placeholder='@gmail.com'
            />
          </div>

          <div>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='password'
                className='block text-xs font-semibold tracking-wider text-zinc-300 uppercase'
              >
                Mật khẩu
              </label>
              <Link
                href='/forgot-password'
                className='text-xs font-semibold text-blue-400 decoration-2 transition-colors duration-200 hover:text-blue-300 hover:underline'
              >
                Quên mật khẩu?
              </Link>
            </div>
            <input
              id='password'
              type='password'
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='mt-2 block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 shadow-sm transition-all duration-300 focus:border-blue-500 focus:bg-white/[0.07] focus:ring-1 focus:ring-blue-500 focus:outline-none'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_4px_20px_0_rgba(59,130,246,0.3)] transition-colors duration-300 hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50'
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <p className='mt-8 text-center text-xs text-zinc-500'>
          Chưa có tài khoản?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            className='font-bold text-blue-400 decoration-2 transition-colors duration-200 hover:text-blue-300 hover:underline'
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
