'use client';

import React, { useState } from 'react';
import {
  X,
  Volume2,
  Trash2,
  Download,
  Copy,
  Check,
  BookmarkCheck,
} from 'lucide-react';
import { useReaderStore } from '../store/useReaderStore';
import { playJapaneseTTS } from '../services/readerService';

export default function MinedSentencesDrawer() {
  const {
    isMinedDrawerOpen,
    setIsMinedDrawerOpen,
    minedSentences,
    removeMinedSentence,
    clearMinedSentences,
  } = useReaderStore();

  const [copied, setCopied] = useState(false);

  if (!isMinedDrawerOpen) return null;

  // Generate TSV data for Anki import
  const generateAnkiTsv = () => {
    const header = 'Câu tiếng Nhật\tTừ trọng tâm\tCách đọc\tHán-Việt\tÝ nghĩa';
    const rows = minedSentences.map(
      s =>
        `${s.sentence}\t${s.targetWord}\t${s.reading || ''}\t${s.hanViet || ''}\t${s.meaning || ''}`,
    );
    return [header, ...rows].join('\n');
  };

  const handleCopyAnki = async () => {
    const tsv = generateAnkiTsv();
    await navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAnki = () => {
    const tsv = generateAnkiTsv();
    const blob = new Blob([tsv], {
      type: 'text/tab-separated-values;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pthamss-sentence-mining-${new Date().toISOString().slice(0, 10)}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs'>
      <div
        role='dialog'
        aria-modal='true'
        className='animate-in slide-in-from-right flex h-full w-full max-w-xl flex-col bg-(--card-color) shadow-2xl duration-300'
      >
        {/* Drawer Header */}
        <div className='flex items-center justify-between border-b border-(--border-color) p-5 sm:p-6'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400'>
              <BookmarkCheck className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-lg font-black text-(--main-color)'>
                Kho Câu Đã Khai Thác (Sentence Mining)
              </h2>
              <p className='text-xs text-(--secondary-color)'>
                Đã lưu {minedSentences.length} câu vào bộ nhớ cục bộ
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={() => setIsMinedDrawerOpen(false)}
            className='flex h-8 w-8 items-center justify-center rounded-full border border-(--border-color) text-(--secondary-color) hover:text-(--main-color)'
            aria-label='Đóng'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Action Toolbar */}
        {minedSentences.length > 0 && (
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color)/60 bg-(--background-color)/60 px-5 py-3 text-xs'>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={handleCopyAnki}
                className='flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 font-bold text-(--main-color) hover:border-(--main-color)'
              >
                {copied ? (
                  <Check className='h-3.5 w-3.5 text-emerald-600' />
                ) : (
                  <Copy className='h-3.5 w-3.5' />
                )}
                <span>{copied ? 'Đã sao chép' : 'Sao chép Anki TSV'}</span>
              </button>

              <button
                type='button'
                onClick={handleDownloadAnki}
                className='flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 font-bold text-(--main-color) hover:border-(--main-color)'
              >
                <Download className='h-3.5 w-3.5' />
                <span>Tải file Anki (.tsv)</span>
              </button>
            </div>

            <button
              type='button'
              onClick={() => {
                if (
                  window.confirm('Bạn có chắc muốn xóa toàn bộ các câu đã lưu?')
                ) {
                  clearMinedSentences();
                }
              }}
              className='flex items-center gap-1 text-rose-500 hover:text-rose-700'
              title='Xóa hết'
            >
              <Trash2 className='h-3.5 w-3.5' />
              <span>Xóa hết</span>
            </button>
          </div>
        )}

        {/* Sentences List */}
        <div className='flex-1 space-y-3 overflow-y-auto p-5 sm:p-6'>
          {minedSentences.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <BookmarkCheck className='h-12 w-12 text-(--secondary-color)/40' />
              <p className='mt-3 text-sm font-bold text-(--main-color)'>
                Chưa có câu nào được khai thác
              </p>
              <p className='mt-1 max-w-xs text-xs text-(--secondary-color)'>
                Khi đọc văn bản, bấm nút &ldquo;Đào câu&rdquo; hoặc mở cửa sổ từ
                vựng để lưu câu chứa từ đó vào đây!
              </p>
            </div>
          ) : (
            minedSentences.map(item => (
              <div
                key={item.id}
                className='group rounded-2xl border border-(--border-color) bg-(--background-color) p-4 text-xs transition-all hover:border-(--main-color)/40'
              >
                {/* Sentence text */}
                <div className='flex items-start justify-between gap-3'>
                  <p className='font-japanese text-sm leading-relaxed font-bold text-(--main-color)'>
                    {item.sentence}
                  </p>
                  <button
                    type='button'
                    onClick={() => playJapaneseTTS(item.sentence)}
                    className='shrink-0 rounded-lg p-1 text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color)'
                    title='Nghe đọc câu'
                  >
                    <Volume2 className='h-4 w-4' />
                  </button>
                </div>

                {/* Target Word Info */}
                <div className='mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-(--card-color) p-2.5'>
                  <span className='font-japanese text-sm font-black text-amber-600 dark:text-amber-400'>
                    {item.targetWord}
                  </span>
                  {item.reading && (
                    <span className='font-japanese text-xs text-(--secondary-color)'>
                      【{item.reading}】
                    </span>
                  )}
                  {item.hanViet && (
                    <span className='rounded bg-purple-500/15 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400'>
                      Hán-Việt: {item.hanViet}
                    </span>
                  )}
                  {item.meaning && (
                    <span className='w-full text-xs text-(--main-color)/80'>
                      👉 {item.meaning}
                    </span>
                  )}
                </div>

                {/* Footer / Delete */}
                <div className='mt-2 flex items-center justify-between text-[10px] text-(--secondary-color)'>
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <button
                    type='button'
                    onClick={() => removeMinedSentence(item.id)}
                    className='text-rose-500 opacity-60 group-hover:opacity-100 hover:opacity-100'
                  >
                    Xóa câu này
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
