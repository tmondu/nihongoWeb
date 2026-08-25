'use client';

import { useEffect } from 'react';

export default function SecurityGuard() {
  useEffect(() => {
    // 1. Chặn tất cả phím tắt mở DevTools, View Source, Save page
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / J / C (Windows/Linux) hoặc Cmd+Opt+I / J / C (macOS)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.shiftKey || e.altKey) &&
        ['i', 'j', 'c', 'I', 'J', 'C'].includes(e.key)
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+Alt+U (Xem mã nguồn)
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) ||
        (e.metaKey && e.altKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Lưu trang HTML)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        if (!isInput) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };

    // 2. Phát hiện DevTools mở (qua Menu hoặc bất kỳ tab nào như Network, Elements, Console)
    // Tự động đóng tab / xoá trắng trang nếu mở quá 1 giây (1000ms)
    let openDuration = 0;

    const killPage = () => {
      document.body.innerHTML = `
        <div style="
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #0b0c10;
          color: #ffffff;
          text-align: center;
          padding: 24px;
          font-family: 'Noto Sans JP', system-ui, -apple-system, sans-serif;
          z-index: 99999999;
          user-select: none;
        ">
          <div style="font-size: 64px; margin-bottom: 16px;">🥺</div>
          <h1 style="font-size: 28px; font-weight: 800; color: #6ee7b7; margin-bottom: 12px;">
            Huhu bạn ơi đi nhầm chỗ rùi!!
          </h1>
          <p style="font-size: 15px; color: #9ca3af; max-width: 420px; line-height: 1.6;">
            Trang web này để học tiếng Nhật vui vẻ thôi nè. Hãy đóng cửa sổ DevTools và tải lại trang để tiếp tục học nha!
          </p>
        </div>
      `;
    };

    const checkDevTools = () => {
      // Khi DevTools mở (bên phải hoặc dưới đáy), kích thước inner sẽ bị hẹp đi rõ rệt
      const isWidthDocked = window.outerWidth - window.innerWidth > 180;
      const isHeightDocked = window.outerHeight - window.innerHeight > 280;

      if (isWidthDocked || isHeightDocked) {
        openDuration += 250;
        if (openDuration >= 1000) {
          // Quá 1 giây -> Tắt trang
          killPage();
        }
      } else {
        openDuration = 0;
      }
    };

    // Đăng ký event listeners
    window.addEventListener('keydown', handleKeyDown, true);
    const intervalId = setInterval(checkDevTools, 250);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      clearInterval(intervalId);
    };
  }, []);

  return null;
}
