export interface TranslationSegment {
  id: string;
  original: string;
  translated: string;
}

export interface TranslationResult {
  sourceLanguage: string;
  targetLanguage: string;
  segments: TranslationSegment[];
  originalText: string;
}

export interface FavoriteItem {
  id: string;
  original: string;
  translated: string;
  timestamp: number;
  theme: string;
  image?: string; // Base64 string of the image
}

export interface User {
  id: string;
  username: string;
}

export type ViewType = 'translator' | 'favorites';

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}