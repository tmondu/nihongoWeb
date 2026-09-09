'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Đặt là true để BẬT tính năng chặn DevTools / F12 trên Production
// Đặt là false để TẠM NGƯNG tính năng chặn DevTools
const ENABLE_SECURITY_GUARD = true;

export default function SecurityGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Tự động bỏ qua nếu ở môi trường dev hoặc tạm tắt
    if (!ENABLE_SECURITY_GUARD || process.env.NODE_ENV === 'development') {
      return;
    }

    // 2. Tự động bỏ qua khi đang ở trang /admin (hoặc /vi/admin, /en/admin, ...)
    if (
      pathname &&
      (pathname.includes('/admin') || pathname.startsWith('/admin'))
    ) {
      return;
    }

    // 3. Tự động bỏ qua nếu trình duyệt đã ghi nhận quyền Admin
    if (sessionStorage.getItem('is_admin') === '1') {
      return;
    }

    let isCancelled = false;
    let cleanupEvents: (() => void) | null = null;

    const initGuard = () => {
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

      // 2. Phát hiện DevTools mở (chỉ áp dụng cho Desktop / Laptop)
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
        // 1. Phân biệt thiết bị thật:
        // Trên điện thoại thật (iPhone, iPad, Android), platform KHÔNG BAO GIỜ là Win32 / Windows.
        const isDesktopPlatform =
          /Win32|Win64|Windows|MacIntel|Linux x86_64/i.test(
            navigator.platform || '',
          );

        // A. Nếu là máy tính PC/Mac nhưng bề rộng bị ép co xuống dưới 650px (như 395x811 trong F12)
        // -> 100% ĐANG MỞ DEVTOOLS BẬT DEVICE TOOLBAR!
        const isMobileEmulationOnDesktop =
          isDesktopPlatform && window.innerWidth < 650;

        // B. Phát hiện DevTools gắn bên phải hoặc dưới đáy trên Desktop
        const isWidthDocked =
          isDesktopPlatform && window.outerWidth - window.innerWidth > 160;
        const isHeightDocked =
          isDesktopPlatform && window.outerHeight - window.innerHeight > 250;

        if (isMobileEmulationOnDesktop || isWidthDocked || isHeightDocked) {
          openDuration += 200;
          if (openDuration >= 600) {
            killPage();
          }
        } else {
          openDuration = 0;
        }
      };

      // 3. Anti-Debugger Loop:
      // Khi F12 mở (bất kể tab nào hay chế độ nào), lệnh này sẽ đóng băng DevTools và ép nhảy sang tab Sources
      const antiDebugInterval = setInterval(() => {
        try {
           
          new Function('debugger')();
        } catch {
          // Bỏ qua nếu môi trường chặn Function
        }
      }, 200);

      window.addEventListener('keydown', handleKeyDown, true);
      const intervalId = setInterval(checkDevTools, 200);

      cleanupEvents = () => {
        window.removeEventListener('keydown', handleKeyDown, true);
        clearInterval(intervalId);
        clearInterval(antiDebugInterval);
      };
    };

    // Kiểm tra quyền Admin từ session
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (isCancelled) return;
        if (data?.is_admin === 1) {
          sessionStorage.setItem('is_admin', '1');
          if (cleanupEvents) cleanupEvents();
        } else {
          sessionStorage.setItem('is_admin', '0');
        }
      })
      .catch(() => {});

    // Khởi chạy bảo vệ cho người dùng thông thường
    initGuard();

    return () => {
      isCancelled = true;
      if (cleanupEvents) cleanupEvents();
    };
  }, [pathname]);

  return null;
}
