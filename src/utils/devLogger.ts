/* eslint-disable @typescript-eslint/no-empty-function */

const createDevLogger = () => ({
  log: (...args: unknown[]) => console.log('[log]', ...args),
  warn: (...args: unknown[]) => console.warn('[warn]', ...args),
  error: (...args: unknown[]) => console.error('[error]', ...args),
  time: (label?: string) => console.time(label),
  timeEnd: (label?: string) => console.timeEnd(label),
  timeLog: (label?: string, ...args: unknown[]) => console.timeLog(label, ...args),
});

const noopLogger = {
  log: () => {},
  warn: () => {},
  error: () => {},
  time: () => {},
  timeEnd: () => {},
  timeLog: () => {},
};

export const devLogger = __APP_MODE__ === 'development' ? createDevLogger() : noopLogger;
