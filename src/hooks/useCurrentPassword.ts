import { v4 as uuidv4 } from 'uuid';

import { aesDecrypt, aesEncrypt } from '@/utils/crypto';
import { useExtensionSessionStorageStore } from '@/zustand/hooks/useExtensionSessionStorageStore';

export function useCurrentPassword() {
  const { sessionPassword, updateExtensionSessionStorageStore } = useExtensionSessionStorageStore((state) => state);

  const setCurrentPassword = async (password: string | null) => {
    const timestamp = new Date().getTime();
    const key = uuidv4();

    await updateExtensionSessionStorageStore(
      'sessionPassword',
      password
        ? {
            key,
            timestamp,
            encryptedPassword: aesEncrypt(password, `${key}${timestamp}`),
          }
        : null,
    );
  };

  const currentPassword = sessionPassword ? aesDecrypt(sessionPassword.encryptedPassword, `${sessionPassword.key}${sessionPassword.timestamp}`) : null;

  return { currentPassword, setCurrentPassword };
}
