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
import DeleteConfirmBottomSheet from '@/components/DeleteConfirmBottomSheet';
import SetMnemonicNameBottomSheet from '@/components/SetNameBottomSheet';
import VerifyPasswordBottomSheet from '@/components/VerifyPasswordBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as ManageBackupStep1 } from '@/pages/manage-account/backup-wallet/step1/$accountId';
import { Route as SwitchWallet } from '@/pages/manage-account/switch-account';
import { Route as ViewMnemonic } from '@/pages/manage-account/view/mnemonic/$mnemonicId';
import { updateMnemonicName } from '@/utils/mnemonicNames';
import { toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import MnemonicAccount from './-components/MnemonicAccount';
import {
  Caution,
  CautionIconContainer,
  CautionText,
  MainContentBody,
  MainContentsContainer,
  MainContentSubtitleText,
  MainContentTitleText,
  MnemonicIconContainer,
  OptionButtonContainer,
} from './-styled';
import MainContentsLayout from '../../-components/MainContentsLayout';

import CautionIcon from '@/assets/images/icons/Caution16.svg';
import EditIcon from '@/assets/images/icons/Edit18.svg';
import MnemonicIcon from '@/assets/images/icons/Mnemonic52.svg';
import MnemonicViewIcon from '@/assets/images/icons/MnemonicView28.svg';

type EntryProps = {
  mnemonicId: string;
};

export default function Entry({ mnemonicId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isOpenSetMnemonicNameBottomSheet, setIsOpenSetMnemonicNameBottomSheet] = useState(false);
  const [isOpenVerifyPasswordBottomSheet, setIsOpenVerifyPasswordBottomSheet] = useState(false);
  const [isOpenVerifyPasswordBottomSheetWithRemove, setIsOpenVerifyPasswordBottomSheetWithRemove] = useState(false);

  const [isOpenDeleteAccountBottomSheet, setIsOpenDeleteAccountBottomSheet] = useState(false);

  const { userAccounts, mnemonicNamesByHashedMnemonic, notBackedUpAccountIds } = useExtensionStorageStore((state) => state);

  const { removeMnemonic } = useCurrentAccount();
  const mnemonicName = mnemonicNamesByHashedMnemonic[mnemonicId];

  const filteredAccounts = userAccounts.filter((item) => item.type === 'MNEMONIC' && item.encryptedRestoreString === mnemonicId);
  const isNotBackedUp = notBackedUpAccountIds.includes(filteredAccounts.map((item) => item.id)[0]);

  const editMnemonicName = async (mnemonic: string, newMnemonicName: string) => {
    await updateMnemonicName(mnemonic, newMnemonicName);

    toastSuccess(t('pages.manage-account.detail.mnemonic.entry.updateMnemonicNameSuccess'));
  };

  const handleSubmit = async (type: 'removeMnemonic' | 'viewMnemonic') => {
    if (type === 'removeMnemonic') {
      await removeMnemonic(mnemonicId);
      const accounts = await useExtensionStorageStore.getState().userAccounts;

      if (accounts && accounts.length > 0) {
        toastSuccess(t('pages.manage-account.detail.mnemonic.entry.successDeleteMnemonic'));
        navigate({ to: SwitchWallet.to });
      }
    }
    if (type === 'viewMnemonic') {
      if (isNotBackedUp) {
        navigate({
          to: ManageBackupStep1.to,
          params: {
            accountId: filteredAccounts[0].id,
          },
        });
      } else {
        navigate({
          to: ViewMnemonic.to,
          params: {
            mnemonicId: mnemonicId,
          },
        });
      }
    }
  };

  return (
    <>
      <BaseBody>
        <>
          <MainContentsContainer>
            <MainContentsLayout
              top={
                <MnemonicIconContainer>
                  <MnemonicIcon />
                </MnemonicIconContainer>
              }
              body={
                <MainContentBody>
                  <IconTextButton
                    trailingIcon={<EditIcon />}
                    onClick={() => {
                      setIsOpenSetMnemonicNameBottomSheet(true);
                    }}
                  >
                    <MainContentTitleText variant="h2_B">{mnemonicName}</MainContentTitleText>
                  </IconTextButton>
                  <MainContentSubtitleText variant="b3_M">{t('pages.manage-account.detail.mnemonic.entry.mnemonicWallet')}</MainContentSubtitleText>
                </MainContentBody>
              }
            />
          </MainContentsContainer>
          <EdgeAligner>
            <OptionButtonContainer>
              <BaseOptionButton
                onClick={() => {
                  setIsOpenVerifyPasswordBottomSheet(true);
                }}
                leftContent={<MnemonicViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.mnemonic.entry.viewMyMnemonic')}</Base1300Text>}
                leftSecondBody={
                  <Base1000Text
                    style={{
                      textAlign: 'left',
                    }}
                    variant="b3_R"
                  >
                    {t('pages.manage-account.detail.mnemonic.entry.viewMyMnemonicDescription')}
                  </Base1000Text>
                }
                rightContent={
                  isNotBackedUp ? (
                    <Caution>
                      <CautionIconContainer>
                        <CautionIcon />
                      </CautionIconContainer>
                      <CautionText variant="b4_M">{t('pages.manage-account.detail.mnemonic.entry.notBackedUp')}</CautionText>
                    </Caution>
                  ) : undefined
                }
              />
            </OptionButtonContainer>
            <MnemonicAccount mnemonicRestoreString={mnemonicId} />
          </EdgeAligner>
        </>
      </BaseBody>
      <BaseFooter>
        <Button
          onClick={() => {
            setIsOpenDeleteAccountBottomSheet(true);
          }}
          variant="red"
        >
          {t('pages.manage-account.detail.mnemonic.entry.deleteMnemonic')}
        </Button>
      </BaseFooter>
      <VerifyPasswordBottomSheet
        open={isOpenVerifyPasswordBottomSheet || isOpenVerifyPasswordBottomSheetWithRemove}
        onClose={() => {
          setIsOpenVerifyPasswordBottomSheet(false);
          setIsOpenVerifyPasswordBottomSheetWithRemove(false);
        }}
        onSubmit={() => {
          if (isOpenVerifyPasswordBottomSheet) {
            handleSubmit('viewMnemonic');
          }
          if (isOpenVerifyPasswordBottomSheetWithRemove) {
            handleSubmit('removeMnemonic');
          }
        }}
      />
      <SetMnemonicNameBottomSheet
        open={isOpenSetMnemonicNameBottomSheet}
        onClose={() => setIsOpenSetMnemonicNameBottomSheet(false)}
        headerTitleText={t('pages.manage-account.detail.mnemonic.entry.editMnemonicName')}
        descriptionText={t('pages.manage-account.detail.mnemonic.entry.editMnemonicNameDescription')}
        inputPlaceholder={t('pages.manage-account.detail.mnemonic.entry.mnemonicName')}
        setName={async (newMnemonicName) => {
          await editMnemonicName(mnemonicId, newMnemonicName);
        }}
      />
      <DeleteConfirmBottomSheet
        open={isOpenDeleteAccountBottomSheet}
        onClose={() => setIsOpenDeleteAccountBottomSheet(false)}
        contents={
          <MainContentsLayout
            top={
              <MnemonicIconContainer sx={{ width: '4.2rem', height: '4.2rem' }}>
                <MnemonicIcon />
              </MnemonicIconContainer>
            }
            body={
              <MainContentBody>
                <MainContentTitleText variant="b1_B">{mnemonicName}</MainContentTitleText>
                <MainContentSubtitleText variant="b3_R">{t('pages.manage-account.detail.mnemonic.entry.mnemonicWallet')}</MainContentSubtitleText>
              </MainContentBody>
            }
          />
        }
        descriptionText={t('pages.manage-account.detail.mnemonic.entry.deleteAccountDescription')}
        onClickConfirm={() => {
          setIsOpenVerifyPasswordBottomSheetWithRemove(true);
          setIsOpenDeleteAccountBottomSheet(false);
        }}
      />
    </>
  );
}
