'use client';

import React, { useState, useEffect } from 'react';
import { PartyPopper, ArrowRight, X } from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/components/dialog';

const REBRAND_STORAGE_KEY = 'mondu_rebrand_acknowledged_v1';

export default function RebrandNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check localStorage asynchronously to prevent setState in root body of effect
    void (async () => {
      await Promise.resolve();
      try {
        const acknowledged = localStorage.getItem(REBRAND_STORAGE_KEY);
        if (!acknowledged) {
          setIsOpen(true);
        }
      } catch {
        // Ignore localStorage read errors in private browsing
      }
    })();
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(REBRAND_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage write error
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleDismiss()}>
      <DialogContent className='max-w-md rounded-2xl border border-(--border-color) bg-(--card-color) p-6 shadow-2xl'>
        <button
          type='button'
          onClick={handleDismiss}
          className='absolute top-4 right-4 rounded-lg p-1.5 text-(--secondary-color) transition-colors hover:bg-(--main-color)/10 hover:text-(--main-color)'
          aria-label='Đóng thông báo'
        >
          <X className='size-5' />
        </button>

        <DialogHeader className='flex flex-col items-center text-center'>
          <div className='mb-3 flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500'>
            <PartyPopper className='size-7' />
          </div>

          <DialogTitle className='text-xl font-black tracking-tight text-(--main-color) sm:text-2xl'>
            PThamSS nay là Mondu!
          </DialogTitle>

          <DialogDescription className='mt-2 text-sm leading-relaxed text-(--secondary-color)'>
            Để xây dựng thương hiệu độc lập và nâng cấp chất lượng học tập,
            website đã chính thức chuyển sang tên miền mới:{' '}
            <strong className='font-bold text-(--main-color)'>
              mondu.online
            </strong>
            .
          </DialogDescription>
        </DialogHeader>

        <div className='my-3 rounded-xl border border-(--border-color) bg-(--background-color) p-4 text-xs leading-relaxed text-(--secondary-color)'>
          <ul className='list-disc space-y-1.5 pl-4 text-left'>
            <li>
              Toàn bộ dữ liệu, lịch sử và tiến trình học tập được giữ nguyên.
            </li>
            <li>Tài khoản người dùng tiếp tục hoạt động bình thường.</li>
            <li>
              Vui lòng cập nhật lại bookmark sang <strong>mondu.online</strong>.
            </li>
          </ul>
        </div>

        <div className='mt-2 flex justify-end gap-2'>
          <Button
            type='button'
            onClick={handleDismiss}
            className='w-full rounded-xl bg-(--main-color) font-bold text-(--background-color) transition-opacity hover:opacity-90'
          >
            Đã hiểu & Tiếp tục học
            <ArrowRight className='ml-1.5 size-4' />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
