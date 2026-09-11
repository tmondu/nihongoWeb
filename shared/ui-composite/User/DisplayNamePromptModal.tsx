'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { User, AlertCircle, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/components/dialog';

interface DisplayNamePromptModalProps {
  forceOpen?: boolean;
  onSuccess?: (name: string) => void;
  onClose?: () => void;
}

export default function DisplayNamePromptModal({
  forceOpen = false,
  onSuccess,
  onClose,
}: DisplayNamePromptModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const checkUserDisplayName = useCallback(async () => {
    // Avoid triggering on authentication pages
    if (
      pathname?.includes('/login') ||
      pathname?.includes('/register') ||
      pathname?.includes('/forgot-password') ||
      pathname?.includes('/reset-password')
    ) {
      return;
    }

    const isLoggedIn =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('is_logged_in') === 'true';
    const isDismissed =
      typeof window !== 'undefined' &&
      sessionStorage.getItem('display_name_prompt_dismissed') === 'true';

    if (!isLoggedIn && !forceOpen) {
      return;
    }

    if (isDismissed && !forceOpen) {
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;

      const user = await res.json();
      if (user && (!user.display_name || user.display_name.trim() === '')) {
        setIsOpen(true);
      }
    } catch {
      // Ignore network errors on background check
    }
  }, [pathname, forceOpen]);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    checkUserDisplayName();

    const handleCustomTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener('open-display-name-prompt', handleCustomTrigger);
    return () => {
      window.removeEventListener(
        'open-display-name-prompt',
        handleCustomTrigger,
      );
    };
  }, [checkUserDisplayName, forceOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();

    if (!trimmed) {
      setError('Vui lòng nhập tên hiển thị.');
      return;
    }

    if (trimmed.length < 2 || trimmed.length > 30) {
      setError('Tên hiển thị phải từ 2 đến 30 ký tự.');
      return;
    }

    if (/[<>]/.test(trimmed)) {
      setError('Tên hiển thị không được chứa ký tự đặc biệt như < hoặc >.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/display-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể cập nhật tên hiển thị.');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        if (onSuccess) {
          onSuccess(trimmed);
        }
        // Dispatch event so other components know display_name updated
        window.dispatchEvent(
          new CustomEvent('display-name-updated', {
            detail: { displayName: trimmed },
          }),
        );
      }, 900);
    } catch (err: unknown) {
      setError((err as Error).message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('display_name_prompt_dismissed', 'true');
    }
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          handleDismiss();
        } else {
          setIsOpen(true);
        }
      }}
    >
      <DialogContent className='max-w-md rounded-3xl border border-(--border-color) bg-[#09090b]/95 p-6 text-slate-100 shadow-2xl backdrop-blur-xl sm:p-8'>
        <DialogHeader className='space-y-3 text-center sm:text-left'>
          <div>
            <div className='inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400'>
              <User className='size-3' /> Cập nhật hồ sơ
            </div>
            <DialogTitle className='mt-2 text-xl font-bold tracking-tight text-white'>
              Thiết lập Tên hiển thị (Nickname)
            </DialogTitle>
          </div>

          <DialogDescription className='text-xs leading-relaxed text-slate-400 sm:text-sm'>
            Chào mừng bạn đến với PThamSS! Hãy đặt tên hiển thị để đại diện cho
            bạn khi bình luận bài giảng và thảo luận học tập.
          </DialogDescription>
        </DialogHeader>

        {/* 7-day rule highlight notice */}
        <div className='mt-1 flex items-start gap-2.5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs leading-relaxed text-blue-300'>
          <Clock className='mt-0.5 size-4 shrink-0 text-blue-400' />
          <span>
            <strong>Quy định đổi tên:</strong> Bạn chỉ có thể đổi tên hiển thị{' '}
            <strong>7 ngày 1 lần</strong> để đảm bảo sự nhất quán trong cộng
            đồng.
          </span>
        </div>

        {error && (
          <div className='flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 p-3 text-xs text-red-400'>
            <AlertCircle className='size-4 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className='flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/30 p-3 text-xs text-emerald-400'>
            <CheckCircle2 className='size-4 shrink-0' />
            <span>Đã lưu tên hiển thị thành công!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className='mt-2 space-y-4'>
          <div className='space-y-1.5'>
            <div className='flex justify-between text-xs'>
              <label className='font-semibold text-slate-300'>
                Tên hiển thị của bạn
              </label>
              <span className='text-slate-500'>
                {displayName.trim().length}/30
              </span>
            </div>
            <div className='relative'>
              <User className='absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-500' />
              <Input
                type='text'
                placeholder='Ví dụ: Sakura_Nguyen, MinhTuan, KatanaPro...'
                value={displayName}
                maxLength={30}
                onChange={e => setDisplayName(e.target.value)}
                autoFocus
                disabled={loading || success}
                className='h-11 rounded-xl border-[#27272a] bg-[#121215] pl-10 text-sm text-slate-100 placeholder:text-slate-600 focus-visible:ring-amber-500'
              />
            </div>
          </div>

          <div className='flex items-center justify-end gap-2.5 pt-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={handleDismiss}
              disabled={loading || success}
              className='cursor-pointer text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            >
              Để sau
            </Button>
            <Button
              type='submit'
              disabled={loading || success || !displayName.trim()}
              className='cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 active:scale-[0.98]'
            >
              {loading && <Loader2 className='mr-1.5 size-3.5 animate-spin' />}
              Lưu tên hiển thị
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
