import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Deck,
  FlashCard,
  CreateDeckInput,
  CreateCardInput,
  UpdateDeckInput,
} from '../types';
import { SAMPLE_DECKS } from '../lib/sampleDecks';

interface ThamletState {
  decks: Deck[];
  selectedDeckId: string | null;

  // Deck CRUD actions
  addDeck: (deck: CreateDeckInput) => string;
  updateDeck: (id: string, updates: UpdateDeckInput) => void;
  deleteDeck: (id: string) => void;
  getDeck: (id: string) => Deck | undefined;
  setSelectedDeckId: (id: string | null) => void;

  // Card actions within deck
  addCard: (deckId: string, card: CreateCardInput) => void;
  updateCard: (
    deckId: string,
    cardId: string,
    updates: Partial<FlashCard>,
  ) => void;
  deleteCard: (deckId: string, cardId: string) => void;
  toggleStarCard: (deckId: string, cardId: string) => void;

  // Study progress actions
  recordCardStudyResult: (
    deckId: string,
    cardId: string,
    isCorrect: boolean,
  ) => void;
  resetDeckProgress: (deckId: string) => void;
}

export const useThamletStore = create<ThamletState>()(
  persist(
    (set, get) => ({
      decks: SAMPLE_DECKS,
      selectedDeckId: null,

      addDeck: deckData => {
        const id =
          'deck-' +
          Date.now() +
          '-' +
          Math.random().toString(36).substring(2, 7);
        const newDeck: Deck = {
          title: deckData.title,
          description: deckData.description,
          tags: deckData.tags,
          color: deckData.color,
          isSample: deckData.isSample,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          cards: deckData.cards.map((c, index) => ({
            ...c,
            id: c.id || `card-${Date.now()}-${index}`,
            boxLevel: c.boxLevel ?? 0,
            correctCount: c.correctCount ?? 0,
            wrongCount: c.wrongCount ?? 0,
          })),
        };

        set(state => ({
          decks: [newDeck, ...state.decks],
        }));

        return id;
      },

      updateDeck: (id, updates) => {
        set(state => ({
          decks: state.decks.map(d => {
            if (d.id !== id) return d;
            const updatedCards: FlashCard[] = updates.cards
              ? updates.cards.map((c, index) => ({
                  ...c,
                  id: c.id || `card-${Date.now()}-${index}`,
                  boxLevel: c.boxLevel ?? 0,
                  correctCount: c.correctCount ?? 0,
                  wrongCount: c.wrongCount ?? 0,
                }))
              : d.cards;

            return {
              ...d,
              ...updates,
              cards: updatedCards,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      deleteDeck: id => {
        set(state => ({
          decks: state.decks.filter(d => d.id !== id),
          selectedDeckId:
            state.selectedDeckId === id ? null : state.selectedDeckId,
        }));
      },

      getDeck: id => {
        return get().decks.find(d => d.id === id);
      },

      setSelectedDeckId: id => {
        set({ selectedDeckId: id });
      },

      addCard: (deckId, cardData) => {
        const newCard: FlashCard = {
          ...cardData,
          id:
            cardData.id ||
            'card-' +
              Date.now() +
              '-' +
              Math.random().toString(36).substring(2, 7),
          boxLevel: cardData.boxLevel ?? 0,
          correctCount: cardData.correctCount ?? 0,
          wrongCount: cardData.wrongCount ?? 0,
        };

        set(state => ({
          decks: state.decks.map(d =>
            d.id === deckId
              ? {
                  ...d,
                  cards: [...d.cards, newCard],
                  updatedAt: Date.now(),
                }
              : d,
          ),
        }));
      },

      updateCard: (deckId, cardId, updates) => {
        set(state => ({
          decks: state.decks.map(d =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map(c =>
                    c.id === cardId ? { ...c, ...updates } : c,
                  ),
                  updatedAt: Date.now(),
                }
              : d,
          ),
        }));
      },

      deleteCard: (deckId, cardId) => {
        set(state => ({
          decks: state.decks.map(d =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.filter(c => c.id !== cardId),
                  updatedAt: Date.now(),
                }
              : d,
          ),
        }));
      },

      toggleStarCard: (deckId, cardId) => {
        set(state => ({
          decks: state.decks.map(d =>
            d.id === deckId
              ? {
                  ...d,
                  cards: d.cards.map(c =>
                    c.id === cardId ? { ...c, isStarred: !c.isStarred } : c,
                  ),
                  updatedAt: Date.now(),
                }
              : d,
          ),
        }));
      },

      recordCardStudyResult: (deckId, cardId, isCorrect) => {
        set(state => ({
          decks: state.decks.map(d => {
            if (d.id !== deckId) return d;
            return {
              ...d,
              lastStudiedAt: Date.now(),
              cards: d.cards.map(c => {
                if (c.id !== cardId) return c;
                const newLevel = isCorrect
                  ? Math.min(5, (c.boxLevel || 0) + 1)
                  : Math.max(0, (c.boxLevel || 0) - 1);
                return {
                  ...c,
                  boxLevel: newLevel,
                  correctCount: isCorrect ? c.correctCount + 1 : c.correctCount,
                  wrongCount: !isCorrect ? c.wrongCount + 1 : c.wrongCount,
                  lastReviewedAt: Date.now(),
                };
              }),
            };
          }),
        }));
      },

      resetDeckProgress: deckId => {
        set(state => ({
          decks: state.decks.map(d => {
            if (d.id !== deckId) return d;
            return {
              ...d,
              cards: d.cards.map(c => ({
                ...c,
                boxLevel: 0,
                correctCount: 0,
                wrongCount: 0,
                lastReviewedAt: undefined,
              })),
            };
          }),
        }));
      },
    }),
    {
      name: 'ptham-thamlet-decks-storage',
    },
  ),
);
