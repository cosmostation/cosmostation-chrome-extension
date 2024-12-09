import BaseBody from '@/components/BaseLayout/components/BaseBody';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import MnemonicAccount from './-components/MnemonicAccount';

export default function Entry() {
  const { accounts } = useExtensionStorageStore((state) => state);

  const uniqueMnemonicRestoreString = accounts
    .filter((item) => item.type === 'MNEMONIC')
    .map((account) => account.encryptedRestoreString)
    .filter((value, index, self) => self.indexOf(value) === index);

  return (
    <>
      <BaseBody>
        <EdgeAligner>
          <>
            {uniqueMnemonicRestoreString.map((item, i) => (
              <MnemonicAccount key={i} mnemonicRestoreString={item} />
            ))}
          </>
        </EdgeAligner>
      </BaseBody>
    </>
  );
}
