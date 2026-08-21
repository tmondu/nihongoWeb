'use client';

import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, FileText } from 'lucide-react';
import { parseQuizletText } from '../../lib/quizletParser';
import { CreateCardInput } from '../../types';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (cards: CreateCardInput[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const { playClick } = useClick();
  const [rawText, setRawText] = useState('');
  const [termSeparator, setTermSeparator] = useState('\t'); // '\t', ',', ' - ', '|'
  const [cardSeparator, setCardSeparator] = useState('\n');

  if (!isOpen) return null;

  const parsedResult = parseQuizletText(rawText, {
    termSeparator: termSeparator === 'custom' ? undefined : termSeparator,
    cardSeparator,
  });

  const handleApply = () => {
    if (parsedResult.cards.length === 0) return;
    playClick();
    onImport(parsedResult.cards);
    setRawText('');
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs'>
      <div className='relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-(--border-color)/60 pb-4'>
          <div className='flex items-center gap-2.5'>
            <div className='flex size-10 items-center justify-center rounded-2xl bg-(--main-color)/15 text-(--main-color)'>
              <Sparkles className='size-5' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-(--main-color)'>
                Nhập nhanh từ Quizlet / Excel
              </h2>
              <p className='text-xs text-(--secondary-color)'>
                Sao chép bảng từ vựng từ Quizlet, Google Sheets hoặc Excel rồi
                dán vào đây
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={() => {
              playClick();
              onClose();
            }}
            className='rounded-xl p-2 text-(--secondary-color) transition-colors hover:bg-(--background-color) hover:text-(--main-color)'
          >
            <X className='size-5' />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 space-y-4 overflow-y-auto py-4 pr-1'>
          {/* Options */}
          <div className='grid grid-cols-1 gap-3 text-xs sm:grid-cols-2'>
            <div>
              <label className='mb-1.5 block font-semibold text-(--secondary-color)'>
                Ngăn cách Thuật ngữ & Định nghĩa
              </label>
              <select
                value={termSeparator}
                onChange={e => setTermSeparator(e.target.value)}
                className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-(--main-color) focus:border-(--main-color) focus:outline-none'
              >
                <option value='\t'>Tab (Mặc định Quizlet & Excel)</option>
                <option value=','>Dấu phẩy (,)</option>
                <option value=' - '>Dấu gạch ngang ( - )</option>
                <option value='|'>Dấu gạch đứng (|)</option>
                <option value=': '>Dấu hai chấm (: )</option>
              </select>
            </div>

            <div>
              <label className='mb-1.5 block font-semibold text-(--secondary-color)'>
                Ngăn cách giữa các Thẻ
              </label>
              <select
                value={cardSeparator}
                onChange={e => setCardSeparator(e.target.value)}
                className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-(--main-color) focus:border-(--main-color) focus:outline-none'
              >
                <option value='\n'>Dòng mới (Enter)</option>
                <option value=';\n'>Chấm phẩy (;)</option>
              </select>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <label className='mb-1.5 block text-sm font-semibold text-(--main-color)'>
              Dán nội dung vào đây:
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder={`Ví dụ:\n食べる\tĂn uống\n飲む\tUống nước\n本\tQuyển sách`}
              className='w-full rounded-2xl border border-(--border-color) bg-(--background-color) p-3.5 font-mono text-sm text-(--main-color) placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:outline-none'
            />
          </div>

          {/* Preview */}
          <div>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-xs font-semibold text-(--secondary-color)'>
                Xem trước nhận diện:
              </span>
              <span className='rounded-full bg-(--main-color)/15 px-2.5 py-0.5 text-xs font-bold text-(--main-color)'>
                {parsedResult.cards.length} thẻ tìm thấy
              </span>
            </div>

            {parsedResult.cards.length > 0 ? (
              <div className='max-h-44 divide-y divide-(--border-color)/50 overflow-y-auto rounded-2xl border border-(--border-color) bg-(--background-color) p-2'>
                {parsedResult.cards.map((c, i) => (
                  <div
                    key={i}
                    className='grid grid-cols-2 gap-2 px-2 py-2 text-xs'
                  >
                    <div className='font-medium text-(--main-color)'>
                      <span>{c.term}</span>
                      {c.reading && (
                        <span className='ml-1 text-(--secondary-color)'>
                          ({c.reading})
                        </span>
                      )}
                    </div>
                    <div className='text-(--secondary-color)'>
                      {c.definition}
                    </div>
                  </div>
                ))}
              </div>
            ) : rawText.trim() ? (
              <div className='flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-500'>
                <AlertCircle className='size-4 shrink-0' />
                <span>
                  Chưa nhận diện được thẻ nào. Vui lòng kiểm tra lại ký tự ngăn
                  cách.
                </span>
              </div>
            ) : (
              <div className='flex items-center justify-center gap-2 rounded-2xl border border-dashed border-(--border-color) py-6 text-xs text-(--secondary-color)'>
                <FileText className='size-4' />
                <span>Chưa có nội dung dán vào</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-(--border-color)/60 pt-4'>
          <button
            type='button'
            onClick={() => {
              playClick();
              onClose();
            }}
            className='rounded-2xl border border-(--border-color) bg-(--background-color) px-5 py-2.5 text-sm font-semibold text-(--secondary-color) hover:text-(--main-color)'
          >
            Hủy
          </button>
          <button
            type='button'
            disabled={parsedResult.cards.length === 0}
            onClick={handleApply}
            className={clsx(
              'rounded-2xl bg-(--main-color) px-6 py-2.5 text-sm font-bold text-(--background-color) transition-all active:scale-95',
              parsedResult.cards.length === 0
                ? 'cursor-not-allowed opacity-50'
                : 'hover:opacity-90',
            )}
          >
            Thêm {parsedResult.cards.length} thẻ vào bộ
          </button>
        </div>
      </div>
    </div>
  );
};
