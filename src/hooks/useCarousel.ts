import { useCallback, useEffect, useState } from 'react';

type UseCarouselOptions = {
  totalItems: number;
  autoRotate?: boolean;
  autoRotateInterval?: number;
  initialIndex?: number;
};

type UseCarouselReturn = {
  currentIndex: number;
  goTo: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
};

export function useCarousel({ totalItems, autoRotate = false, autoRotateInterval = 4000, initialIndex = 0 }: UseCarouselOptions): UseCarouselReturn {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalItems) {
        setCurrentIndex(index);
      }
    },
    [totalItems],
  );

  const goNext = useCallback(() => {
    if (totalItems === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  const goPrev = useCallback(() => {
    if (totalItems === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  useEffect(() => {
    if (totalItems > 0 && currentIndex >= totalItems) {
      setCurrentIndex(totalItems - 1);
    }
  }, [totalItems, currentIndex]);

  useEffect(() => {
    if (!autoRotate || totalItems <= 1 || isPaused) return;

    const intervalId = setInterval(goNext, autoRotateInterval);
    return () => clearInterval(intervalId);
  }, [autoRotate, totalItems, isPaused, autoRotateInterval, goNext]);

  return {
    currentIndex,
    goTo,
    goNext,
    goPrev,
    pause,
    resume,
    isPaused,
  };
}
