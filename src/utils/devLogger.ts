export const devLogger = {
  log: (...args: unknown[]) => {
    if (__APP_MODE__ === 'development') console.log('[log]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (__APP_MODE__ === 'development') console.warn('[warn]', ...args);
  },
  error: (...args: unknown[]) => {
    if (__APP_MODE__ === 'development') console.error('[error]', ...args);
  },
};
