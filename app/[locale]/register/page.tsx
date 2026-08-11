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
    <div className='flex min-h-screen items-center justify-center bg-[#09090b] px-4 py-12 text-[#fafafa] selection:bg-rose-500 selection:text-white'>
      <div className='w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/50 p-8 shadow-2xl backdrop-blur-md'>
        <div className='mb-8 text-center'>
          <h1 className='bg-gradient-to-r from-rose-500 via-violet-500 to-indigo-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent'>
            KanaDojo
          </h1>
          <p className='mt-2 text-sm text-zinc-400'>
            Đăng ký tài khoản mới để bắt đầu quá trình luyện tập
          </p>
        </div>

        {error && (
          <div className='mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400'>
            {error}
          </div>
        )}

        {success && (
          <div className='mb-6 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400'>
            {success}
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
              Mật khẩu (tối thiểu 6 ký tự)
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

          <div>
            <label
              htmlFor='confirmPassword'
              className='block text-sm font-medium text-zinc-300'
            >
              Nhập lại mật khẩu
            </label>
            <input
              id='confirmPassword'
              type='password'
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className='mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 shadow-sm focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none'
              placeholder='••••••••'
            />
          </div>

          <TurnstileVerification onVerified={setTurnstileToken} />

          <button
            type='submit'
            disabled={loading}
            className='flex w-full justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:opacity-50'
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className='mt-8 text-center text-xs text-zinc-500'>
          Đã có tài khoản?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className='font-semibold text-rose-500 hover:text-rose-400'
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
