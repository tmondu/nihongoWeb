'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
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
        script.src =
          'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Yêu cầu thất bại');
      }

      setSuccess(data.message);
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
            Khôi phục mật khẩu tài khoản
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

        {!success && (
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label
                htmlFor='email'
                className='block text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'
              >
                Nhập địa chỉ Email của bạn
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

            <TurnstileVerification onVerified={setTurnstileToken} />

            <button
              type='submit'
              disabled={loading}
              className='relative flex w-full justify-center rounded-xl border-b-4 border-(--main-color-accent) bg-(--main-color) px-4 py-3 text-sm font-bold text-(--background-color) shadow-md transition-all hover:brightness-110 active:brightness-95 disabled:pointer-events-none disabled:opacity-50'
            >
              {loading
                ? 'Đang gửi yêu cầu...'
                : 'Gửi liên kết đặt lại mật khẩu'}
            </button>
          </form>
        )}

        <p className='mt-8 text-center text-xs text-(--secondary-color)/85'>
          Quay lại{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className='font-bold text-(--main-color) transition-colors hover:text-(--secondary-color) hover:underline'
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
