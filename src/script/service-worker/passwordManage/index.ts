import { getExtensionLocalStorage, setExtensionSessionStorage } from '@/utils/storage';

export async function checkLockWallet() {
  const autoLockAt = await getExtensionLocalStorage('autoLockTimeStampAt');

  if (!autoLockAt) {
    return;
  }
  const currentTime = Date.now();

  if (currentTime > autoLockAt) {
    await setExtensionSessionStorage('sessionPassword', null);
  }
}

export async function startAutoLockTimer() {
  setInterval(async () => {
    await checkLockWallet();
  }, 1000 * 60);
}
