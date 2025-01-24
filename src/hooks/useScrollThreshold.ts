import { useEffect, useState } from 'react';

import { useScrollThresholdStore } from '@/zustand/hooks/useScrollThresholdStore';

export const useScrollThreshold = (ref: React.RefObject<HTMLElement>, threshold = 100) => {
  const { isThresholdExceeded, updateIsThresholdExceed } = useScrollThresholdStore((state) => state);

  const [after, setAfter] = useState(false);

  useEffect(() => {
    if (after && !isThresholdExceeded) {
      updateIsThresholdExceed(true);
    }
    if (!after && isThresholdExceeded) {
      updateIsThresholdExceed(false);
    }
  }, [after, isThresholdExceeded, updateIsThresholdExceed]);

  useEffect(() => {
    const eventListener = (): void => {
      if (ref.current) {
        const scrollTop = ref.current.scrollTop;
        if (after && scrollTop <= threshold) {
          setAfter(false);
        } else if (!after && scrollTop > threshold) {
          setAfter(true);
        }
      }
    };

    const currentRef = ref.current;
    currentRef?.addEventListener('scroll', eventListener);

    return () => currentRef?.removeEventListener('scroll', eventListener);
  }, [after, threshold, ref]);
};
