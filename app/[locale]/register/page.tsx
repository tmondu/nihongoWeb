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
              placeholder='ten@viethoc.com'
            />
          </div>

          <div>
            <label
              htmlFor='password'
              className='block text-xs font-semibold tracking-wider text-zinc-300 uppercase'
            >
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
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

          <div>
            <label
              htmlFor='confirmPassword'
              className='block text-xs font-semibold tracking-wider text-zinc-300 uppercase'
            >
              Nhập lại mật khẩu
            </label>
            <input
              id='confirmPassword'
              type='password'
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className='mt-2 block w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 shadow-sm transition-all duration-300 focus:border-blue-500 focus:bg-white/[0.07] focus:ring-1 focus:ring-blue-500 focus:outline-none'
              placeholder='••••••••'
            />
          </div>

          <TurnstileVerification onVerified={setTurnstileToken} />

          <button
            type='submit'
            disabled={loading}
            className='relative flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_4px_20px_0_rgba(59,130,246,0.3)] transition-colors duration-300 hover:bg-blue-500 disabled:pointer-events-none disabled:opacity-50'
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className='mt-8 text-center text-xs text-zinc-500'>
          Đã có tài khoản?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className='font-bold text-blue-400 decoration-2 transition-colors duration-200 hover:text-blue-300 hover:underline'
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
