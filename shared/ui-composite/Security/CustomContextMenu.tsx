'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Copy, ClipboardPaste, Volume2, RotateCcw } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface MenuPosition {
  x: number;
  y: number;
}

export default function CustomContextMenu() {
  const { playClick } = useClick();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');

  const menuRef = useRef<HTMLDivElement | null>(null);
  const targetInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null,
  );
  const targetSelectionRef = useRef<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  const handleContextMenu = useCallback((e: MouseEvent) => {
    e.preventDefault();

    const selection = window.getSelection()?.toString().trim() || '';
    setSelectedText(selection);

    // Lưu lại phần tử input/textarea được click chuột phải
    const target = e.target as HTMLElement | null;
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')
    ) {
      const inputEl = target as HTMLInputElement | HTMLTextAreaElement;
      targetInputRef.current = inputEl;
      targetSelectionRef.current = {
        start: inputEl.selectionStart || 0,
        end: inputEl.selectionEnd || 0,
      };
    } else {
      targetInputRef.current = null;
    }

    // Tính toán toạ độ hiển thị
    const menuWidth = 175;
    const menuHeight = 140;

    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose);
    };
  }, [handleContextMenu, handleClose]);

  // Hành động 1: Sao chép
  const handleCopy = async () => {
    playClick();
    setIsOpen(false);
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
      } catch {
        // Ignore
      }
    }
  };

  // Hành động 2: Dán (Paste)
  const handlePaste = async () => {
    playClick();
    setIsOpen(false);
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const inputEl = targetInputRef.current;
      if (inputEl) {
        inputEl.focus();
        const start = targetSelectionRef.current.start;
        const end = targetSelectionRef.current.end;
        const val = inputEl.value;

        // Kích hoạt setter tương thích React state
        const descriptor =
          Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value',
          ) ||
          Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value',
          );

        const nextVal = val.substring(0, start) + text + val.substring(end);
        if (descriptor && descriptor.set) {
          descriptor.set.call(inputEl, nextVal);
        } else {
          inputEl.value = nextVal;
        }

        const newPos = start + text.length;
        inputEl.setSelectionRange(newPos, newPos);
        inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch {
      // Ignore
    }
  };

  // Hành động 3: Phát âm tiếng Nhật Web Speech API
  const handleSpeak = () => {
    playClick();
    setIsOpen(false);
    if (
      selectedText &&
      typeof window !== 'undefined' &&
      window.speechSynthesis
    ) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Hành động 4: Tải lại trang
  const handleReload = () => {
    playClick();
    setIsOpen(false);
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
      }}
      className='animate-in fade-in zoom-in-95 fixed z-[9999999] min-w-[170px] space-y-1 overflow-hidden rounded-2xl border-2 border-(--border-color) bg-(--card-color) p-1.5 shadow-2xl backdrop-blur-md duration-100 select-none'
      onClick={e => e.stopPropagation()}
    >
      {/* Copy Action (nếu có bôi đen) */}
      {selectedText && (
        <button
          type='button'
          onClick={handleCopy}
          className='flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-(--main-color) transition-all hover:bg-(--main-color) hover:text-(--background-color)'
        >
          <div className='flex items-center gap-2'>
            <Copy className='size-3.5' />
            <span>Sao chép</span>
          </div>
          <span className='text-[10px] opacity-60'>Ctrl+C</span>
        </button>
      )}

      {/* Paste Action */}
      <button
        type='button'
        onClick={handlePaste}
        className='flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-(--main-color) transition-all hover:bg-(--main-color) hover:text-(--background-color)'
      >
        <div className='flex items-center gap-2'>
          <ClipboardPaste className='size-3.5' />
          <span>Dán nội dung</span>
        </div>
        <span className='text-[10px] opacity-60'>Ctrl+V</span>
      </button>

      {/* Speak Action (nếu có bôi đen) */}
      {selectedText && (
        <button
          type='button'
          onClick={handleSpeak}
          className='flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-(--main-color) transition-all hover:bg-(--main-color) hover:text-(--background-color)'
        >
          <Volume2 className='size-3.5' />
          <span>Phát âm</span>
        </button>
      )}

      {/* Reload Action */}
      <button
        type='button'
        onClick={handleReload}
        className='flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-(--main-color) transition-all hover:bg-(--main-color) hover:text-(--background-color)'
      >
        <div className='flex items-center gap-2'>
          <RotateCcw className='size-3.5' />
          <span>Tải lại trang</span>
        </div>
        <span className='text-[10px] opacity-60'>F5</span>
      </button>
    </div>
  );
}
