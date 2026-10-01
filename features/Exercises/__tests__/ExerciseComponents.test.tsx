import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FormattedText } from '../components/FormattedText';
import { ExerciseA4Paper } from '../components/ExerciseA4Paper';
import { ExerciseWatermark } from '../components/ExerciseWatermark';
import { PublicQuestion } from '@/shared/types/exercise';

// Mock useAudio
vi.mock('@/shared/hooks/generic/useAudio', () => ({
  useClick: () => ({ playClick: vi.fn() }),
  useCorrect: () => ({ playCorrect: vi.fn() }),
  useError: () => ({ playError: vi.fn(), playErrorTwice: vi.fn() }),
}));

describe('FormattedText Component', () => {
  it('renders standard text cleanly', () => {
    const { container } = render(
      <FormattedText text='きょうは いい てんきです。' />,
    );
    expect(container.textContent).toContain('きょうは いい てんきです。');
  });

  it('renders underlined <u> text correctly', () => {
    const { container } = render(
      <FormattedText text='うちから えきまで あるいて <u>十分</u>です。' />,
    );
    expect(container.textContent).toContain(
      'うちから えきまで あるいて 十分です。',
    );
  });

  it('renders blank highlight tags like [ 18 ]', () => {
    const { container } = render(
      <FormattedText text='文の空欄 [ 18 ] に入る言葉を選んでください。' />,
    );
    expect(container.textContent).toContain('[ 18 ]');
  });
});

describe('ExerciseWatermark Component', () => {
  it('renders watermark text', () => {
    render(<ExerciseWatermark text='文法' subText='Phan Thắm SS' />);
    expect(screen.getByText('文法')).toBeDefined();
    expect(screen.getByText('Phan Thắm SS')).toBeDefined();
  });
});

describe('ExerciseA4Paper Component', () => {
  const sampleQuestions: PublicQuestion[] = [
    {
      id: 10,
      part_name: '問題 1',
      question: '[10] うちから えきまで あるいて <u>十分</u>です。',
      options: ['じゅっぷん', 'じゅっぶん', 'じゅうぶん', 'じゅうぷん'],
    },
    {
      id: 11,
      part_name: '問題 1',
      question: 'きょうは <u>学校</u>が やすみです。',
      options: ['がこ', 'がっこ', 'がこう', 'がっこう'],
    },
  ];

  it('renders exam paper header, title and footer badge', () => {
    render(
      <ExerciseA4Paper
        title='ĐỀ 2 – 60 NGÀY CHẮC GỐC N5'
        timeLimitMinutes={30}
        totalQuestions={2}
        questions={sampleQuestions}
        answers={{}}
        onSelectOption={vi.fn()}
      />,
    );

    expect(screen.getByText('ĐỀ 2 – 60 NGÀY CHẮC GỐC N5')).toBeDefined();
    expect(
      screen.getByText('Tài liệu được biên soạn bởi Phan Thắm SS'),
    ).toBeDefined();
    expect(screen.getByText('問題')).toBeDefined();
  });

  it('allows clicking choices to trigger selection callback', () => {
    const onSelectMock = vi.fn();
    render(
      <ExerciseA4Paper
        title='ĐỀ 2 – 60 NGÀY CHẮC GỐC N5'
        totalQuestions={2}
        questions={sampleQuestions}
        answers={{}}
        onSelectOption={onSelectMock}
      />,
    );

    const firstOption = screen.getByText('じゅっぷん');
    fireEvent.click(firstOption);

    expect(onSelectMock).toHaveBeenCalledWith('10', 'A');
  });
});
