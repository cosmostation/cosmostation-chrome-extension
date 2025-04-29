import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import EmptyAsset from '@/components/EmptyAsset';
import VerifyPasswordBottomSheet from '@/components/VerifyPasswordBottomSheet';
import { Route as ManageBackupStep1 } from '@/pages/manage-account/backup-wallet/step1/$accountId';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AlertContainer, CautionIconContainer, CautionText, EmptyAssetContainer, MnemonicIconContainer } from './styled';

import CautionIcon from '@/assets/images/icons/Caution16.svg';
import ImportMnemonicIcon from '@/assets/images/icons/ImportMnemonic70.svg';
import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';

export default function MnemonicAccountList() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [supposedToBackupAccountId, setSupposedToBackupAccountId] = useState<string | undefined>();

  const { userAccounts, mnemonicNamesByHashedMnemonic, notBackedUpAccountIds } = useExtensionStorageStore((state) => state);

  const uniqueMnemonicRestoreString = userAccounts
    .filter((item) => item.type === 'MNEMONIC')
    .map((account) => account.encryptedRestoreString)
    .filter((value, index, self) => self.indexOf(value) === index);

  return (
    <>
      {uniqueMnemonicRestoreString.length > 0 ? (
        uniqueMnemonicRestoreString.map((mnemonicRestoreString) => {
          const filteredAccounts = userAccounts.filter((item) => item.type === 'MNEMONIC' && item.encryptedRestoreString === mnemonicRestoreString);
          const isNotBackedUp = notBackedUpAccountIds.includes(filteredAccounts.map((item) => item.id)[0]);

          return (
            <BaseOptionButton
              key={mnemonicRestoreString}
              onClick={() => {
                setSupposedToBackupAccountId(filteredAccounts[0].id);
              }}
              leftContent={
                <MnemonicIconContainer>
                  <MnemonicIcon />
                </MnemonicIconContainer>
              }
              leftSecondHeader={<Base1300Text variant="b2_M">{mnemonicNamesByHashedMnemonic[mnemonicRestoreString]}</Base1300Text>}
              rightContent={
                isNotBackedUp ? (
                  <AlertContainer>
                    <CautionIconContainer>
                      <CautionIcon />
                    </CautionIconContainer>
                    <CautionText variant="b4_M">{t('pages.general-setting.backup-wallet.components.MnemonicAccountList.index.notBackedUp')}</CautionText>
                  </AlertContainer>
                ) : undefined
              }
              style={{
                padding: '1.6rem',
              }}
            />
          );
        })
      ) : (
        <EmptyAssetContainer>
          <EmptyAsset
            icon={<ImportMnemonicIcon />}
            title={t('pages.general-setting.backup-wallet.components.MnemonicAccountList.index.noMnemonic')}
            subTitle={t('pages.general-setting.backup-wallet.components.MnemonicAccountList.index.noMnemonicDescription')}
          />
        </EmptyAssetContainer>
      )}
      <VerifyPasswordBottomSheet
        open={!!supposedToBackupAccountId}
        onClose={() => setSupposedToBackupAccountId(undefined)}
        onSubmit={() => {
          const isNotBackedUp = supposedToBackupAccountId ? notBackedUpAccountIds.includes(supposedToBackupAccountId) : false;

          navigate({
            to: ManageBackupStep1.to,
            params: {
              accountId: supposedToBackupAccountId || '',
            },
            search: {
              backupCompleted: !isNotBackedUp,
            },
          });
        }}
      />
    </>
  );
}
