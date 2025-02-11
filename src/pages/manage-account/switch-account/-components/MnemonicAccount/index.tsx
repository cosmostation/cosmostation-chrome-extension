import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import NumberTypo from '@/components/common/NumberTypo';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';
import { Route as Home } from '@/pages/index';
import { Route as ManageBackupStep1 } from '@/pages/manage-account/backup-wallet/step1/$accountId';
import { Route as CreateAccountWithExistMnemonic } from '@/pages/manage-account/create-account/$mnemonicId';
import { toastSuccess } from '@/utils/toast';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AccountButton,
  AccountImgContainer,
  AccountInfoContainer,
  AccountLeftContainer,
  AccountRightContainer,
  ActiveBadge,
  BodyContainer,
  Container,
  IconButtonText,
  LastHdPathIndexText,
  LastHdPathText,
  LastHdPathTextContainer,
  OutlinedButtonContainer,
  PlusIconContainer,
  Red400Text,
  RightArrowIconContainer,
  StyledOutlinedButton,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
} from './styled';

import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import RightArrowIcon from '@/assets/images/icons/RightArrow14.svg';
import CheckIcon from 'assets/images/icons/Check.svg';
import PlusIcon from 'assets/images/icons/Plus12.svg';

type MnemonicAccountProps = {
  mnemonicRestoreString: string;
};

export default function MnemonicAccount({ mnemonicRestoreString }: MnemonicAccountProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { currentAccount, setCurrentAccount } = useCurrentAccount();

  const { accounts, accountNamesById, mnemonicNamesByHashedMnemonic, notBackedUpAccountIds } = useExtensionStorageStore((state) => state);

  const filteredAccounts = accounts.filter((item) => item.type === 'MNEMONIC' && item.encryptedRestoreString === mnemonicRestoreString);

  const mnemonicName = mnemonicNamesByHashedMnemonic[mnemonicRestoreString] || '';

  const isNotBackedUp = notBackedUpAccountIds.includes(filteredAccounts.map((item) => item.id)[0]);

  return (
    <Container>
      <TopContainer>
        <TopLeftContainer>
          <MnemonicIcon />
          <Base1300Text variant="h4_B">{mnemonicName}</Base1300Text>
          {isNotBackedUp && <Red400Text variant="b4_M">{t('pages.manage-account.switch-account.components.notBackedUp')}</Red400Text>}
        </TopLeftContainer>
        <TopRightContainer>
          {!isNotBackedUp && (
            <IconTextButton
              onClick={() => {
                navigate({
                  to: CreateAccountWithExistMnemonic.to,
                  params: {
                    mnemonicId: mnemonicRestoreString,
                  },
                });
              }}
              leadingIcon={
                <PlusIconContainer>
                  <PlusIcon />
                </PlusIconContainer>
              }
            >
              <IconButtonText variant="b4_M">{t('pages.manage-account.switch-account.components.createNewWallet')}</IconButtonText>
            </IconTextButton>
          )}
        </TopRightContainer>
      </TopContainer>
      <BodyContainer>
        {filteredAccounts.map((item, i) => {
          const accountName = accountNamesById[item.id];
          const lastHdPath = item.type === 'MNEMONIC' ? item.index : '';
          const isCurrentAccount = currentAccount?.id === item.id;

          return (
            <AccountButton
              key={i}
              onClick={() => {
                setCurrentAccount(item.id);

                navigate({
                  to: Home.to,
                });

                toastSuccess(
                  t('pages.manage-account.switch-account.components.switchAccountSuccess', {
                    accountName,
                  }),
                );
              }}
            >
              <AccountLeftContainer>
                <AccountImgContainer />

                <AccountInfoContainer>
                  <Base1300Text variant="b2_M">{accountName}</Base1300Text>
                  <LastHdPathTextContainer>
                    <LastHdPathText variant="b4_R">{`${t('pages.manage-account.switch-account.components.lastHdPath')} :`}</LastHdPathText>
                    &nbsp;
                    <LastHdPathIndexText>
                      <NumberTypo typoOfIntegers="h6n_M">{lastHdPath}</NumberTypo>
                    </LastHdPathIndexText>
                  </LastHdPathTextContainer>
                </AccountInfoContainer>
              </AccountLeftContainer>
              <AccountRightContainer>
                {isCurrentAccount && (
                  <ActiveBadge>
                    <CheckIcon />
                  </ActiveBadge>
                )}
              </AccountRightContainer>
            </AccountButton>
          );
        })}
        {isNotBackedUp && (
          <OutlinedButtonContainer>
            <StyledOutlinedButton
              variant="dark"
              typoVarient="h4_B"
              trailingIcon={
                <RightArrowIconContainer>
                  <RightArrowIcon />
                </RightArrowIconContainer>
              }
              onClick={() => {
                navigate({
                  to: ManageBackupStep1.to,
                  params: {
                    accountId: filteredAccounts[0].id,
                  },
                });
              }}
            >
              {t('pages.manage-account.switch-account.components.backUpNow')}
            </StyledOutlinedButton>
          </OutlinedButtonContainer>
        )}
      </BodyContainer>
    </Container>
  );
}
