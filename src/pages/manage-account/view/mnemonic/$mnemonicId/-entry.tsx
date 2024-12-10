import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import MnemonicViewer from '@/components/MnemonicViewer';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
// import { Route as MnemonicDetail } from '@/pages/manage-account/detail/mnemonic';
import { aesDecrypt } from '@/utils/crypto';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle, MnemonicViewerContainer } from './-styled';

type EntryProps = {
  mnemonicId: string;
};

export default function Entry({ mnemonicId }: EntryProps) {
  const { t } = useTranslation();
  const { currentPassword } = useCurrentPassword();

  console.log('🚀 ~ Entry ~ currentPassword:', currentPassword);

  const { accounts } = useExtensionStorageStore((state) => state);
  const account = accounts.find((item) => item.encryptedRestoreString === mnemonicId);

  console.log('🚀 ~ Entry ~ account:', account);

  const encryptedMnemonic = account?.type === 'MNEMONIC' ? account.mnemonic : '';

  console.log('🚀 ~ Entry ~ encryptedMnemonic:', encryptedMnemonic);

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
