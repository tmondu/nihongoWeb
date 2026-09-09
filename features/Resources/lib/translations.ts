import type { DifficultyLevel, PriceType, Platform } from '../types';

export const CATEGORY_NAMES_VI: Record<string, string> = {
  apps: 'Ứng dụng',
  websites: 'Trang web',
  textbooks: 'Giáo trình & Sách',
  youtube: 'Kênh YouTube',
  podcasts: 'Podcast',
  games: 'Trò chơi học tập',
  tools: 'Công cụ tiện ích',
  community: 'Cộng đồng',
  jlpt: 'Luyện thi JLPT',
  grammar: 'Ngữ pháp',
  vocabulary: 'Từ vựng',
  kanji: 'Chữ Hán (Kanji)',
  reading: 'Luyện đọc',
  listening: 'Luyện nghe',
  speaking: 'Luyện nói',
  writing: 'Luyện viết',
  immersion: 'Môi trường tắm ngôn ngữ',
};

export const CATEGORY_DESCRIPTIONS_VI: Record<string, string> = {
  apps: 'Ứng dụng di động và máy tính tốt nhất để học tiếng Nhật mọi lúc, mọi nơi.',
  websites:
    'Nền tảng trực tuyến, tài liệu tra cứu và trang web tự học tiếng Nhật chất lượng cao.',
  textbooks:
    'Các bộ sách giáo khoa, tài liệu luyện thi và sách ngữ pháp tiếng Nhật tiêu chuẩn.',
  youtube:
    'Kênh video giảng dạy ngữ pháp, phát âm, từ vựng và văn hóa Nhật Bản trực quan.',
  podcasts:
    'Podcast luyện nghe tiếng Nhật thụ động và chủ động từ người bản xứ.',
  games:
    'Trò chơi nhập vai và ứng dụng tương tác giúp việc ghi nhớ tiếng Nhật thú vị hơn.',
  tools: 'Bộ gõ, tiện ích trình duyệt và công cụ hỗ trợ người học tiếng Nhật.',
  community:
    'Diễn đàn, nhóm trao đổi ngôn ngữ và cộng đồng người học tiếng Nhật toàn cầu.',
};

export const DIFFICULTY_LABELS_VI: Record<DifficultyLevel, string> = {
  beginner: 'Sơ cấp',
  intermediate: 'Trung cấp',
  advanced: 'Cao cấp',
  'all-levels': 'Mọi trình độ',
};

export const DIFFICULTY_LABELS_EN: Record<DifficultyLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  'all-levels': 'All Levels',
};

export const PRICE_LABELS_VI: Record<PriceType, string> = {
  free: 'Miễn phí',
  freemium: 'Freemium',
  paid: 'Trả phí',
  subscription: 'Đăng ký',
};

export const PRICE_LABELS_EN: Record<PriceType, string> = {
  free: 'Free',
  freemium: 'Freemium',
  paid: 'Paid',
  subscription: 'Subs',
};

export const PLATFORM_LABELS_VI: Record<Platform, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  physical: 'Sách in',
  'browser-extension': 'Tiện ích duyệt web',
  api: 'API',
};

export const PLATFORM_LABELS_EN: Record<Platform, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Droid',
  windows: 'Win',
  macos: 'Mac',
  linux: 'Linux',
  physical: 'Print',
  'browser-extension': 'Ext',
  api: 'API',
};
