'use client';

import React, { memo, useCallback } from 'react';
import { cn } from '@/shared/utils/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  Smartphone,
  Globe,
  Monitor,
  Apple,
  BookOpen,
  Puzzle,
  ArrowUpRight,
  X,
} from 'lucide-react';
import type { Resource, Platform } from '../types';
import { ResourceCard } from './ResourceCard';

import {
  CATEGORY_NAMES_VI,
  DIFFICULTY_LABELS_VI,
  DIFFICULTY_LABELS_EN,
  PRICE_LABELS_VI,
  PRICE_LABELS_EN,
} from '../lib/translations';

// ============================================================================
// Types
// ============================================================================

export interface ResourceDetailModalProps {
  /** The resource to display (null when closed) */
  resource: Resource | null;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Related resources to display */
  relatedResources?: Resource[];
  /** Callback when a related resource is selected */
  onRelatedSelect?: (resource: Resource) => void;
  /** Current locale */
  locale?: string;
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Editorial Badge component for displaying labels
 */
const Badge = memo(function Badge({
  children,
  variant = 'generic',
  className,
}: {
  children: React.ReactNode;
  variant?: 'difficulty' | 'price' | 'generic';
  className?: string;
}) {
  const variantStyles = {
    generic: 'text-(--secondary-color) border-(--border-color)',
    difficulty:
      'text-(--main-color) border-(--main-color)/20 bg-(--main-color)/5',
    price:
      'text-(--secondary-color) border-(--secondary-color)/30 bg-(--secondary-color)/10',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-bold tracking-widest uppercase',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
});

/**
 * Platform icon and label component
 */
const PlatformBadge = memo(function PlatformBadge({
  platform,
}: {
  platform: Platform;
}) {
  const iconProps = {
    size: 14,
    className: 'text-(--main-color)',
  };

  const getPlatformInfo = (p: Platform) => {
    switch (p) {
      case 'ios':
        return { label: 'iOS', icon: <Apple {...iconProps} /> };
      case 'android':
        return { label: 'Android', icon: <Smartphone {...iconProps} /> };
      case 'web':
        return { label: 'Web', icon: <Globe {...iconProps} /> };
      case 'windows':
        return { label: 'Windows', icon: <Monitor {...iconProps} /> };
      case 'macos':
        return { label: 'macOS', icon: <Apple {...iconProps} /> };
      case 'linux':
        return { label: 'Linux', icon: <Monitor {...iconProps} /> };
      case 'physical':
        return { label: 'Print', icon: <BookOpen {...iconProps} /> };
      case 'browser-extension':
        return { label: 'Extension', icon: <Puzzle {...iconProps} /> };
      case 'api':
        return { label: 'API', icon: <Globe {...iconProps} /> };
      default:
        return { label: p, icon: null };
    }
  };

  const info = getPlatformInfo(platform);

  return (
    <div className='flex items-center gap-2 rounded-sm border border-(--border-color) px-3 py-1.5'>
      {info.icon}
      <span className='text-xs font-bold tracking-tight text-(--main-color) uppercase'>
        {info.label}
      </span>
    </div>
  );
});

// ============================================================================
// ResourceDetailModal Component (Optimized)
// ============================================================================

export const ResourceDetailModal = memo(function ResourceDetailModal({
  resource,
  isOpen,
  onClose,
  relatedResources = [],
  onRelatedSelect,
  locale = 'vi',
}: ResourceDetailModalProps) {
  const isVi = locale === 'vi';
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!resource) return null;

  const description = resource.descriptionLong || resource.description;

  const difficultyLabel = isVi
    ? DIFFICULTY_LABELS_VI[resource.difficulty] || resource.difficulty
    : DIFFICULTY_LABELS_EN[resource.difficulty] || resource.difficulty;

  const priceLabel = isVi
    ? PRICE_LABELS_VI[resource.priceType] || resource.priceType
    : PRICE_LABELS_EN[resource.priceType] || resource.priceType;

  const categoryLabel = isVi
    ? CATEGORY_NAMES_VI[resource.category] || resource.category
    : resource.category;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal forceMount>
        <DialogPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80' />
        <DialogPrimitive.Content
          className='fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col gap-0 rounded-2xl border-0 border-(--border-color) bg-(--background-color) p-0 selection:bg-(--main-color) selection:text-(--background-color) sm:max-h-[80vh] sm:w-[90vw]'
          onOpenAutoFocus={e => e.preventDefault()}
        >
          {/* Sticky Header */}
          <div className='sticky top-0 z-10 flex flex-row items-center justify-between rounded-t-2xl border-b border-(--border-color) bg-(--background-color) px-6 pt-6 pb-4 sm:px-12'>
            <div className='flex items-center gap-4'>
              <span className='text-[10px] font-bold tracking-[0.3em] text-(--secondary-color) uppercase opacity-40'>
                {isVi ? 'Hồ sơ tài nguyên' : 'Resource Dossier'}
              </span>
              <div className='hidden h-px w-12 bg-(--border-color) sm:block' />
              <Badge variant='generic' className='hidden sm:inline-flex'>
                {categoryLabel}
              </Badge>
            </div>
            <button
              onClick={handleClose}
              className='shrink-0 cursor-pointer rounded-xl p-2 hover:bg-(--card-color)'
            >
              <X size={24} className='text-(--secondary-color)' />
            </button>
          </div>

          <div
            id='modal-scroll'
            className='flex-1 overflow-y-auto px-6 py-8 sm:px-12 sm:py-12'
          >
            <DialogPrimitive.Title className='mb-12 flex flex-col text-4xl leading-tight font-black tracking-tighter text-(--main-color) md:text-6xl'>
              <span>{resource.name}</span>
            </DialogPrimitive.Title>

            <div className='grid grid-cols-1 gap-16 lg:grid-cols-12'>
              <div className='space-y-12 lg:col-span-8'>
                <section>
                  <h3 className='mb-6 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
                    {isVi ? 'Tổng quan' : 'Overview'}
                  </h3>
                  <div className='space-y-6 text-lg leading-relaxed text-(--main-color) md:text-xl'>
                    {description.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>

                {resource.notes && (
                  <section className='rounded-lg border-l-2 border-(--main-color) bg-(--main-color)/[0.02] p-8'>
                    <h3 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
                      {isVi ? 'Ghi chú & Đánh giá' : "Curator's Notes"}
                    </h3>
                    <p className='text-sm leading-relaxed text-(--secondary-color) italic'>
                      {resource.notes}
                    </p>
                  </section>
                )}

                <section>
                  <h3 className='mb-6 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
                    {isVi ? 'Chủ đề & Từ khóa' : 'Architecture & Tags'}
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {resource.tags.map(tag => (
                      <span
                        key={tag}
                        className='cursor-default rounded border border-(--border-color) px-2 py-1 font-mono text-[10px] text-(--secondary-color) transition-colors hover:border-(--main-color) hover:bg-(--main-color) hover:text-(--background-color)'
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              <div className='shrink-0 space-y-12 lg:col-span-4'>
                <div className='space-y-8 lg:sticky lg:top-0'>
                  <section>
                    <h3 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
                      {isVi ? 'Thông tin phân loại' : 'Credentials'}
                    </h3>
                    <div className='flex flex-col gap-3'>
                      <Badge variant='difficulty'>{difficultyLabel}</Badge>
                      <Badge variant='price'>{priceLabel}</Badge>
                      {resource.priceDetails && (
                        <p className='font-mono text-[10px] tracking-tighter text-(--secondary-color) uppercase opacity-50'>
                          {resource.priceDetails}
                        </p>
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
                      {isVi ? 'Nền tảng hỗ trợ' : 'Deployments'}
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {resource.platforms.map(platform => (
                        <PlatformBadge key={platform} platform={platform} />
                      ))}
                    </div>
                  </section>

                  <a
                    href={resource.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={cn(
                      'group mt-12 flex w-full cursor-pointer items-center justify-between rounded-full bg-(--main-color) p-6 text-(--background-color) transition-colors duration-300',
                      'hover:bg-(--main-color)/90',
                    )}
                  >
                    <span className='text-sm font-bold tracking-tight uppercase'>
                      {isVi ? 'Truy cập tài nguyên' : 'Initialize Access'}
                    </span>
                    <ArrowUpRight className='transition-colors group-hover:text-(--background-color)' />
                  </a>
                </div>
              </div>
            </div>

            {/* Related Resources */}
            {relatedResources.length > 0 && (
              <footer className='mt-24 border-t border-(--border-color) pt-12'>
                <h3 className='mb-12 text-center text-[10px] font-bold tracking-[0.5em] text-(--secondary-color) uppercase opacity-30'>
                  {isVi
                    ? 'Tài nguyên tương tự đề xuất'
                    : 'Secondary Connections'}
                </h3>
                <div className='flex flex-col'>
                  {relatedResources.slice(0, 3).map(related => (
                    <ResourceCard
                      key={related.id}
                      resource={related}
                      onSelect={onRelatedSelect}
                      isCompact
                      locale={locale}
                    />
                  ))}
                </div>
              </footer>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
});

export default ResourceDetailModal;
