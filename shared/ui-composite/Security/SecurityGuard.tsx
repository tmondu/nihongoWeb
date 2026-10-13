'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Đặt là true để BẬT tính năng chặn DevTools / F12 trên Production
// Đặt là false để TẠM NGƯNG tính năng chặn DevTools
const ENABLE_SECURITY_GUARD = true;

export default function SecurityGuard() {
  const pathname = usePathname();
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // 1. Tự động bỏ qua nếu ở môi trường dev hoặc tính năng đang tắt
    if (!ENABLE_SECURITY_GUARD || process.env.NODE_ENV === 'development') {
      return;
    }

    // 2. Tự động bỏ qua trên tất cả điện thoại / máy tính bảng (thiết bị cảm ứng)
    const isMobileOrTouch =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (typeof window.screen !== 'undefined' && window.screen.width < 900);
    if (isMobileOrTouch) {
      return;
    }

    // 3. Tự động bỏ qua khi đang ở trang /admin hoặc /login (hoặc /vi/admin, /en/admin, ...)
    if (
      pathname &&
      (pathname.includes('/admin') ||
        pathname.startsWith('/admin') ||
        pathname.includes('/login') ||
        pathname.startsWith('/login'))
    ) {
      return;
    }

    // 4. Tự động bỏ qua nếu trình duyệt đã ghi nhận quyền Admin
    if (
      (typeof localStorage !== 'undefined' &&
        localStorage.getItem('is_admin') === '1') ||
      (typeof sessionStorage !== 'undefined' &&
        sessionStorage.getItem('is_admin') === '1') ||
      document.cookie.includes('is_admin=1')
    ) {
      return;
    }

    let isCancelled = false;
    let cleanupEvents: (() => void) | null = null;

    const initGuard = () => {
      // A. Chặn các phím tắt mở DevTools, xem mã nguồn, lưu trang
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

        // Ctrl+Shift+I / J / C / K (Windows/Linux) hoặc Cmd+Opt+I / J / C / K (macOS)
        if (
          (e.ctrlKey || e.metaKey) &&
          (e.shiftKey || e.altKey) &&
          ['i', 'j', 'c', 'k', 'I', 'J', 'C', 'K'].includes(e.key)
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

      // B. Phát hiện DevTools mở thông qua Debugger timing:
      // - Khi DevTools ĐÓNG: lệnh debugger chạy tức thì trong < 0.05ms (không hề tạm dừng).
      // - Khi DevTools MỞ: lệnh debugger kích hoạt breakpoint khiến JavaScript dừng lại (> 100ms).
      // Tuyệt đối KHÔNG đo kích thước outerWidth/innerWidth vì trên Windows tỉ lệ scale (125%/150%),
      // browser zoom, hoặc side panel của Chrome sẽ gây nhận diện nhầm 100% dù không mở F12!
      let consecutiveDetections = 0;

      const checkDevTools = () => {
        try {
          const start = performance.now();

          new Function('debugger')();
          const elapsed = performance.now() - start;

          if (elapsed > 100) {
            consecutiveDetections += 1;
            if (consecutiveDetections >= 2) {
              setIsBlocked(true);
            }
          } else {
            consecutiveDetections = 0;
            // Nếu DevTools đã đóng lại, tự động mở lại giao diện cho người dùng
            setIsBlocked(false);
          }
        } catch {
          // Bỏ qua nếu môi trường chặn Function
        }
      };

      window.addEventListener('keydown', handleKeyDown, true);
      const intervalId = setInterval(checkDevTools, 1000);

      cleanupEvents = () => {
        window.removeEventListener('keydown', handleKeyDown, true);
        clearInterval(intervalId);
      };
    };

    // Kiểm tra quyền Admin từ server trước khi kích hoạt bảo vệ
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (isCancelled) return;
        const isAdmin = Boolean(
          data && (data.is_admin === 1 || data.is_admin === true),
        );
        if (isAdmin) {
          try {
            localStorage.setItem('is_admin', '1');
            sessionStorage.setItem('is_admin', '1');
          } catch {}
          document.cookie = 'is_admin=1; path=/; max-age=604800; samesite=lax';
          setIsBlocked(false);
          if (cleanupEvents) cleanupEvents();
        } else {
          try {
            localStorage.removeItem('is_admin');
            sessionStorage.setItem('is_admin', '0');
          } catch {}
          // Người dùng thông thường: kích hoạt bảo vệ
          initGuard();
        }
      })
      .catch(() => {
        if (!isCancelled) {
          // Trường hợp lỗi mạng hoặc khách vãng lai chưa đăng nhập
          initGuard();
        }
      });

    return () => {
      isCancelled = true;
      if (cleanupEvents) cleanupEvents();
    };
  }, [pathname]);

  if (!isBlocked) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0c10',
        color: '#ffffff',
        textAlign: 'center',
        padding: '24px',
        fontFamily: "'Noto Sans JP', system-ui, -apple-system, sans-serif",
        zIndex: 99999999,
        userSelect: 'none',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🥺</div>
      <h1
        style={{
          fontSize: '28px',
          fontWeight: 800,
          color: '#6ee7b7',
          marginBottom: '12px',
        }}
      >
        Huhu bạn ơi đi nhầm chỗ rùi!!
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: '#9ca3af',
          maxWidth: '420px',
          lineHeight: '1.6',
        }}
      >
        Trang web này để học tiếng Nhật vui vẻ thôi nè. Hãy đóng cửa sổ DevTools
        và tải lại trang để tiếp tục học nha!
      </p>
    </div>
  );
}
