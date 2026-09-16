'use client';

import React, { use } from 'react';
import { LessonDetailView } from '@/features/Curriculum';

interface LessonDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default function LessonDetailPage({ params }: LessonDetailPageProps) {
  const { id } = use(params);
  const lessonNum = parseInt(id, 10) || 1;

  return <LessonDetailView lessonId={lessonNum} />;
}
