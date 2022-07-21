import { v4 as uuidv4 } from 'uuid';

import { useChromeSessionStorage } from '~/Popup/hooks/useChromeSessionStorage';
import { aesDecrypt, aesEncrypt } from '~/Popup/utils/crypto';

export function useCurrentPassword() {
  const { chromeSessionStorage, setChromeSessionStorage } = useChromeSessionStorage();

  const setCurrentPassword = async (password: string | null) => {
    const time = new Date().getTime();
    const key = uuidv4();

    await setChromeSessionStorage(
      'password',
      password
        ? {
            key,
            time,
            value: aesEncrypt(password, `${key}${time}`),
          }
        : null,
    );
  };

  const currentPassword = chromeSessionStorage.password
    ? aesDecrypt(chromeSessionStorage.password.value, `${chromeSessionStorage.password.key}${chromeSessionStorage.password.time}`)
    : null;

  return { currentPassword, setCurrentPassword };
}
