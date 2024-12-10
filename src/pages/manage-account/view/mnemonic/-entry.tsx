import { useTranslation } from 'react-i18next';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import MnemonicViewer from '@/components/MnemonicViewer';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { aesDecrypt } from '@/utils/crypto';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle, MnemonicViewerContainer } from './-styled';

export default function Entry() {
  const { t } = useTranslation();
  const { currentPassword } = useCurrentPassword();

  const { accounts } = useExtensionStorageStore((state) => state);
  const accountId = '3dac1512-e0ff-470a-95c0-8ce840386ffa';
  const account = accounts.find((item) => item.id === accountId);
  const encryptedMnemonic = account?.type === 'MNEMONIC' ? account.mnemonic : '';
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
