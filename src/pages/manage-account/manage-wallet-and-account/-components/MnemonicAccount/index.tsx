import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
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
  TopButton,
  TopLeftContainer,
  TopRightContainer,
} from './styled';

import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
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
          {isNotBackedUp && <NotBackedUpText>{t('pages.manage-account.switch-account.components.notBackedUp')}</NotBackedUpText>}
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
                <OrderIcon />
              </AccountRightContainer>
            </AccountButton>
          );
        })}
        {/* TODO 버튼 추가 필요 */}
      </BodyContainer>
    </Container>
  );
}
