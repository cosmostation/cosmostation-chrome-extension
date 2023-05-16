import { useEffect, useState } from 'react';

export function useIntersectionObserver(onIntersect: IntersectionObserverCallback, threshold?: number) {
  const [intersectionObserver, setIntersectionObserver] = useState<HTMLElement | null | undefined>(null);

  useEffect(() => {
    if (!intersectionObserver) return;

    const observer: IntersectionObserver = new IntersectionObserver(onIntersect, { threshold });
    observer.observe(intersectionObserver);

    // eslint-disable-next-line consistent-return
    return () => observer.unobserve(intersectionObserver);
  }, [onIntersect, intersectionObserver, threshold]);

  return { setIntersectionObserver };
}
