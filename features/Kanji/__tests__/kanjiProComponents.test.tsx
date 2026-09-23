import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import KanjiProLessonSheet from '../components/KanjiProLessonSheet';
import KanjiProLessonList from '../components/KanjiProLessonList';
import KanjiCardStudyClient from '../components/KanjiCardStudyClient';
import { getLessonDetail } from '../data/kanjiProCurriculum';

const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/kanjipro',
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/features/Preferences', () => ({
  useThemePreferences: () => ({ furiganaEnabled: true }),
  useFontStore: () => ({ currentFont: 'noto-sans-jp' }),
}));

vi.mock('next/font/google', () => {
  return new Proxy(
    {},
    {
      get: () => () => ({ className: 'mock-font', style: {} }),
    },
  );
});

vi.mock('../services/kanjiDataService', () => ({
  kanjiDataService: {
    getKanjiByLevel: vi.fn().mockResolvedValue([]),
    preloadAll: vi.fn().mockResolvedValue(undefined),
    isCached: vi.fn().mockReturnValue(true),
    getAllCached: vi.fn().mockReturnValue({}),
    clearCache: vi.fn(),
  },
}));

describe('KanjiPro UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  const lesson24 = getLessonDetail('n4', 24);

  it('renders KanjiProLessonSheet with exact 9 Kanji from Bài 24 N4', async () => {
    expect(lesson24).not.toBeNull();
    if (!lesson24) return;

    await act(async () => {
      render(<KanjiProLessonSheet lesson={lesson24} />);
    });

    // Header KANJI and Bài 24
    expect(screen.getByText('KANJI')).toBeDefined();
    expect(screen.getAllByText('Bài 24').length).toBeGreaterThan(0);

    // Check all 9 Kanji in the top strip & table
    const chars = ['試', '問', '答', '耳', '用', '験', '集', '研', '台'];
    chars.forEach(char => {
      expect(screen.getAllByText(char).length).toBeGreaterThanOrEqual(1);
    });

    // Check Hán-Việt readings
    const hanviets = [
      'THỬ',
      'VẤN',
      'ĐÁP',
      'NHĨ',
      'DỤNG',
      'NGHIỆM',
      'TẬP',
      'NGHIÊN',
      'ĐÀI',
    ];
    hanviets.forEach(hv => {
      expect(screen.getByText(hv)).toBeDefined();
    });

    // Check meanings
    expect(screen.getByText('Thử')).toBeDefined();
    expect(screen.getByText('Hỏi')).toBeDefined();
    expect(screen.getByText('Trả lời')).toBeDefined();
    expect(screen.getByText('Tai')).toBeDefined();
    expect(screen.getByText('Dùng')).toBeDefined();
    expect(screen.getByText('Kiểm nghiệm')).toBeDefined();
    expect(screen.getByText('Tập hợp')).toBeDefined();
    expect(screen.getByText('Mài, nghiên cứu')).toBeDefined();
    expect(screen.getByText('Bệ, đài')).toBeDefined();

    // Check examples (both 試 and 験 have ': kỳ thi')
    expect(screen.getAllByText(/試験/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(': kỳ thi').length).toBe(2);
    expect(screen.getByText(': Có kỳ thi.')).toBeDefined();

    expect(screen.getAllByText(/問題/).length).toBeGreaterThan(0);
    expect(screen.getByText(': vấn đề, câu hỏi')).toBeDefined();
    expect(screen.getByText(': Hãy đọc câu hỏi.')).toBeDefined();

    expect(screen.getByText(': đáp án')).toBeDefined();
    expect(screen.getByText(': Hãy cho tôi biết đáp án.')).toBeDefined();
  });

  it('toggles mastery status circle when clicked', async () => {
    if (!lesson24) return;

    await act(async () => {
      render(<KanjiProLessonSheet lesson={lesson24} />);
    });

    const toggleButtons = screen.getAllByTitle('Đánh dấu đã học chữ này');
    expect(toggleButtons.length).toBe(9);

    // Click first toggle
    await act(async () => {
      fireEvent.click(toggleButtons[0]);
    });

    // Should now show completed count updated
    expect(screen.getByText(/Đã học: 1\/9 chữ/)).toBeDefined();
  });

  it('renders KanjiProLessonList with Bài 24 available', () => {
    const handleSelect = vi.fn();
    render(
      <KanjiProLessonList
        level='n4'
        selectedLessonNum={null}
        onSelectLesson={handleSelect}
      />,
    );

    expect(screen.getByText('Danh Sách Bài Học Cấp Độ N4')).toBeDefined();
    expect(screen.getByText('Đầy đủ nội dung')).toBeDefined();

    // Click Bài 24
    const b24Button = screen.getByText('Bài 24').closest('button');
    expect(b24Button).not.toBeNull();
    if (b24Button) {
      fireEvent.click(b24Button);
      expect(handleSelect).toHaveBeenCalledWith(
        expect.objectContaining({ lessonNum: 24, level: 'n4' }),
      );
    }
  });

  it('renders lesson list when level=n4 and lesson is not in URL', () => {
    mockSearchParams = new URLSearchParams('level=n4');

    render(<KanjiCardStudyClient />);

    expect(screen.getByText('Danh Sách Bài Học Cấp Độ N4')).toBeDefined();
    expect(screen.queryByText('← Chọn bài khác')).toBeNull();
  });

  it('renders lesson sheet when level=n4 and lesson=24 in URL, and navigates back to lesson list on click', async () => {
    mockSearchParams = new URLSearchParams('level=n4&lesson=24');

    await act(async () => {
      render(<KanjiCardStudyClient />);
    });

    // Should render lesson 24 content
    expect(screen.getByText('KANJI')).toBeDefined();
    expect(screen.getByText('Chọn bài khác')).toBeDefined();

    // Click 'Chọn bài khác'
    const backBtn = screen.getByText('Chọn bài khác');
    await act(async () => {
      fireEvent.click(backBtn);
    });

    // Should have called router.push with level=n4 and no lesson param
    expect(mockPush).toHaveBeenCalledWith('/kanjipro?level=n4', {
      scroll: false,
    });
  });
});
