'use client';

import React, { useState, useMemo } from 'react';
import {
  useThamletStore,
  DeckCard,
  EmptyDeckState,
  ThamletHeader,
  ImportModal,
  CreateCardInput,
} from '@/features/Thamlet';
import { Search, Layers } from 'lucide-react';
import { useRouter } from '@/core/i18n/routing';

export default function ThamletLibraryPage() {
  const router = useRouter();
  const { decks, deleteDeck, resetDeckProgress, addDeck } = useThamletStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Thu thập tất cả tags có trong các deck
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    decks.forEach(d => d.tags?.forEach(t => tagSet.add(t)));
    return Array.from(tagSet);
  }, [decks]);

  // Lọc danh sách decks theo tìm kiếm và tag
  const filteredDecks = useMemo(() => {
    return decks.filter(deck => {
      const matchesSearch =
        searchQuery === '' ||
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.cards.some(
          c =>
            c.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.definition.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesTag =
        selectedTag === 'all' || deck.tags?.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [decks, searchQuery, selectedTag]);

  const handleQuickImport = (cards: CreateCardInput[]) => {
    const newId = addDeck({
      title: `Bộ thẻ Quizlet (${new Date().toLocaleDateString('vi-VN')})`,
      description: 'Nhập tự động từ Quizlet / Excel',
      tags: ['Quizlet', 'Import'],
      cards,
    });
    router.push(`/thamlet/${newId}`);
  };

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6'>
      {/* Header */}
      <ThamletHeader onOpenImport={() => setIsImportModalOpen(true)} />

      {/* Search and Filters */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        {/* Search Input */}
        <div className='relative max-w-md flex-1'>
          <Search className='absolute top-3 left-3.5 size-4 text-(--secondary-color)' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Tìm kiếm bộ thẻ, từ vựng, kanji...'
            className='w-full rounded-2xl border border-(--border-color) bg-(--card-color) py-2.5 pr-4 pl-10 text-sm text-(--main-color) placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:outline-none'
          />
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className='flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 text-xs'>
            <button
              type='button'
              onClick={() => setSelectedTag('all')}
              className={`rounded-full px-3 py-1.5 font-semibold transition-all ${
                selectedTag === 'all'
                  ? 'bg-(--main-color) text-(--background-color)'
                  : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)'
              }`}
            >
              Tất cả ({decks.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                type='button'
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-3 py-1.5 font-semibold transition-all ${
                  selectedTag === tag
                    ? 'bg-(--main-color) text-(--background-color)'
                    : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Decks Grid */}
      {filteredDecks.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredDecks.map(deck => (
            <DeckCard
              key={deck.id}
              deck={deck}
              onDelete={deleteDeck}
              onResetProgress={resetDeckProgress}
            />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <EmptyDeckState onOpenImport={() => setIsImportModalOpen(true)} />
      ) : (
        <div className='rounded-3xl border border-dashed border-(--border-color) bg-(--card-color)/30 p-12 text-center'>
          <Layers className='mx-auto size-8 text-(--secondary-color)' />
          <p className='mt-2 font-semibold text-(--secondary-color)'>
            Không tìm thấy bộ thẻ nào khớp với &quot;{searchQuery}&quot;
          </p>
        </div>
      )}

      {/* Quick Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleQuickImport}
      />
    </div>
  );
}
