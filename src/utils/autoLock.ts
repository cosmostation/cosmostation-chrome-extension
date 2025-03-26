import { NEVER_LOCK_KEY } from '@/constants/autoLock';

import { getExtensionLocalStorage, setExtensionLocalStorage } from './storage';

export async function refreshAutoLockTimer() {
  const autoLockTimeInMinutes = await getExtensionLocalStorage('autoLockTimeInMinutes');

  if (autoLockTimeInMinutes === NEVER_LOCK_KEY) {
    return;
  }

  const autoLockTimeInMs = Number(autoLockTimeInMinutes) * 60 * 1000;
  const currentTime = Date.now();

  const autoLockAt = currentTime + autoLockTimeInMs;

  await setExtensionLocalStorage('autoLockTimeStampAt', autoLockAt);
}
