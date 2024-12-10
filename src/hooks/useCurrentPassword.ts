import { v4 as uuidv4 } from 'uuid';

import { aesDecrypt, aesEncrypt } from '@/utils/crypto';
import { useExtensionSessionStorageStore } from '@/zustand/hooks/useExtensionSessionStorageStore';

export function useCurrentPassword() {
  const { password, updateExtensionSessionStorageStore } = useExtensionSessionStorageStore((state) => state);

  const setCurrentPassword = async (password: string | null) => {
    const timestamp = new Date().getTime();
    const key = uuidv4();

    await updateExtensionSessionStorageStore(
      'password',
      password
        ? {
            key,
            timestamp,
            encryptedPassword: aesEncrypt(password, `${key}${timestamp}`),
          }
        : null,
    );
  };

  const currentPassword = password ? aesDecrypt(password.encryptedPassword, `${password.key}${password.timestamp}`) : null;

  return { currentPassword, setCurrentPassword };
}
