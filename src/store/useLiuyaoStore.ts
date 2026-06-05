import { create } from 'zustand';
import type {
  QuestionType,
  TossResult,
  PaiPanResult,
  HistoryEntry,
} from '../engine/types';

// ====== State ======

interface LiuyaoState {
  // Flow
  currentStep: 'question' | 'toss' | 'result';

  // Question
  question: string;
  questionType: QuestionType;

  // Tossing
  tosses: TossResult[];
  isTossing: boolean;
  currentTossRound: number;

  // Result
  paiPan: PaiPanResult | null;
  interpretation: string;
  isInterpreting: boolean;

  // History
  history: HistoryEntry[];

  // Actions
  setQuestion: (q: string, type: QuestionType) => void;
  startToss: () => void;
  recordToss: (result: TossResult) => void;
  completeToss: () => void;
  setPaiPan: (result: PaiPanResult) => void;
  setInterpretation: (text: string) => void;
  setIsInterpreting: (v: boolean) => void;
  goToStep: (step: 'question' | 'toss' | 'result') => void;
  reset: () => void;
  loadHistory: () => void;
  saveToHistory: (entry: HistoryEntry) => void;
  deleteHistoryEntry: (id: string) => void;
  clearHistory: () => void;
}

const HISTORY_KEY = 'liuyao-history';

function loadHistoryFromStorage(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistoryToStorage(history: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch { /* quota exceeded */ }
}

export const useLiuyaoStore = create<LiuyaoState>((set, get) => ({
  // Initial state
  currentStep: 'question',
  question: '',
  questionType: '财运',
  tosses: [],
  isTossing: false,
  currentTossRound: 0,
  paiPan: null,
  interpretation: '',
  isInterpreting: false,
  history: loadHistoryFromStorage(),

  // Actions
  setQuestion: (q, type) => set({ question: q, questionType: type }),

  startToss: () =>
    set({
      currentStep: 'toss',
      tosses: [],
      isTossing: false,
      currentTossRound: 0,
      paiPan: null,
      interpretation: '',
    }),

  recordToss: (result) =>
    set((s) => {
      const next = [...s.tosses, result];
      return {
        tosses: next,
        currentTossRound: next.length,
        isTossing: next.length < 6,
      };
    }),

  completeToss: () =>
    set({ isTossing: false }),

  setPaiPan: (result) => set({ paiPan: result, currentStep: 'result' }),

  setInterpretation: (text) => set({ interpretation: text, isInterpreting: false }),

  setIsInterpreting: (v) => set({ isInterpreting: v }),

  goToStep: (step) => set({ currentStep: step }),

  reset: () =>
    set({
      currentStep: 'question',
      question: '',
      questionType: '财运',
      tosses: [],
      isTossing: false,
      currentTossRound: 0,
      paiPan: null,
      interpretation: '',
      isInterpreting: false,
    }),

  loadHistory: () => set({ history: loadHistoryFromStorage() }),

  saveToHistory: (entry) => {
    const { history } = get();
    const next = [entry, ...history].slice(0, 50);
    saveHistoryToStorage(next);
    set({ history: next });
  },

  deleteHistoryEntry: (id) => {
    const { history } = get();
    const next = history.filter((h) => h.id !== id);
    saveHistoryToStorage(next);
    set({ history: next });
  },

  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
    set({ history: [] });
  },
}));
