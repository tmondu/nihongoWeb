'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
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
}: DisplayNamePromptModalProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const checkUserDisplayName = useCallback(async () => {
    // Avoid triggering on public authentication pages
    if (
      pathname?.includes('/login') ||
      pathname?.includes('/register') ||
      pathname?.includes('/forgot-password') ||
      pathname?.includes('/reset-password')
    ) {
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) return;

      const user = await res.json();
      if (user && (!user.display_name || user.display_name.trim() === '')) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } catch {
      // Ignore network errors on background check
    }
  }, [pathname]);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    void checkUserDisplayName();

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
        // Dispatch event so other components update their state
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

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        hideCloseButton={true}
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
        className='max-w-md rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 text-(--main-color) shadow-2xl sm:p-8'
      >
        <DialogHeader className='space-y-3 text-center sm:text-left'>
          <div>
            <div className='inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400'>
              <User className='size-3.5' /> Yêu cầu đặt tên hiển thị
            </div>
            <DialogTitle className='mt-2 text-xl font-black tracking-tight text-(--main-color) sm:text-2xl'>
              Thiết lập Tên hiển thị (Nickname)
            </DialogTitle>
          </div>

          <DialogDescription className='text-xs leading-relaxed text-(--secondary-color) sm:text-sm'>
            Chào mừng bạn đến với PThamSS! Bạn cần đặt tên hiển thị để đại diện
            cho bạn khi xem video bài giảng, bình luận và học tập.
          </DialogDescription>
        </DialogHeader>

        {/* Mandatory Requirement Note */}
        <div className='mt-1 flex items-start gap-2.5 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300'>
          <ShieldAlert className='mt-0.5 size-4 shrink-0 text-amber-500' />
          <span>
            <strong>Bắt buộc:</strong> Bạn cần thiết lập tên hiển thị để mở khóa
            xem toàn bộ video bài giảng và tham gia thảo luận.
          </span>
        </div>

        {/* 7-day rule highlight notice */}
        <div className='flex items-start gap-2.5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs leading-relaxed text-blue-700 dark:text-blue-300'>
          <Clock className='mt-0.5 size-4 shrink-0 text-blue-500' />
          <span>
            <strong>Quy định đổi tên:</strong> Bạn chỉ có thể đổi tên hiển thị{' '}
            <strong>7 ngày 1 lần</strong> để đảm bảo tính nhất quán trong cộng
            đồng.
          </span>
        </div>

        {error && (
          <div className='flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-semibold text-red-600 dark:text-red-400'>
            <AlertCircle className='size-4 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className='flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
            <CheckCircle2 className='size-4 shrink-0' />
            <span>Đã lưu tên hiển thị thành công!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className='mt-2 space-y-4'>
          <div className='space-y-1.5'>
            <div className='flex justify-between text-xs'>
              <label className='font-bold text-(--main-color)'>
                Tên hiển thị của bạn
              </label>
              <span className='font-mono text-(--secondary-color)/70'>
                {displayName.trim().length}/30
              </span>
            </div>
            <div className='relative'>
              <User className='absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--secondary-color)' />
              <Input
                type='text'
                placeholder='Ví dụ: Sakura_Nguyen, MinhTuan, KatanaPro...'
                value={displayName}
                maxLength={30}
                onChange={e => setDisplayName(e.target.value)}
                autoFocus
                disabled={loading || success}
                className='h-11 rounded-xl border border-(--border-color) bg-(--background-color) pl-10 text-sm font-medium text-(--main-color) placeholder:text-(--secondary-color)/50 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500'
              />
            </div>
          </div>

          <div className='pt-2'>
            <Button
              type='submit'
              disabled={loading || success || !displayName.trim()}
              className='flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'
            >
              {loading && <Loader2 className='size-4 animate-spin' />}
              Lưu tên hiển thị
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
