import { useEffect, useRef } from 'react';
import { useGuidanceStore } from '@/stores/useGuidanceStore';

export function useIdleDetector(threshold = 8000) {
  const setIdle = useGuidanceStore((state) => state.setIdle);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const resetTimer = () => {
      setIdle(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIdle(true);
      }, threshold);
    };

    // Initial timer
    resetTimer();

    // Event listeners
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [setIdle, threshold]);
}
