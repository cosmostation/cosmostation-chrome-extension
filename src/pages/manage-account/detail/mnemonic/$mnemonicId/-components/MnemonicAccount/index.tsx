import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import AccountImage from '@/components/AccountImage';
import Base1000Text from '@/components/common/Base1000Text';
import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
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
  TopContainer,
  TopLeftContainer,
} from './styled';

import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type MnemonicAccountProps = {
  mnemonicRestoreString: string;
};

export default function MnemonicAccount({ mnemonicRestoreString }: MnemonicAccountProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { userAccounts, accountNamesById } = useExtensionStorageStore((state) => state);

  const filteredAccounts = userAccounts.filter((item) => item.type === 'MNEMONIC' && item.encryptedRestoreString === mnemonicRestoreString);

  const accountsCount = filteredAccounts.length;
  return (
    <Container>
      <TopContainer>
        <TopLeftContainer>
          <Base1300Text variant="h3_B">{t('pages.manage-account.detail.mnemonic.components.MnemonicAccount.myAccount')}</Base1300Text>
          <Base1000Text variant="h6n_M">{accountsCount}</Base1000Text>
        </TopLeftContainer>
      </TopContainer>
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
                    <LastHdPathText variant="b4_R">{`${t('pages.manage-account.detail.mnemonic.components.MnemonicAccount.lastHdPath')} :`}</LastHdPathText>
                    &nbsp;
                    <LastHdPathIndexText>
                      <NumberTypo typoOfIntegers="h6n_M">{lastHdPath}</NumberTypo>
                    </LastHdPathIndexText>
                  </LastHdPathTextContainer>
                </AccountInfoContainer>
              </AccountLeftContainer>
              <AccountRightContainer>
                <RightChevronIcon />
              </AccountRightContainer>
            </AccountButton>
          );
        })}
      </BodyContainer>
    </Container>
  );
}
