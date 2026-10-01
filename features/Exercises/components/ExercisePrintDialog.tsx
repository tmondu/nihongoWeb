'use client';

import React, { useState } from 'react';
import { Printer, FileText, CheckCircle2, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/components/dialog';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface ExercisePrintDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPrint: (cleanMode: boolean) => void;
  hasAnswers: boolean;
}

export const ExercisePrintDialog: React.FC<ExercisePrintDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirmPrint,
  hasAnswers,
}) => {
  const { playClick } = useClick();
  const [cleanMode, setCleanMode] = useState(!hasAnswers);

  const handlePrint = () => {
    playClick();
    onOpenChange(false);
    // Give state time to update cleanMode before invoking native print
    setTimeout(() => {
      onConfirmPrint(cleanMode);
    }, 150);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 text-(--main-color)'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base font-bold text-(--main-color)'>
            <Printer className='size-5 text-blue-500' />
            <span>Tùy chọn in đề thi / Xuất PDF</span>
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-3 text-xs'>
          <p className='text-(--secondary-color)'>
            Trang in sẽ được tự động định dạng chuẩn khổ giấy A4 chất lượng cao
            dành cho học tập và in ấn.
          </p>

          {/* Option Choices */}
          <div className='space-y-2.5'>
            <button
              type='button'
              onClick={() => {
                playClick();
                setCleanMode(true);
              }}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
                cleanMode
                  ? 'border-(--main-color) bg-(--main-color)/10'
                  : 'border-(--border-color) bg-(--background-color) hover:border-(--main-color)/50'
              }`}
            >
              <div
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  cleanMode
                    ? 'border-(--main-color) bg-(--main-color) text-(--background-color)'
                    : 'border-(--border-color)'
                }`}
              >
                {cleanMode && <CheckCircle2 className='size-3.5' />}
              </div>
              <div>
                <div className='flex items-center gap-1.5 font-bold text-(--main-color)'>
                  <FileText className='size-4 text-emerald-500' />
                  <span>In đề thi trống (Chuẩn giấy thi)</span>
                </div>
                <p className='mt-1 text-[11px] text-(--secondary-color)'>
                  Không chứa đáp án đã tích chọn. Rất thích hợp để in ra giấy
                  làm bài trực tiếp hoặc phát cho học sinh.
                </p>
              </div>
            </button>

            <button
              type='button'
              onClick={() => {
                playClick();
                setCleanMode(false);
              }}
              className={`flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition-all ${
                !cleanMode
                  ? 'border-(--main-color) bg-(--main-color)/10'
                  : 'border-(--border-color) bg-(--background-color) hover:border-(--main-color)/50'
              }`}
            >
              <div
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                  !cleanMode
                    ? 'border-(--main-color) bg-(--main-color) text-(--background-color)'
                    : 'border-(--border-color)'
                }`}
              >
                {!cleanMode && <CheckCircle2 className='size-3.5' />}
              </div>
              <div>
                <div className='flex items-center gap-1.5 font-bold text-(--main-color)'>
                  <CheckCircle2 className='size-4 text-blue-500' />
                  <span>In bài làm hiện tại (Kèm các câu đã chọn)</span>
                </div>
                <p className='mt-1 text-[11px] text-(--secondary-color)'>
                  Giữ nguyên các đáp án bạn đã đánh dấu để lưu trữ hoặc nộp bài.
                </p>
              </div>
            </button>
          </div>

          {/* Quick Tip */}
          <div className='flex items-start gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-blue-600 dark:text-blue-400'>
            <Info className='mt-0.5 size-4 shrink-0' />
            <span className='text-[11px] leading-relaxed'>
              <b>Mẹo in:</b> Trong hộp thoại in của trình duyệt, tại mục{' '}
              <b>Máy in / Đích đến</b> hãy chọn{' '}
              <b>&quot;Lưu dưới dạng PDF&quot; (Save as PDF)</b> và khổ{' '}
              <b>A4</b>.
            </span>
          </div>
        </div>

        <DialogFooter className='mt-2 flex justify-end gap-2 border-t border-(--border-color)/60 pt-4'>
          <button
            type='button'
            onClick={() => {
              playClick();
              onOpenChange(false);
            }}
            className='rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
          >
            Hủy
          </button>
          <button
            type='button'
            onClick={handlePrint}
            className='inline-flex items-center gap-1.5 rounded-2xl bg-(--main-color) px-5 py-2 text-xs font-bold text-(--background-color) shadow-md hover:opacity-90 active:scale-95'
          >
            <Printer className='size-4' />
            <span>Xác nhận In / Xuất PDF</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
