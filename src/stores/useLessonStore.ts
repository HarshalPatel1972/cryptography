import { create } from 'zustand';

interface LessonState {
  currentStep: number;
  isCompleted: boolean;
  logs: string[];
  
  // Actions
  nextStep: () => void;
  setStep: (step: number) => void;
  resetLesson: () => void;
  setCompleted: (completed: boolean) => void;
  logAction: (message: string) => void;
  clearLogs: () => void;
}

export const useLessonStore = create<LessonState>((set) => ({
  currentStep: 0,
  isCompleted: false,
  logs: [],

  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  setStep: (step) => set({ currentStep: step }),
  resetLesson: () => set({ currentStep: 0, isCompleted: false, logs: [] }),
  setCompleted: (completed) => set({ isCompleted: completed }),
  
  logAction: (message) => set((state) => ({ 
    logs: [...state.logs.slice(-9), message] // Keep last 10 logs
  })),
  clearLogs: () => set({ logs: [] }),
}));
