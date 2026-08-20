'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Mã liên kết đặt lại mật khẩu không hợp lệ hoặc thiếu.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu mới phải từ 6 ký tự trở lên.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Đặt lại mật khẩu thất bại.');
      }

      setSuccess('Mật khẩu của bạn đã được cập nhật thành công!');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
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
            Thiết lập mật khẩu mới
          </p>
        </div>

        {!token && (
          <div className='mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-center text-sm text-red-400 backdrop-blur-md'>
            Đường dẫn đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng
            kiểm tra lại email hoặc yêu cầu liên kết mới.
          </div>
        )}

        {error && (
          <div className='mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-400 backdrop-blur-md'>
            {error}
          </div>
        )}

        {success && (
          <div className='mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-400 backdrop-blur-md'>
            {success}
          </div>
        )}

        {token && !success && (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label
                htmlFor='password'
                className='block text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'
              >
                Mật khẩu mới
              </label>
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

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'
              >
                Xác nhận mật khẩu mới
              </label>
              <input
                id='confirmPassword'
                type='password'
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className='mt-2 block w-full rounded-xl border border-(--border-color) bg-(--background-color) px-4 py-3 text-sm text-(--main-color) placeholder-(--secondary-color)/40 shadow-sm transition-all duration-300 focus:border-(--main-color) focus:ring-1 focus:ring-(--main-color) focus:outline-none'
                placeholder='••••••••'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='relative flex w-full justify-center rounded-xl border-b-4 border-(--main-color-accent) bg-(--main-color) px-4 py-3 text-sm font-bold text-(--background-color) shadow-md transition-all hover:brightness-110 active:brightness-95 disabled:pointer-events-none disabled:opacity-50'
            >
              {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
            </button>
          </form>
        )}

        <p className='mt-8 text-center text-xs text-(--secondary-color)/85'>
          Quay lại{' '}
          <Link
            href='/login'
            className='font-bold text-(--main-color) transition-colors hover:text-(--secondary-color) hover:underline'
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
