import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import Button from '@/components/common/Button/index.tsx';
import IconTextButton from '@/components/common/IconTextButton';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import VerifyPasswordBottomSheet from '@/components/VerifyPasswordBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as ManageBackupStep1 } from '@/pages/manage-account/backup-wallet/step1/$accountId';
import { Route as SwitchWallet } from '@/pages/manage-account/switch-account';
import { Route as ViewMnemonic } from '@/pages/manage-account/view/mnemonic/$mnemonicId';
import { Route as ViewMultiChainPrivateKey } from '@/pages/manage-account/view/multi-chain-priateKey/$accountId';
import { toastSuccess } from '@/utils/toast';
import { updateAccountName } from '@/utils/zustand/accountNames';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AccountImgContainer,
  Caution,
  CautionIconContainer,
  CautionText,
  MainContentBody,
  MainContentsContainer,
  MainContentSubtitleText,
  MainContentTitleText,
  OptionButtonContainer,
} from './-styled';
import MainContentsLayout from '../../../-components/MainContentsLayout';

import CautionIcon from '@/assets/images/icons/Caution16.svg';
import EditIcon from '@/assets/images/icons/Edit18.svg';
import MnemonicViewIcon from '@/assets/images/icons/MnemonicView28.svg';
import PrivateViewIcon from '@/assets/images/icons/PrivateKeyView28.svg';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accounts, accountNamesById, notBackedUpAccountIds } = useExtensionStorageStore((state) => state);
  const { removeAccount } = useCurrentAccount();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);
  const [isOpenVerifyPasswordBottomSheetWithMnemonic, setIsOpenVerifyPasswordBottomSheetWithMnemonic] = useState(false);
  const [isOpenVerifyPasswordBottomSheetWithPK, setIsOpenVerifyPasswordBottomSheetPK] = useState(false);

  const account = accounts.find((item) => item.id === accountId);
  const hdPath = account?.type === 'MNEMONIC' ? account.index : '';
  const accountName = accountNamesById[accountId];

  const isNotBackedUp = notBackedUpAccountIds.includes(account?.id || '');

  const editAccountName = async (accountId: string, accountName: string) => {
    await updateAccountName(accountId, accountName);

    toastSuccess(t('pages.manage-account.detail.mnemonic.account.entry.accountNameUpdated'));
  };

  return (
    <>
      <BaseBody>
        <>
          <MainContentsContainer>
            <MainContentsLayout
              top={<AccountImgContainer />}
              body={
                <MainContentBody>
                  <IconTextButton
                    onClick={() => {
                      setIsOpenSetAccountNameBottomSheet(true);
                    }}
                    trailingIcon={<EditIcon />}
                  >
                    <MainContentTitleText variant="h2_B">{accountName}</MainContentTitleText>
                  </IconTextButton>
                  <MainContentSubtitleText variant="b3_R">{`${t('pages.manage-account.detail.mnemonic.account.entry.lastHdPath')} : ${hdPath}`}</MainContentSubtitleText>
                </MainContentBody>
              }
            />
          </MainContentsContainer>
          <EdgeAligner>
            <OptionButtonContainer>
              <BaseOptionButton
                onClick={() => {
                  setIsOpenVerifyPasswordBottomSheetWithMnemonic(true);
                }}
                leftContent={<MnemonicViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.mnemonic.account.entry.viewMyMnemonic')}</Base1300Text>}
                leftSecondBody={<Base1000Text variant="b3_R">{t('pages.manage-account.detail.mnemonic.account.entry.viewMyMnemonicDescription')}</Base1000Text>}
                rightContent={
                  isNotBackedUp ? (
                    <Caution>
                      <CautionIconContainer>
                        <CautionIcon />
                      </CautionIconContainer>
                      <CautionText variant="b4_M">{t('pages.manage-account.detail.mnemonic.account.entry.notBackedUp')}</CautionText>
                    </Caution>
                  ) : undefined
                }
              />
              <BaseOptionButton
                onClick={() => {
                  setIsOpenVerifyPasswordBottomSheetPK(true);
                }}
                leftContent={<PrivateViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.mnemonic.account.entry.viewPrivateKey')}</Base1300Text>}
                leftSecondBody={<Base1000Text variant="b3_R">{t('pages.manage-account.detail.mnemonic.account.entry.viewPrivateKeyDescription')}</Base1000Text>}
              />
            </OptionButtonContainer>
          </EdgeAligner>
        </>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={async () => {
            await removeAccount(accountId);

            toastSuccess(t('pages.manage-account.detail.mnemonic.account.entry.successDeleteAccount'));
            navigate({ to: SwitchWallet.to });
          }}
          variant="red"
        >
          {t('pages.manage-account.detail.mnemonic.account.entry.deleteAccount')}
        </Button>
      </BaseFooter>
      <VerifyPasswordBottomSheet
        open={isOpenVerifyPasswordBottomSheetWithMnemonic}
        onClose={() => setIsOpenVerifyPasswordBottomSheetWithMnemonic(false)}
        onSubmit={() => {
          if (isNotBackedUp) {
            navigate({
              to: ManageBackupStep1.to,
              params: {
                accountId: account?.id || '',
              },
            });
          } else {
            navigate({
              to: ViewMnemonic.to,
              params: {
                mnemonicId: account?.encryptedRestoreString || '',
              },
            });
          }
        }}
      />
      <VerifyPasswordBottomSheet
        open={isOpenVerifyPasswordBottomSheetWithPK}
        onClose={() => setIsOpenVerifyPasswordBottomSheetPK(false)}
        onSubmit={() => {
          navigate({
            to: ViewMultiChainPrivateKey.to,
            params: {
              accountId: account?.id || '',
            },
          });
        }}
      />
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setName={async (accountName) => {
          await editAccountName(accountId, accountName);
        }}
      />
    </>
  );
}
