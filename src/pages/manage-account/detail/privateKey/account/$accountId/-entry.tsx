import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountImage from '@/components/AccountImage';
import BaseBody from '@/components/BaseLayout/components/BaseBody';
import BaseFooter from '@/components/BaseLayout/components/BaseFooter';
import EdgeAligner from '@/components/BaseLayout/components/EdgeAligner';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import BaseOptionButton from '@/components/common/BaseOptionButton';
import Button from '@/components/common/Button/index.tsx';
import IconTextButton from '@/components/common/IconTextButton';
import DeleteConfirmBottomSheet from '@/components/DeleteConfirmBottomSheet';
import SetAccountNameBottomSheet from '@/components/SetNameBottomSheet';
import VerifyPasswordBottomSheet from '@/components/VerifyPasswordBottomSheet';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as SwitchWallet } from '@/pages/manage-account/switch-account';
import { Route as ViewPrivateKey } from '@/pages/manage-account/view/privateKey/$accountId';
import { toastSuccess } from '@/utils/toast';
import { updateAccountName } from '@/utils/zustand/accountNames';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import { AccountImgContainer, MainContentBody, MainContentsContainer, MainContentTitleText, OptionButtonContainer, SmallAccountImgContainer } from './-styled';
import MainContentsLayout from '../../../-components/MainContentsLayout';

import EditIcon from '@/assets/images/icons/Edit18.svg';
import PrivateViewIcon from '@/assets/images/icons/PrivateKeyView28.svg';

type EntryProps = {
  accountId: string;
};

export default function Entry({ accountId }: EntryProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isOpenSetAccountNameBottomSheet, setIsOpenSetAccountNameBottomSheet] = useState(false);

  const [isOpenDeleteAccountBottomSheet, setIsOpenDeleteAccountBottomSheet] = useState(false);
  const [isOpenVerifyPasswordBottomSheetWithRemove, setIsOpenVerifyPasswordBottomSheetWithRemove] = useState(false);

  const { accountNamesById } = useExtensionStorageStore((state) => state);
  const { removeAccount } = useCurrentAccount();

  const [isOpenVerifyPasswordBottomSheet, setIsOpenVerifyPasswordBottomSheet] = useState(false);

  const accountName = accountNamesById[accountId];

  const editAccountName = async (accountId: string, accountName: string) => {
    await updateAccountName(accountId, accountName);

    toastSuccess(t('pages.manage-account.detail.mnemonic.account.entry.accountNameUpdated'));
  };

  const handleSubmit = async (type: 'removeAccount' | 'viewPrivatekey') => {
    if (type === 'removeAccount') {
      await removeAccount(accountId);

      const accounts = await useExtensionStorageStore.getState().userAccounts;

      if (accounts && accounts.length > 0) {
        toastSuccess(t('pages.manage-account.detail.privateKey.account.entry.successDeleteAccount'));
        navigate({ to: SwitchWallet.to });
      }
    }

    if (type === 'viewPrivatekey') {
      navigate({
        to: ViewPrivateKey.to,
        params: {
          accountId,
        },
      });
    }
  };

  return (
    <>
      <BaseBody>
        <>
          <MainContentsContainer>
            <MainContentsLayout
              top={
                <AccountImgContainer>
                  <AccountImage accountId={accountId} />
                </AccountImgContainer>
              }
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
                leftContent={<PrivateViewIcon />}
                leftSecondHeader={<Base1300Text variant="b2_M">{t('pages.manage-account.detail.privateKey.account.entry.viewPrivateKey')}</Base1300Text>}
                leftSecondBody={
                  <Base1000Text variant="b3_R">{t('pages.manage-account.detail.privateKey.account.entry.viewPrivateKeyDescription')}</Base1000Text>
                }
              />
            </OptionButtonContainer>
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
          {t('pages.manage-account.detail.privateKey.account.entry.deleteAccount')}
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
            handleSubmit('viewPrivatekey');
          }

          if (isOpenVerifyPasswordBottomSheetWithRemove) {
            handleSubmit('removeAccount');
          }
        }}
      />
      <SetAccountNameBottomSheet
        open={isOpenSetAccountNameBottomSheet}
        onClose={() => setIsOpenSetAccountNameBottomSheet(false)}
        setName={async (accountName) => {
          await editAccountName(accountId, accountName);
        }}
      />
      <DeleteConfirmBottomSheet
        open={isOpenDeleteAccountBottomSheet}
        onClose={() => setIsOpenDeleteAccountBottomSheet(false)}
        contents={
          <MainContentsLayout
            top={
              <SmallAccountImgContainer>
                <AccountImage accountId={accountId} />
              </SmallAccountImgContainer>
            }
            body={
              <MainContentBody>
                <MainContentTitleText variant="b1_B">{accountName}</MainContentTitleText>
              </MainContentBody>
            }
          />
        }
        descriptionText={t('pages.manage-account.detail.privateKey.account.entry.deleteAccountDescription')}
        onClickConfirm={() => {
          setIsOpenVerifyPasswordBottomSheetWithRemove(true);
          setIsOpenDeleteAccountBottomSheet(false);
        }}
      />
    </>
  );
}
