import { useEffect, useRef, useState } from 'react';

import { useCurrentAccount } from '../useCurrentAccount';

interface UseAccountChangeDelayOptions {
  delayMs?: number;
}

export function useAccountChangeDelay(options: UseAccountChangeDelayOptions = {}) {
  const { delayMs = 10000 } = options;

  const [isDelayActive, setIsDelayActive] = useState(false);
  const { currentAccount } = useCurrentAccount();

  const previousAccountRef = useRef<string | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      previousAccountRef.current = currentAccount.id;
      isInitializedRef.current = true;
      return;
    }

    if (previousAccountRef.current !== currentAccount.id) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsDelayActive(true);
      previousAccountRef.current = currentAccount.id;

      timeoutRef.current = setTimeout(() => {
        setIsDelayActive(false);
      }, delayMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentAccount.id, delayMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return isDelayActive;
}
