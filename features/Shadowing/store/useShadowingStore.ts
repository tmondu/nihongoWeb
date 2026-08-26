import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShadowingVideo } from '../types';
import { SAMPLE_SHADOWING_VIDEOS } from '../data/sampleVideos';

interface ShadowingState {
  videos: ShadowingVideo[];
  completedDialogueIds: number[];
  favoriteVideoIds: string[];

  // Cài đặt hiển thị & phát lại
  showFurigana: boolean;
  showRomaji: boolean;
  showVietnamese: boolean;
  autoLoopDialogue: boolean;
  playbackSpeed: number;

  // Actions
  toggleFurigana: () => void;
  toggleRomaji: () => void;
  toggleVietnamese: () => void;
  toggleAutoLoop: () => void;
  setPlaybackSpeed: (speed: number) => void;
  markDialogueCompleted: (dialogueId: number) => void;
  toggleFavoriteVideo: (videoId: string) => void;
  getVideoById: (id: string) => ShadowingVideo | undefined;
}

export const useShadowingStore = create<ShadowingState>()(
  persist(
    set => ({
      videos: SAMPLE_SHADOWING_VIDEOS,
      completedDialogueIds: [],
      favoriteVideoIds: [],

      showFurigana: true,
      showRomaji: false,
      showVietnamese: true,
      autoLoopDialogue: true,
      playbackSpeed: 1.0,

      toggleFurigana: () =>
        set(state => ({ showFurigana: !state.showFurigana })),

      toggleRomaji: () => set(state => ({ showRomaji: !state.showRomaji })),

      toggleVietnamese: () =>
        set(state => ({ showVietnamese: !state.showVietnamese })),

      toggleAutoLoop: () =>
        set(state => ({ autoLoopDialogue: !state.autoLoopDialogue })),

      setPlaybackSpeed: speed => set({ playbackSpeed: speed }),

      markDialogueCompleted: dialogueId =>
        set(state => ({
          completedDialogueIds: state.completedDialogueIds.includes(dialogueId)
            ? state.completedDialogueIds
            : [...state.completedDialogueIds, dialogueId],
        })),

      toggleFavoriteVideo: videoId =>
        set(state => ({
          favoriteVideoIds: state.favoriteVideoIds.includes(videoId)
            ? state.favoriteVideoIds.filter(id => id !== videoId)
            : [...state.favoriteVideoIds, videoId],
        })),

      getVideoById: id => {
        return SAMPLE_SHADOWING_VIDEOS.find(v => v.id === id);
      },
    }),
    {
      name: 'ptham-shadowing-storage-v2',
      partialize: state => ({
        completedDialogueIds: state.completedDialogueIds,
        favoriteVideoIds: state.favoriteVideoIds,
        showFurigana: state.showFurigana,
        showRomaji: state.showRomaji,
        showVietnamese: state.showVietnamese,
        autoLoopDialogue: state.autoLoopDialogue,
        playbackSpeed: state.playbackSpeed,
      }),
    },
  ),
);
