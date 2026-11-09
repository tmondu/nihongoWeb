import React from 'react';
import type { Metadata } from 'next';
import AssessmentContainer from '@/features/Assessment/components/AssessmentContainer';

export const metadata: Metadata = {
  title: 'Kiểm tra đầu vào N5 | PThamSS',
  description:
    'Bài kiểm tra đánh giá năng lực đầu vào tiếng Nhật N5 gồm 200 câu hỏi (100 trắc nghiệm + 100 tự luận).',
};

export default function AssessmentPage() {
  return <AssessmentContainer />;
}
