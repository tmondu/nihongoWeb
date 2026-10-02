import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  EXAM_1_N5_SOLUTION,
  getSolutionByLevelAndExam,
  getSolutionsByLevel,
} from '../data/solutionsData';
import SolutionA4Paper from '../components/SolutionA4Paper';
import QuickAnswerChecker from '../components/QuickAnswerChecker';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt || 'mocked image'} />
  ),
}));

describe('Solutions Data & Logic', () => {
  it('contains exactly 35 questions for Đề 1 N5 matching the PDF', () => {
    expect(EXAM_1_N5_SOLUTION.questions).toHaveLength(35);
    expect(EXAM_1_N5_SOLUTION.level).toBe('n5');
    expect(EXAM_1_N5_SOLUTION.examNumber).toBe(1);
    expect(EXAM_1_N5_SOLUTION.title).toBe('ĐÁP ÁN CHI TIẾT ĐỀ 1');
    expect(EXAM_1_N5_SOLUTION.author).toBe('Phan Thắm SS - Minato');
  });

  it('correctly maps quick answer key summary for Vocab (9) and Grammar (26)', () => {
    expect(EXAM_1_N5_SOLUTION.quickAnswerSummary.vocab).toHaveLength(9);
    expect(EXAM_1_N5_SOLUTION.quickAnswerSummary.grammar).toHaveLength(26);

    // Q1 Vocab: ③ (すいようび)
    expect(EXAM_1_N5_SOLUTION.quickAnswerSummary.vocab[0].answer).toBe('③');
    // Q1 Grammar: ③ (の)
    expect(EXAM_1_N5_SOLUTION.quickAnswerSummary.grammar[0].answer).toBe('③');
    // Q26 Grammar: ③/④
    expect(EXAM_1_N5_SOLUTION.quickAnswerSummary.grammar[25].answer).toBe(
      '③/④',
    );
  });

  it('retrieves exam via helper getSolutionByLevelAndExam', () => {
    const exam = getSolutionByLevelAndExam('n5', 1);
    expect(exam).not.toBeNull();
    expect(exam?.id).toBe('n5-de1');

    const nonExistent = getSolutionByLevelAndExam('n1', 99);
    expect(nonExistent).toBeNull();
  });

  it('retrieves exams via helper getSolutionsByLevel', () => {
    const n5Exams = getSolutionsByLevel('n5');
    expect(n5Exams.length).toBeGreaterThanOrEqual(1);

    const n1Exams = getSolutionsByLevel('n1');
    expect(n1Exams).toHaveLength(0);
  });
});

describe('SolutionA4Paper Component', () => {
  it('renders author, title, quick answer grid and questions', () => {
    render(<SolutionA4Paper exam={EXAM_1_N5_SOLUTION} />);

    // Header & Titles
    expect(screen.getAllByText('Phan Thắm SS - Minato').length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText('ĐÁP ÁN CHI TIẾT ĐỀ 1')).toBeDefined();
    expect(screen.getByText('TỪ VỰNG, NGỮ PHÁP DỄ NHẦM')).toBeDefined();

    // Quick answer grid title
    expect(screen.getByText('BẢNG ĐÁP ÁN TỔNG HỢP NHANH')).toBeDefined();

    // Check Question 1 (Vocab)
    expect(screen.getByText('きょうは 水ようびです。')).toBeDefined();
    expect(screen.getByText('③ – すいようび')).toBeDefined();
    expect(screen.getByText('水 – THỦY')).toBeDefined();
    expect(screen.getByText('Hôm nay là thứ Tư.')).toBeDefined();

    // Check Star Question 17
    expect(
      screen.getByText('新試験は ＿＿＿ ＿＿＿ ＿＿＿ ＿★＿ はじまります。'),
    ).toBeDefined();
    expect(screen.getByText(/Thứ tự đúng: ① → ③ → ④ → ②/)).toBeDefined();

    // Check Passage section at the bottom
    expect(screen.getByText('📖 ĐOẠN VĂN HOÀN CHỈNH (BÀI 4)')).toBeDefined();
    expect(
      screen.getAllByText(/月ようびから 金ようびまで/).length,
    ).toBeGreaterThan(0);
  });
});

describe('QuickAnswerChecker Component', () => {
  it('renders scoreboard and lets user choose answers', () => {
    const mockSelect = vi.fn();
    const mockClear = vi.fn();
    const mockPrint = vi.fn();
    const mockToggleFilter = vi.fn();

    render(
      <QuickAnswerChecker
        exam={EXAM_1_N5_SOLUTION}
        userAnswers={{ 1: '③', 2: '①' }} // 1 correct, 1 wrong
        onSelectAnswer={mockSelect}
        onClearAnswers={mockClear}
        filterWrongOnly={false}
        onToggleFilterWrong={mockToggleFilter}
        onPrint={mockPrint}
        isAdmin={true}
      />,
    );

    // Title & Scoreboard
    expect(screen.getByText('Bảng Chấm Điểm & Tự Check')).toBeDefined();
    expect(screen.getByText('2/35')).toBeDefined(); // Đã làm
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2); // 1 đúng, 1 sai

    // Click print
    const printBtn = screen.getByText('In A4');
    fireEvent.click(printBtn);
    expect(mockPrint).toHaveBeenCalledTimes(1);

    // Click clear
    const resetBtn = screen.getByText('Làm lại');
    fireEvent.click(resetBtn);
    expect(mockClear).toHaveBeenCalledTimes(1);
  });
});
