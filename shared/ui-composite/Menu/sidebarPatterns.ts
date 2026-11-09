import type { CSSProperties } from 'react';

export type SidebarPatternId =
  | 'none'
  | 'seigaiha'
  | 'sakura'
  | 'shippo'
  | 'aurora'
  | 'dotgrid';

export interface SidebarPatternOption {
  id: SidebarPatternId;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  style: CSSProperties;
}

// 1. Wagara Seigaiha (Sóng biển Thanh Hải Ba 青海波)
const seigaihaSvg = `data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%230284c7' stroke-width='1.2' stroke-opacity='0.22'%3E%3Cpath d='M0,20 A20,20 0 0,1 40,20' /%3E%3Cpath d='M5,20 A15,15 0 0,1 35,20' /%3E%3Cpath d='M10,20 A10,10 0 0,1 30,20' /%3E%3Cpath d='M15,20 A5,5 0 0,1 25,20' /%3E%3Cpath d='M-20,10 A20,20 0 0,1 20,10' stroke='%238b5cf6' stroke-opacity='0.18'/%3E%3Cpath d='M-15,10 A15,15 0 0,1 15,10' stroke='%238b5cf6' stroke-opacity='0.18'/%3E%3Cpath d='M-10,10 A10,10 0 0,1 10,10' stroke='%238b5cf6' stroke-opacity='0.18'/%3E%3Cpath d='M-5,10 A5,5 0 0,1 5,10' stroke='%238b5cf6' stroke-opacity='0.18'/%3E%3Cpath d='M20,10 A20,20 0 0,1 60,10' stroke='%238b5cf6' stroke-opacity='0.18'/%3E%3Cpath d='M25,10 A15,15 0 0,1 55,10' stroke='%238b5cf6' stroke-opacity='0.18'/%3E%3Cpath d='M30,10 A10,10 0 0,1 50,10' stroke='%238b5cf6' stroke-opacity='0.18'/%3E%3Cpath d='M35,10 A5,5 0 0,1 45,10' stroke='%238b5cf6' stroke-opacity='0.18'/%3E%3C/g%3E%3C/svg%3E`;

// 2. Chiyogami Sakura Chirashi (Cánh hoa anh đào rơi 桜散らし)
const sakuraSvg = `data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f43f5e' fill-opacity='0.20'%3E%3Cpath d='M12 10c1.5-3 5-3 6.5 0 1.5 3-1.5 6-3.25 6-1.75 0-4.75-3-3.25-6z'/%3E%3Cpath d='M18.5 13.5c3-1.5 5 1.5 3.5 4.5-1.5 3-5 2-5.7 0.3-.7-1.7 0-4 2.2-4.8z'/%3E%3Cpath d='M10 16c-1-3 2.5-5 5-3 2.5 2 1.5 5.5-.5 6-2 .5-3.8-1-4.5-3z'/%3E%3Ccircle cx='15' cy='14' r='1.5' fill='%23fbbf24' fill-opacity='0.5'/%3E%3C/g%3E%3Cg fill='%23ec4899' fill-opacity='0.16'%3E%3Cellipse cx='36' cy='32' rx='3' ry='6' transform='rotate(35 36 32)'/%3E%3Cellipse cx='8' cy='38' rx='2.5' ry='5' transform='rotate(-40 8 38)'/%3E%3Cellipse cx='40' cy='12' rx='2' ry='4.5' transform='rotate(60 40 12)'/%3E%3C/g%3E%3C/svg%3E`;

// 3. Wagara Shippo (Thất bảo Thất sắc 七宝)
const shippoSvg = `data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke-width='1.2'%3E%3Ccircle cx='18' cy='18' r='18' stroke='%238b5cf6' stroke-opacity='0.22'/%3E%3Ccircle cx='0' cy='0' r='18' stroke='%230d9488' stroke-opacity='0.2'/%3E%3Ccircle cx='36' cy='0' r='18' stroke='%23e11d48' stroke-opacity='0.18'/%3E%3Ccircle cx='0' cy='36' r='18' stroke='%233b82f6' stroke-opacity='0.2'/%3E%3Ccircle cx='36' cy='36' r='18' stroke='%23d946ef' stroke-opacity='0.18'/%3E%3Ccircle cx='18' cy='18' r='2' fill='%236366f1' fill-opacity='0.28'/%3E%3C/g%3E%3C/svg%3E`;

// 4. Dot Grid xanh ngọc (Mint Cyan Dot Grid)
const dotGridSvg = `data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 18 18' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='9' cy='9' r='1.1' fill='%2319988b' fill-opacity='0.28'/%3E%3C/svg%3E`;

export const SIDEBAR_PATTERNS: Record<SidebarPatternId, SidebarPatternOption> =
  {
    none: {
      id: 'none',
      label: 'Nền trơn (Không hoa văn)',
      shortLabel: 'Nền trơn',
      icon: '🚫',
      description: 'Che phủ hoàn toàn ô li bằng nền màu thẻ sạch sẽ',
      style: {
        backgroundColor: 'var(--card-color)',
        backgroundImage: 'none',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      },
    },
    seigaiha: {
      id: 'seigaiha',
      label: 'Sóng biển Seigaiha (青海波)',
      shortLabel: 'Sóng biển',
      icon: '🌊',
      description: 'Sóng biển Nhật Bản uốn lượn đa tầng Indigo sang Sakura',
      style: {
        backgroundColor: '#f0f9ff',
        backgroundImage: `url("${seigaihaSvg}"), linear-gradient(180deg, rgba(224, 242, 254, 0.94) 0%, rgba(250, 232, 255, 0.94) 50%, rgba(253, 242, 248, 0.96) 100%)`,
        backgroundSize: '40px 20px, 100% 100%',
        backgroundRepeat: 'repeat, no-repeat',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
    },
    sakura: {
      id: 'sakura',
      label: 'Hoa anh đào Chiyogami (桜)',
      shortLabel: 'Anh đào',
      icon: '🌸',
      description: 'Cánh hoa anh đào rơi trên giấy Washi màu hồng ấm',
      style: {
        backgroundColor: '#fff7f7',
        backgroundImage: `url("${sakuraSvg}"), linear-gradient(180deg, rgba(255, 247, 247, 0.96) 0%, rgba(254, 242, 242, 0.95) 50%, rgba(253, 244, 255, 0.96) 100%)`,
        backgroundSize: '48px 48px, 100% 100%',
        backgroundRepeat: 'repeat, no-repeat',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
    },
    shippo: {
      id: 'shippo',
      label: 'Thất bảo hình học Shippo (七宝)',
      shortLabel: 'Thất bảo',
      icon: '🔷',
      description: 'Vòng tròn đan cài đa sắc Violet - Teal - Rose hiện đại',
      style: {
        backgroundColor: '#faf5ff',
        backgroundImage: `url("${shippoSvg}"), linear-gradient(180deg, rgba(245, 243, 255, 0.95) 0%, rgba(236, 254, 255, 0.94) 50%, rgba(255, 241, 242, 0.96) 100%)`,
        backgroundSize: '36px 36px, 100% 100%',
        backgroundRepeat: 'repeat, no-repeat',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
    },
    aurora: {
      id: 'aurora',
      label: 'Cực quang Aurora Mesh Glass',
      shortLabel: 'Cực quang',
      icon: '🌌',
      description:
        'Vệt loang cực quang phát sáng Cyan - Rose - Violet sang trọng',
      style: {
        backgroundColor: '#ffffff',
        backgroundImage: `linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.88) 100%),
        radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.42) 0px, transparent 55%),
        radial-gradient(at 100% 35%, rgba(244, 63, 94, 0.32) 0px, transparent 50%),
        radial-gradient(at 10% 75%, rgba(168, 85, 247, 0.35) 0px, transparent 55%),
        radial-gradient(at 90% 100%, rgba(251, 191, 36, 0.32) 0px, transparent 50%)`,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      },
    },
    dotgrid: {
      id: 'dotgrid',
      label: 'Chấm bi xanh Mint (Dot Grid)',
      shortLabel: 'Chấm bi',
      icon: '🟢',
      description: 'Chấm bi xanh ngọc pastel đồng bộ hoàn hảo với nền web',
      style: {
        backgroundColor: 'oklch(0.9720 0.0240 185.50 / 0.95)',
        backgroundImage: `url("${dotGridSvg}")`,
        backgroundSize: '18px 18px',
        backgroundRepeat: 'repeat',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      },
    },
  };
