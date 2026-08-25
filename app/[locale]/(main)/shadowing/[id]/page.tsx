'use client';

import React, { use, useState, useRef } from 'react';
import {
  useShadowingStore,
  VideoPlayer,
  VideoPlayerRef,
  SubtitleOverlay,
  RecordingConsole,
  DialogueList,
  ShadowingHeader,
  DialogueLine,
} from '@/features/Shadowing';
import { Link } from '@/core/i18n/routing';
import { ArrowLeft, Video } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';

interface ShadowingPracticePageProps {
  params: Promise<{ id: string }>;
}

export default function ShadowingPracticePage({
  params,
}: ShadowingPracticePageProps) {
  const { id } = use(params);
  const { playClick } = useClick();
  const { getVideoById } = useShadowingStore();

  const video = getVideoById(id);
  const playerRef = useRef<VideoPlayerRef | null>(null);

  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);

  if (!video || video.dialogues.length === 0) {
    return (
      <div className='mx-auto max-w-3xl space-y-4 px-4 py-16 text-center'>
        <Video className='mx-auto size-12 text-(--secondary-color)' />
        <h2 className='text-2xl font-bold text-(--main-color)'>
          Không tìm thấy bài học video
        </h2>
        <p className='text-sm text-(--secondary-color)'>
          Video này không tồn tại hoặc đã bị gỡ bỏ.
        </p>
        <Link
          href='/shadowing'
          onClick={playClick}
          className='mt-4 inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-6 py-2.5 text-sm font-bold text-(--background-color)'
        >
          <ArrowLeft className='size-4' />
          Quay lại Thư viện
        </Link>
      </div>
    );
  }

  const currentDialogue = video.dialogues[activeDialogueIndex];
  const hasPrev = activeDialogueIndex > 0;
  const hasNext = activeDialogueIndex < video.dialogues.length - 1;

  const handleSelectDialogue = (d: DialogueLine) => {
    const idx = video.dialogues.findIndex(item => item.id === d.id);
    if (idx !== -1) {
      setActiveDialogueIndex(idx);
      if (playerRef.current) {
        playerRef.current.playDialogueSegment(d.startTime, d.endTime);
      }
    }
  };

  const handleNextDialogue = () => {
    if (hasNext) {
      const nextIdx = activeDialogueIndex + 1;
      setActiveDialogueIndex(nextIdx);
      const nextDialogue = video.dialogues[nextIdx];
      if (playerRef.current) {
        playerRef.current.playDialogueSegment(
          nextDialogue.startTime,
          nextDialogue.endTime,
        );
      }
    }
  };

  const handlePrevDialogue = () => {
    if (hasPrev) {
      const prevIdx = activeDialogueIndex - 1;
      setActiveDialogueIndex(prevIdx);
      const prevDialogue = video.dialogues[prevIdx];
      if (playerRef.current) {
        playerRef.current.playDialogueSegment(
          prevDialogue.startTime,
          prevDialogue.endTime,
        );
      }
    }
  };

  const handleReplayCurrentDialogue = () => {
    if (playerRef.current) {
      playerRef.current.playDialogueSegment(
        currentDialogue.startTime,
        currentDialogue.endTime,
      );
    }
  };

  return (
    <div className='mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6'>
      {/* Top Header */}
      <ShadowingHeader showBackToLibrary />

      {/* Video Title & Level Banner */}
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-(--border-color)/60 pb-3'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='rounded-full bg-(--main-color)/15 px-2.5 py-0.5 text-xs font-black text-(--main-color)'>
              {video.level}
            </span>
            <span className='text-xs text-(--secondary-color)'>
              {video.category}
            </span>
          </div>
          <h1 className='mt-1 text-xl font-black text-(--main-color) sm:text-2xl'>
            {video.title}
          </h1>
        </div>

        <div className='text-xs font-bold text-(--main-color)'>
          Câu {activeDialogueIndex + 1} / {video.dialogues.length}
        </div>
      </div>

      {/* Main 2 Columns Layout */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        {/* Left Column: Player & Subtitles & Recording Console (7 cols) */}
        <div className='space-y-6 lg:col-span-7'>
          {/* Video Player */}
          <VideoPlayer
            ref={playerRef}
            video={video}
            currentDialogue={currentDialogue}
          />

          {/* Subtitles with Furigana & Keywords */}
          <SubtitleOverlay
            dialogue={currentDialogue}
            onReplayDialogue={handleReplayCurrentDialogue}
          />

          {/* Recording & Comparison Console */}
          <RecordingConsole
            dialogue={currentDialogue}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={handlePrevDialogue}
            onNext={handleNextDialogue}
            onPlayOriginal={handleReplayCurrentDialogue}
          />
        </div>

        {/* Right Column: Dialogue Timeline List (5 cols) */}
        <div className='lg:col-span-5'>
          <DialogueList
            dialogues={video.dialogues}
            activeDialogueId={currentDialogue.id}
            onSelectDialogue={handleSelectDialogue}
          />
        </div>
      </div>
    </div>
  );
}
