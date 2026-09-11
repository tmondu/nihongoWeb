'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DisplayNamePromptModal from '@/shared/ui-composite/User/DisplayNamePromptModal';

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
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
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
      // 1. Register User (server automatically logs in user by issuing auth_token cookie)
      const registerRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken }),
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.error || 'Đăng ký thất bại');
      }

      // Mark user as logged in
      sessionStorage.removeItem('vocab-cache');
      sessionStorage.removeItem('kanji-cache');
      sessionStorage.setItem('is_logged_in', 'true');

      setSuccess(
        'Đăng ký tài khoản thành công! Vui lòng thiết lập tên hiển thị của bạn.',
      );
      setShowDisplayNameModal(true);
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

        {/* Google Sign-up Button */}
        <a
          href={`/api/auth/google?redirect=${encodeURIComponent(redirectPath)}`}
          className='flex w-full items-center justify-center gap-3 rounded-xl border border-(--border-color) bg-(--background-color) px-4 py-3 text-sm font-semibold text-(--main-color) shadow-sm transition-all duration-300 hover:border-(--main-color)/40 hover:bg-(--main-color)/5 active:scale-[0.99]'
        >
          <svg className='h-5 w-5 shrink-0' viewBox='0 0 24 24'>
            <path
              fill='#4285F4'
              d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
            />
            <path
              fill='#34A853'
              d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
            />
            <path
              fill='#FBBC05'
              d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z'
            />
            <path
              fill='#EA4335'
              d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z'
            />
          </svg>
          <span>Đăng ký nhanh bằng Google</span>
        </a>

        {/* Divider */}
        <div className='my-6 flex items-center gap-3'>
          <div className='h-px flex-1 bg-(--border-color)' />
          <span className='shrink-0 text-xs font-semibold tracking-wider whitespace-nowrap text-(--secondary-color) uppercase'>
            Hoặc đăng ký bằng Email
          </span>
          <div className='h-px flex-1 bg-(--border-color)' />
        </div>

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

      <DisplayNamePromptModal
        forceOpen={showDisplayNameModal}
        onSuccess={() => {
          router.push(redirectPath);
        }}
        onClose={() => {
          router.push(redirectPath);
        }}
      />
    </div>
  );
}
