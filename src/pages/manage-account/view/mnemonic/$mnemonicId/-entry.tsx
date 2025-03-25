import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import MnemonicViewer from '@/components/MnemonicViewer';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { aesDecrypt } from '@/utils/crypto';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle, MnemonicViewerContainer } from './-styled';

type EntryProps = {
  mnemonicId: string;
};

export default function Entry({ mnemonicId }: EntryProps) {
  const { t } = useTranslation();
  const { currentPassword } = useCurrentPassword();

  const { userAccounts } = useExtensionStorageStore((state) => state);
  const account = userAccounts.find((item) => item.encryptedRestoreString === mnemonicId);

  const encryptedMnemonic = account?.type === 'MNEMONIC' ? account.encryptedMnemonic : '';
  const decryptedMnemonic = currentPassword ? aesDecrypt(encryptedMnemonic, currentPassword) : '';

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.manage-account.view.mnemonic.entry.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.manage-account.view.mnemonic.entry.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>

          <MnemonicViewerContainer>
            <MnemonicViewer rawMnemonic={decryptedMnemonic} variants="view" />
          </MnemonicViewerContainer>
        </Body>
      </BaseBody>
    </>
  );
}
