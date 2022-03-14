import { ENCTYPT_KEY } from '~/constants/common';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { aesDecrypt, aesEncrypt } from '~/Popup/utils/crypto';

export function useCurrentPassword() {
  const { chromeStorage, setChromeStorage } = useChromeStorage();

  const setCurrentPassword = async (password: string | null) => {
    await setChromeStorage('password', password ? aesEncrypt(password, ENCTYPT_KEY) : null);
  };
  const currentPassword = chromeStorage.password ? aesDecrypt(chromeStorage.password, ENCTYPT_KEY) : null;

  return { currentPassword, setCurrentPassword };
}
