import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Button from '@/components/common/Button/index.tsx';
import { Route as AddWallet } from '@/pages/account/add-wallet';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import MnemonicAccount from './-components/MnemonicAccount';

export default function Entry() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      <BaseFooter>
        <Button
          onClick={() => {
            navigate({ to: AddWallet.to });
          }}
        >
          {t('pages.manage-account.switch-account.layout.addWallet')}
        </Button>
      </BaseFooter>
    </>
  );
}
