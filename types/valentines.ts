export type VoiceStatus =
  | "idle"
  | "requesting-permission"
  | "connecting"
  | "connected"
  | "error";

export type LoveCardTone = "romantic" | "playful" | "poetic" | "warm";
export type KissStyle = "classic" | "hearts" | "sparkle";
export type BouquetType = "classic" | "royal" | "lotus";
export type SurpriseType = "moonlit" | "starlight" | "temple-bells";

export interface LoveCardData {
  title: string;
  message: string;
  tone: LoveCardTone;
}

export interface KissBurst {
  id: string;
  count: number;
  style: KissStyle;
  createdAt: number;
}

export interface BouquetState {
  visible: boolean;
  bouquetType: BouquetType;
  note: string | null;
  key: number;
}

export interface FlowerRainState {
  active: boolean;
  intensity: number;
  until: number | null;
}

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  imagePath?: string;
}

export interface MemoryGalleryState {
  visible: boolean;
}

export interface SurpriseState {
  active: boolean;
  surpriseType: SurpriseType;
  message: string | null;
  excerpts: string[];
  key: number;
}

export interface QuizCard {
  question: string;
  answer: string;
}

export interface QuizState {
  active: boolean;
  cards: QuizCard[];
  currentIndex: number;
  isFlipped: boolean;
}

export interface ValentineUIState {
  activeCard: LoveCardData | null;
  kissBursts: KissBurst[];
  bouquet: BouquetState;
  flowerRain: FlowerRainState;
  memoryGallery: MemoryGalleryState;
  surprise: SurpriseState;
  quiz: QuizState;
}

export interface ValentineUIActions {
  setLoveCard: (card: LoveCardData) => void;
  clearLoveCard: () => void;
  addKissBurst: (burst: Omit<KissBurst, "id" | "createdAt">) => void;
  removeKissBurst: (id: string) => void;
  setBouquet: (bouquetType: BouquetType, note?: string) => void;
  clearBouquet: () => void;
  startFlowerRain: (intensity: number, seconds: number) => void;
  stopFlowerRain: () => void;
  showMemoryGallery: () => void;
  hideMemoryGallery: () => void;
  triggerSurprise: (surpriseType: SurpriseType, message?: string) => void;
  clearSurprise: () => void;
  startQuiz: (cards: QuizCard[]) => void;
  flipQuizCard: () => void;
  nextQuizCard: () => void;
  getQuizCard: () => QuizState;
  endQuiz: () => void;
}
