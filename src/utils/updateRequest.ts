import { RATE_LIMIT_MS } from '@/constants/updateRequest';
import type { LastRequestTimestampsKey } from '@/types/extension';

import { getExtensionLocalStorage, setExtensionLocalStorage } from './storage';

type RateLimitedMethod = keyof typeof RATE_LIMIT_MS;

export async function isRequestThrottled(method: RateLimitedMethod, id: string): Promise<boolean> {
  const result = await getExtensionLocalStorage('lastRequestTimestamps');

  const now = Date.now();

  const key: LastRequestTimestampsKey = `${method}:${id}`;
  const lastRun = result?.[key];

  if (!lastRun) return false;

  const limit = RATE_LIMIT_MS[method];

  const isUnderCooldown = now - lastRun < limit;

  return isUnderCooldown;
}

export async function recordRequestTimestamp(method: RateLimitedMethod, id: string): Promise<void> {
  const timestamps = await getExtensionLocalStorage('lastRequestTimestamps');
  const key = `${method}:${id}`;

  const newTimeStamps = {
    ...timestamps,
    [key]: Date.now(),
  };

  await setExtensionLocalStorage('lastRequestTimestamps', newTimeStamps);
}
