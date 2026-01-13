import { create } from 'zustand';

interface GuidanceState {
  activeLesson: string | null;
  currentStep: number;
  isIdle: boolean;
  hintsEnabled: boolean;
  setActiveLesson: (lesson: string | null) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  setIdle: (idle: boolean) => void;
  toggleHints: () => void;
}

export const useGuidanceStore = create<GuidanceState>((set) => ({
  activeLesson: null,
  currentStep: 0,
  isIdle: false,
  hintsEnabled: true,
  setActiveLesson: (lesson) => set({ activeLesson: lesson, currentStep: 0 }),
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  setIdle: (idle) => set({ isIdle: idle }),
  toggleHints: () => set((state) => ({ hintsEnabled: !state.hintsEnabled })),
}));
