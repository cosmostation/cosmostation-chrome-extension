export const RATE_LIMIT_MS = {
  updateBalance: 1 * 60 * 1000,
  updateStaking: 1 * 60 * 1000,
  updateAccountInfo: 1 * 60 * 1000,
  updateHighPriorityBalance: 1 * 60 * 1000,
  updateLowPriorityBalance: 1 * 60 * 1000,
  updateHighPriorityStaking: 1 * 60 * 1000,
  updateLowPriorityStaking: 1 * 60 * 1000,
} as const;
