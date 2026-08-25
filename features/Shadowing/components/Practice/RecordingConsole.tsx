'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DialogueLine } from '../../types';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useSpeechEvaluator } from '../../hooks/useSpeechEvaluator';
import { useShadowingStore } from '../../store/useShadowingStore';
import {
  Mic,
  Square,
  Play,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useClick, useCorrect } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface RecordingConsoleProps {
  dialogue: DialogueLine;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPlayOriginal: () => void;
}

export const RecordingConsole: React.FC<RecordingConsoleProps> = ({
  dialogue,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onPlayOriginal,
}) => {
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { markDialogueCompleted } = useShadowingStore();

  const {
    isRecording,
    recordingBlobUrl,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordError,
  } = useAudioRecorder();

  const { transcript, score, evaluateSpeech } = useSpeechEvaluator();

  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);

  // Reset file ghi âm khi đổi câu thoại
  useEffect(() => {
    clearRecording();
  }, [dialogue.id, clearRecording]);

  const handleToggleRecord = async () => {
    playClick();
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
      // Kích hoạt nhận diện giọng nói đồng thời
      evaluateSpeech(dialogue.japanese, finalScore => {
        if (finalScore >= 60) {
          playCorrect();
          markDialogueCompleted(dialogue.id);
        }
      });
    }
  };

  const handlePlayUserAudio = () => {
    if (!recordingBlobUrl) return;
    playClick();
    if (userAudioRef.current) {
      userAudioRef.current.currentTime = 0;
      userAudioRef.current.play();
      setIsPlayingUserAudio(true);
    }
  };

  return (
    <div className='space-y-6 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-md'>
      {/* User Audio element */}
      {recordingBlobUrl && (
        <audio
          ref={userAudioRef}
          src={recordingBlobUrl}
          onEnded={() => setIsPlayingUserAudio(false)}
          className='hidden'
        />
      )}

      {/* Main Action Controllers */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        {/* Prev Dialogue Button */}
        <button
          type='button'
          disabled={!hasPrev}
          onClick={() => {
            playClick();
            onPrev();
          }}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2.5 text-xs font-bold transition-all',
            !hasPrev
              ? 'cursor-not-allowed opacity-30'
              : 'hover:border-(--main-color) hover:text-(--main-color) active:scale-95',
          )}
        >
          <ChevronLeft className='size-4' />
          <span>Câu trước</span>
        </button>

        {/* Center: Record & Compare Actions */}
        <div className='flex items-center gap-3 sm:gap-4'>
          {/* Nút Nghe câu mẫu */}
          <button
            type='button'
            onClick={() => {
              playClick();
              onPlayOriginal();
            }}
            className='flex size-14 items-center justify-center rounded-2xl border-2 border-(--border-color) bg-(--background-color) text-(--main-color) shadow-sm transition-all hover:border-(--main-color) active:scale-95'
            title='Nghe lại câu mẫu video'
          >
            <Volume2 className='size-6' />
          </button>

          {/* Nút Ghi âm to ở giữa */}
          <button
            type='button'
            onClick={handleToggleRecord}
            className={clsx(
              'flex size-16 items-center justify-center rounded-3xl shadow-xl transition-all active:scale-95',
              isRecording
                ? 'animate-pulse bg-red-500 text-white shadow-red-500/40'
                : 'bg-(--main-color) text-(--background-color) hover:opacity-90',
            )}
            title={
              isRecording
                ? 'Bấm để dừng ghi âm'
                : 'Bấm để bắt đầu thu âm nhại lại'
            }
          >
            {isRecording ? (
              <Square className='size-6 fill-current' />
            ) : (
              <Mic className='size-7' />
            )}
          </button>

          {/* Nút Nghe lại giọng người học */}
          <button
            type='button'
            disabled={!recordingBlobUrl}
            onClick={handlePlayUserAudio}
            className={clsx(
              'flex size-14 items-center justify-center rounded-2xl border-2 shadow-sm transition-all',
              recordingBlobUrl
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white active:scale-95'
                : 'cursor-not-allowed border-(--border-color) bg-(--background-color) text-(--secondary-color)/40',
            )}
            title='Nghe lại giọng vừa thu của bạn'
          >
            <Play
              className={clsx(
                'size-6',
                isPlayingUserAudio ? 'fill-current' : '',
              )}
            />
          </button>
        </div>

        {/* Next Dialogue Button */}
        <button
          type='button'
          disabled={!hasNext}
          onClick={() => {
            playClick();
            onNext();
          }}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-2xl border border-(--border-color) bg-(--background-color) px-4 py-2.5 text-xs font-bold transition-all',
            !hasNext
              ? 'cursor-not-allowed opacity-30'
              : 'hover:border-(--main-color) hover:text-(--main-color) active:scale-95',
          )}
        >
          <span>Câu tiếp</span>
          <ChevronRight className='size-4' />
        </button>
      </div>

      {/* Recording Status / Helper guide */}
      <div className='text-center text-xs text-(--secondary-color)'>
        {isRecording ? (
          <span className='animate-pulse font-bold text-red-500'>
            ● Đang thu âm giọng bạn... Hãy nhại lại theo câu mẫu!
          </span>
        ) : recordingBlobUrl ? (
          <span className='font-semibold text-emerald-500'>
            ✓ Đã thu âm xong. Bấm nút Play xanh để nghe lại và tự so sánh giọng!
          </span>
        ) : (
          <span>Bấm nút Micro để bắt đầu thu âm luyện nói</span>
        )}
      </div>

      {/* Speech Evaluation Card (Điểm phát âm nhận diện) */}
      {(score !== null || transcript) && (
        <div className='space-y-2 rounded-2xl border border-(--border-color) bg-(--background-color)/70 p-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5 text-xs font-bold text-(--main-color)'>
              <Sparkles className='size-3.5 text-amber-400' />
              <span>Độ khớp văn bản nhận diện:</span>
            </div>
            {score !== null && (
              <span
                className={clsx(
                  'text-sm font-black',
                  score >= 80
                    ? 'text-emerald-500'
                    : score >= 50
                      ? 'text-amber-500'
                      : 'text-red-500',
                )}
              >
                {score}%{' '}
                {score >= 80
                  ? '🎉 Xuất sắc!'
                  : score >= 50
                    ? '👍 Tốt'
                    : '💪 Cố gắng thêm'}
              </span>
            )}
          </div>
          {transcript && (
            <p className='text-xs text-(--secondary-color) italic'>
              Máy nghe được: &quot;{transcript}&quot;
            </p>
          )}
        </div>
      )}

      {recordError && (
        <div className='rounded-xl bg-red-500/10 p-3 text-center text-xs font-medium text-red-500'>
          {recordError}
        </div>
      )}
    </div>
  );
};
