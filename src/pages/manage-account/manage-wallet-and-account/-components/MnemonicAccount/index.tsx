import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountImage from '@/components/AccountImage';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { Route as ManageBackupStep1 } from '@/pages/manage-account/backup-wallet/step1/$accountId';
import { Route as MnemonicDetail } from '@/pages/manage-account/detail/mnemonic/$mnemonicId';
import { Route as MnemonicAccountDetail } from '@/pages/manage-account/detail/mnemonic/account/$accountId';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AccountButton,
  AccountImgContainer,
  AccountInfoContainer,
  AccountLeftContainer,
  AccountRightContainer,
  BodyContainer,
  Container,
  LastHdPathIndexText,
  LastHdPathText,
  LastHdPathTextContainer,
  NotBackedUpText,
  OutlinedButtonContainer,
  RightArrowIconContainer,
  StyledOutlinedButton,
  TopButton,
  TopLeftContainer,
  TopRightContainer,
} from './styled';

import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import RightArrowIcon from '@/assets/images/icons/RightArrow14.svg';
import OrderIcon from 'assets/images/icons/Order20.svg';

type MnemonicAccountProps = {
  mnemonicRestoreString: string;
};

export default function MnemonicAccount({ mnemonicRestoreString }: MnemonicAccountProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { accounts, accountNamesById, mnemonicNamesByHashedMnemonic, notBackedUpAccountIds } = useExtensionStorageStore((state) => state);

  const filteredAccounts = accounts.filter((item) => item.type === 'MNEMONIC' && item.encryptedRestoreString === mnemonicRestoreString);

  const mnemonicName = mnemonicNamesByHashedMnemonic[mnemonicRestoreString] || '';

  const isNotBackedUp = notBackedUpAccountIds.includes(filteredAccounts.map((item) => item.id)[0]);

  return (
    <Container>
      <TopButton
        onClick={() => {
          navigate({
            to: MnemonicDetail.to,
            params: {
              mnemonicId: mnemonicRestoreString,
            },
          });
        }}
      >
        <TopLeftContainer>
          <MnemonicIcon />
          <Base1300Text variant="h4_B">{mnemonicName}</Base1300Text>
          {isNotBackedUp && (
            <NotBackedUpText variant="b4_M">{t('pages.manage-account.manage-wallet-and-account.components.MnemonicAccount.index.notBackedUp')}</NotBackedUpText>
          )}
        </TopLeftContainer>
        <TopRightContainer>
          <OrderIcon />
        </TopRightContainer>
      </TopButton>
      <BodyContainer>
        {filteredAccounts.map((item, i) => {
          const accountName = accountNamesById[item.id];
          const lastHdPath = item.type === 'MNEMONIC' ? item.index : '';

          return (
            <AccountButton
              key={i}
              onClick={() => {
                navigate({
                  to: MnemonicAccountDetail.to,
                  params: {
                    accountId: item.id,
                  },
                });
              }}
            >
              <AccountLeftContainer>
                <AccountImgContainer>
                  <AccountImage accountId={item.id} />
                </AccountImgContainer>

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
                <OrderIcon />
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
              {t('pages.manage-account.manage-wallet-and-account.components.MnemonicAccount.index.backUpNow')}
            </StyledOutlinedButton>
          </OutlinedButtonContainer>
        )}
      </BodyContainer>
    </Container>
  );
}
