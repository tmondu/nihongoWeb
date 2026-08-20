'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface TurnstileWindow extends Window {
  turnstile?: {
    render: (
      container: HTMLElement,
      options: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback': () => void;
        'error-callback': () => void;
      },
    ) => string;
    remove: (widgetId: string) => void;
  };
}

function TurnstileVerification({
  onVerified,
}: {
  onVerified: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !containerRef.current) {
      return;
    }

    let widgetId: string | null = null;
    const renderWidget = () => {
      const turnstile = (window as TurnstileWindow).turnstile;
      if (!turnstile || !containerRef.current || widgetId) {
        return;
      }

      widgetId = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerified,
        'expired-callback': () => onVerified(''),
        'error-callback': () => onVerified(''),
      });
    };

    if ((window as TurnstileWindow).turnstile) {
      renderWidget();
    } else {
      const existingScript = document.querySelector(
        'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
      );
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', renderWidget, { once: true });
      }
    }

    return () => {
      if (widgetId && (window as TurnstileWindow).turnstile) {
        (window as TurnstileWindow).turnstile?.remove(widgetId);
      }
    };
  }, [onVerified]);

  return (
    <div className='my-4 flex justify-center' aria-label='Human verification'>
      <div ref={containerRef} />
    </div>
  );
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Vui lòng hoàn thành xác thực bảo mật Turnstile.');
      return;
    }

    setLoading(true);

    try {
      // 1. Register User
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Đăng ký thất bại');
      }

      setSuccess(
        registerData.message ||
          'Đăng ký tài khoản thành công! Hệ thống sẽ tự động chuyển về trang đăng nhập sau vài giây...',
      );

      setTimeout(() => {
        router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      }, 3500);
    } catch (err) {
      setError((err as Error).message);
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
            Đăng ký tài khoản mới để bắt đầu quá trình luyện tập
          </p>
        </div>

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
              placeholder='ten@viethoc.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'
            >
              Mật khẩu (tối thiểu 6 ký tự)
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
              Nhập lại mật khẩu
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

          <TurnstileVerification onVerified={setTurnstileToken} />

          <button
            type='submit'
            disabled={loading}
            className='relative flex w-full justify-center rounded-xl border-b-4 border-(--main-color-accent) bg-(--main-color) px-4 py-3 text-sm font-bold text-(--background-color) shadow-md transition-all hover:brightness-110 active:brightness-95 disabled:pointer-events-none disabled:opacity-50'
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className='mt-8 text-center text-xs text-(--secondary-color)/85'>
          Đã có tài khoản?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className='font-bold text-(--main-color) transition-colors hover:text-(--secondary-color) hover:underline'
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
