import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import Button from '@/components/common/Button';
import MnemonicViewer from '@/components/MnemonicViewer';
import { useCurrentPassword } from '@/hooks/useCurrentPassword';
import { Route as ManageBackupStep2 } from '@/pages/manage-account/backup-wallet/step2/$accountId';
import { aesDecrypt } from '@/utils/crypto';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { Body, DescriptionContainer, DescriptionSubTitle, DescriptionTitle, MnemonicViewerContainer } from './-styled';

type EntryProps = {
  accountId: string;
  isBackupCompleted?: boolean;
};

export default function Entry({ accountId, isBackupCompleted }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currentPassword } = useCurrentPassword();

  const { userAccounts } = useExtensionStorageStore((state) => state);
  const account = userAccounts.find((item) => item.id === accountId);

  const encryptedMnemonic = account?.type === 'MNEMONIC' ? account.encryptedMnemonic : '';
  const decryptedMnemonic = currentPassword ? aesDecrypt(encryptedMnemonic, currentPassword) : '';

  return (
    <>
      <BaseBody>
        <Body>
          <DescriptionContainer>
            <DescriptionTitle variant="h2_B">{t('pages.manage-account.backup-wallet.step1.entry.title')}</DescriptionTitle>
            <DescriptionSubTitle variant="b3_R_Multiline">{t('pages.manage-account.backup-wallet.step1.entry.subTitle')}</DescriptionSubTitle>
          </DescriptionContainer>

          <MnemonicViewerContainer>
            <MnemonicViewer rawMnemonic={decryptedMnemonic} variants="view" />
          </MnemonicViewerContainer>
        </Body>
      </BaseBody>
      <BaseFooter>
        <Button
          style={{
            display: isBackupCompleted ? 'none' : 'null',
          }}
          onClick={() => {
            navigate({
              to: ManageBackupStep2.to,
              params: {
                accountId: accountId,
              },
            });
          }}
        >
          {t('pages.manage-account.backup-wallet.step1.entry.continue')}
        </Button>
      </BaseFooter>
    </>
  );
}
