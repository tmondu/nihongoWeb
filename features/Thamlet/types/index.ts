export interface FlashCard {
  id: string;
  term: string; // Mặt trước: Từ vựng / Kanji / Cụm từ
  definition: string; // Mặt sau: Ý nghĩa / Giải thích
  reading?: string; // Cách đọc Hiragana / Katakana / Romaji
  example?: string; // Câu ví dụ
  isStarred?: boolean; // Đánh dấu yêu thích / từ khó

  // Thống kê Spaced Repetition / Học tập
  boxLevel: number; // 0: Mới, 1-5: Mức độ ghi nhớ
  correctCount: number; // Số lần trả lời đúng
  wrongCount: number; // Số lần trả lời sai
  lastReviewedAt?: number; // Timestamp lần cuối ôn
  nextReviewAt?: number; // Timestamp lần ôn kế tiếp
}

export type CreateCardInput = Omit<
  FlashCard,
  'id' | 'boxLevel' | 'correctCount' | 'wrongCount'
> & {
  id?: string;
  boxLevel?: number;
  correctCount?: number;
  wrongCount?: number;
  lastReviewedAt?: number;
  nextReviewAt?: number;
};

export interface Deck {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  color?: string; // Mã màu hiển thị
  isSample?: boolean; // Bộ thẻ mẫu có sẵn của hệ thống
  createdAt: number;
  updatedAt: number;
  lastStudiedAt?: number;
  cards: FlashCard[];
}

export interface CreateDeckInput {
  title: string;
  description?: string;
  tags?: string[];
  color?: string;
  isSample?: boolean;
  cards: CreateCardInput[];
}

export type UpdateDeckInput = Partial<
  Omit<Deck, 'id' | 'createdAt' | 'cards'>
> & {
  cards?: CreateCardInput[];
};

export interface QuizletImportResult {
  title?: string;
  cards: CreateCardInput[];
}
