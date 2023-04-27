import { v4 as uuidv4 } from 'uuid';

import { useExtensionSessionStorage } from '~/Popup/hooks/useExtensionSessionStorage';
import { aesDecrypt, aesEncrypt } from '~/Popup/utils/crypto';

export function useCurrentPassword() {
  const { extensionSessionStorage, setExtensionSessionStorage } = useExtensionSessionStorage();

  const setCurrentPassword = async (password: string | null) => {
    const time = new Date().getTime();
    const key = uuidv4();

    await setExtensionSessionStorage(
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

  const currentPassword = extensionSessionStorage.password
    ? aesDecrypt(extensionSessionStorage.password.value, `${extensionSessionStorage.password.key}${extensionSessionStorage.password.time}`)
    : null;

  return { currentPassword, setCurrentPassword };
}
