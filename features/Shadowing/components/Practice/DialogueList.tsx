'use client';

import React from 'react';
import { DialogueLine } from '../../types';
import { useShadowingStore } from '../../store/useShadowingStore';
import { CheckCircle2 } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface DialogueListProps {
  dialogues: DialogueLine[];
  activeDialogueId: number;
  onSelectDialogue: (dialogue: DialogueLine) => void;
}

export const DialogueList: React.FC<DialogueListProps> = ({
  dialogues,
  activeDialogueId,
  onSelectDialogue,
}) => {
  const { playClick } = useClick();
  const { completedDialogueIds } = useShadowingStore();

  return (
    <div className='space-y-4 rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-5 shadow-sm sm:p-6'>
      <div className='flex items-center justify-between border-b border-(--border-color)/50 pb-3'>
        <h3 className='text-base font-extrabold text-(--main-color)'>
          Danh sách câu thoại ({dialogues.length} câu)
        </h3>
        <span className='text-xs font-semibold text-(--secondary-color)'>
          Đã luyện:{' '}
          <strong className='text-emerald-500'>
            {dialogues.filter(d => completedDialogueIds.includes(d.id)).length}
          </strong>{' '}
          / {dialogues.length}
        </span>
      </div>

      <div className='max-h-96 space-y-2.5 overflow-y-auto pr-1'>
        {dialogues.map((d, index) => {
          const isActive = d.id === activeDialogueId;
          const isCompleted = completedDialogueIds.includes(d.id);

          return (
            <button
              key={d.id}
              type='button'
              onClick={() => {
                playClick();
                onSelectDialogue(d);
              }}
              className={clsx(
                'flex w-full items-start justify-between gap-3 rounded-2xl p-3.5 text-left transition-all',
                'active:scale-98',
                isActive
                  ? 'border-2 border-(--main-color) bg-(--main-color)/10 text-(--main-color)'
                  : 'border border-(--border-color) bg-(--background-color) text-(--main-color) hover:border-(--main-color)/50',
              )}
            >
              <div className='flex min-w-0 flex-1 items-start gap-2.5'>
                <span className='flex size-6 shrink-0 items-center justify-center rounded-full border border-(--border-color) bg-(--card-color) text-[11px] font-bold text-(--secondary-color)'>
                  {index + 1}
                </span>
                <div className='flex-1 truncate'>
                  <div className='truncate text-sm font-bold'>{d.japanese}</div>
                  <div className='mt-0.5 truncate text-xs text-(--secondary-color)'>
                    {d.vietnamese}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className='shrink-0 pt-0.5'>
                {isCompleted ? (
                  <CheckCircle2 className='size-4 text-emerald-500' />
                ) : (
                  <span className='font-mono text-[10px] text-(--secondary-color)/60'>
                    {d.startTime}s
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
