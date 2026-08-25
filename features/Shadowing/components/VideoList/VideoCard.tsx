/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { ShadowingVideo } from '../../types';
import { Link } from '@/core/i18n/routing';
import { Play, MessageCircle, Clock } from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import clsx from 'clsx';

interface VideoCardProps {
  video: ShadowingVideo;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { playClick } = useClick();

  const levelBadgeColors: Record<string, string> = {
    N5: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    N4: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    N3: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    N2: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    N1: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
  };

  const thumbnail =
    video.thumbnailUrl ||
    (video.youtubeId
      ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`
      : '/images/default-video-thumbnail.jpg');

  return (
    <Link
      href={`/shadowing/${video.id}`}
      onClick={playClick}
      className='group flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-(--border-color) bg-(--card-color) transition-all duration-300 hover:-translate-y-1.5 hover:border-(--main-color) hover:shadow-xl'
    >
      {/* Video Thumbnail with Badges */}
      <div className='relative aspect-video w-full overflow-hidden bg-zinc-900'>
        <img
          src={thumbnail}
          alt={video.title}
          className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          loading='lazy'
        />

        {/* Overlay Play Icon on Hover */}
        <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
          <div className='flex size-14 items-center justify-center rounded-full bg-(--main-color) text-(--background-color) shadow-2xl transition-transform duration-300 group-hover:scale-110'>
            <Play className='ml-0.5 size-6 fill-current' />
          </div>
        </div>

        {/* Badges */}
        <div className='absolute top-3 left-3 flex items-center gap-1.5'>
          <span
            className={clsx(
              'rounded-full border px-2.5 py-0.5 text-xs font-black shadow-md backdrop-blur-md',
              levelBadgeColors[video.level] ||
                'border-zinc-700 bg-zinc-800 text-white',
            )}
          >
            {video.level}
          </span>
          <span className='rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md'>
            {video.category}
          </span>
        </div>

        {/* Duration badge */}
        <div className='absolute right-2.5 bottom-2.5 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-md'>
          <Clock className='size-3' />
          <span>{video.duration}</span>
        </div>
      </div>

      {/* Video Details */}
      <div className='flex flex-1 flex-col justify-between space-y-3 p-5'>
        <div>
          <h3 className='line-clamp-2 text-lg leading-snug font-black text-(--main-color) group-hover:text-(--main-color)'>
            {video.title}
          </h3>
          <p className='mt-1 line-clamp-2 text-xs text-(--secondary-color)'>
            {video.description}
          </p>
        </div>

        {/* Card Footer info */}
        <div className='flex items-center justify-between border-t border-(--border-color)/50 pt-3 text-xs text-(--secondary-color)'>
          <div className='flex items-center gap-1 font-semibold'>
            <MessageCircle className='size-3.5' />
            <span>{video.dialogues.length} câu thoại</span>
          </div>

          <span className='font-bold text-(--main-color) transition-transform group-hover:translate-x-0.5'>
            Luyện tập ➔
          </span>
        </div>
      </div>
    </Link>
  );
};
