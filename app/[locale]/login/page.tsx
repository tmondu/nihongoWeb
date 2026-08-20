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
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-(--background-color) px-4 py-12 text-(--main-color) selection:bg-(--main-color)/20 selection:text-(--main-color)'>
      {/* Liquid background blobs using main theme color */}
      <div className='pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--main-color)/5 blur-[150px]' />

      {/* Glassmorphic Card Container */}
      <div className='relative z-10 w-full max-w-md rounded-3xl border border-(--border-color) bg-(--card-color) p-8 shadow-xl transition-all duration-500 hover:border-(--main-color)/20'>
        <div className='mb-8 text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-(--main-color)'>
            PThamSS
          </h1>
          <p className='mt-3 text-xs font-semibold tracking-wide text-(--secondary-color) uppercase'>
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
              className='block text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'
            >
              Email
            </label>
            <input
              id='email'
              type='email'
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='mt-2 block w-full rounded-xl border border-(--border-color) bg-(--background-color) px-4 py-3 text-sm text-(--main-color) placeholder-(--secondary-color)/40 shadow-sm transition-all duration-300 focus:border-(--main-color) focus:ring-1 focus:ring-(--main-color) focus:outline-none'
              placeholder='@gmail.com'
            />
          </div>

          <div>
            <div className='flex items-center justify-between'>
              <label
                htmlFor='password'
                className='block text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'
              >
                Mật khẩu
              </label>
              <Link
                href='/forgot-password'
                className='text-xs font-semibold text-(--main-color) transition-colors hover:text-(--secondary-color) hover:underline'
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
              className='mt-2 block w-full rounded-xl border border-(--border-color) bg-(--background-color) px-4 py-3 text-sm text-(--main-color) placeholder-(--secondary-color)/40 shadow-sm transition-all duration-300 focus:border-(--main-color) focus:ring-1 focus:ring-(--main-color) focus:outline-none'
              placeholder='••••••••'
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='relative flex w-full justify-center rounded-xl border-b-4 border-(--main-color-accent) bg-(--main-color) px-4 py-3 text-sm font-bold text-(--background-color) shadow-md transition-all hover:brightness-110 active:brightness-95 disabled:pointer-events-none disabled:opacity-50'
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <p className='mt-8 text-center text-xs text-(--secondary-color)/85'>
          Chưa có tài khoản?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            className='font-bold text-(--main-color) transition-colors hover:text-(--secondary-color) hover:underline'
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
