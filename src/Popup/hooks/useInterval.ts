import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number) {
  const savedCallbackRef = useRef<() => void>();

  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = () => savedCallbackRef.current!();

    const intervalId = setInterval(handler, delay);
    return () => clearInterval(intervalId);
  }, [delay]);
}
