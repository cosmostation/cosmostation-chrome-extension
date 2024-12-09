import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import IconTextButton from '@/components/common/IconTextButton';
import NumberTypo from '@/components/common/NumberTypo';
import { useCurrentAccount } from '@/hooks/useCurrentAccount';

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
  PlusIconContainer,
  TopContainer,
  TopLeftContainer,
  TopRightContainer,
} from './styled';

import MnemonicIcon from '@/assets/images/icons/Mnemonics14.svg';
import CheckIcon from 'assets/images/icons/Check.svg';
import PlusIcon from 'assets/images/icons/Plus12.svg';

type MnemonicAccountProps = {
  mnemonicRestoreString: string;
};

export default function MnemonicAccount({ mnemonicRestoreString }: MnemonicAccountProps) {
  console.log('🚀 ~ MnemonicAccount ~ mnemonicRestoreString:', mnemonicRestoreString);

  const { t } = useTranslation();

  const { currentAccount } = useCurrentAccount();

  console.log('🚀 ~ MnemonicAccount ~ currentAccount:', currentAccount);

  // mnemonicNamesByHashedMnemonic필드에서 currentAccount.encryptedRestoreString로 조회
  const mnemonicName = 'Mnemonic 01';
  const accountName = 'Cosmostation';
  const lastHdPath = '0';
  const isCurrentAccount = mnemonicRestoreString === currentAccount.encryptedRestoreString;

  return (
    <Container>
      <TopContainer>
        <TopLeftContainer>
          <MnemonicIcon />
          <Base1300Text variant="h4_B">{mnemonicName}</Base1300Text>
        </TopLeftContainer>
        <TopRightContainer>
          <IconTextButton
            leadingIcon={
              <PlusIconContainer>
                <PlusIcon />
              </PlusIconContainer>
            }
          >
            <IconButtonText>{t('pages.manage-account.switch-account.components.createNewWallet')}</IconButtonText>
          </IconTextButton>
        </TopRightContainer>
      </TopContainer>
      <BodyContainer>
        <AccountButton>
          <AccountLeftContainer>
            <AccountImgContainer />

            <AccountInfoContainer>
              <Base1300Text variant="b2_M"> {accountName}</Base1300Text>
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
      </BodyContainer>
    </Container>
  );
}
