export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'All';

export interface KeywordNote {
  word: string;
  reading?: string;
  meaning: string;
}

export interface DialogueLine {
  id: number;
  startTime: number; // Giây bắt đầu (vd: 12.5)
  endTime: number; // Giây kết thúc (vd: 16.2)
  japanese: string; // Câu tiếng Nhật gốc có Kanji
  furigana?: string; // Chuỗi furigana (vd: "[私:わたし]は[日本人:にほんじん]です")
  romaji?: string; // Phiên âm romaji
  vietnamese: string; // Dịch nghĩa tiếng Việt
  keywords?: KeywordNote[];
}

export interface ShadowingVideo {
  id: string;
  title: string;
  description: string;
  level: JLPTLevel;
  category: 'Giao tiếp' | 'Anime & Phim' | 'Tin tức' | 'Đời sống' | 'Phỏng vấn';
  thumbnailUrl?: string;
  youtubeId?: string; // ID video YouTube
  videoUrl?: string; // Hoặc file .mp4 trực tiếp
  duration: string; // Thời lượng (vd: "02:45")
  dialogues: DialogueLine[];
}

export interface UserRecording {
  dialogueId: number;
  audioBlobUrl: string;
  recordedAt: number;
  score?: number; // Điểm khớp (0 - 100)
  transcript?: string; // Nhận diện giọng nói thành văn bản
}
