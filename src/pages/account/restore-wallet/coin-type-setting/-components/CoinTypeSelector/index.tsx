import { useTranslation } from 'react-i18next';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import type { Chain, ChainAccountType } from '@/types/chain';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  AddressText,
  AddressTextContainer,
  Badge,
  ButtonBodyContainer,
  ButtonBottomContainer,
  ButtonWrapper,
  ChainImage,
  CoinTypeNameContainer,
  CoinTypeNameTextContainer,
  Container,
  DefaultText,
  HdPathText,
  HdPathTextContainer,
  OutlinedButton,
  TopContainer,
  ValueContainer,
} from './styled';

type CoinTypeSelectorProps = {
  accountTypeDetails: {
    address: string;
    accountType: ChainAccountType;
  }[];
  selectedAccountType?: ChainAccountType;
  chain?: Chain;
};

export default function CoinTypeSelector({ chain, selectedAccountType, accountTypeDetails }: CoinTypeSelectorProps) {
  const { t } = useTranslation();
  const { accounts } = useExtensionStorageStore((state) => state);

  // FIXME
  const isBitcoin = true;

  const currentAccount = accounts[0];
  const currentAccountIndex = currentAccount.type === 'MNEMONIC' ? currentAccount.index : '0';

  // TODO useAccountAllAssets호출해서 address에 해당하는 밸런스 가져와서 밸류 계산.
  const value = '9000';

  return (
    <Container>
      <TopContainer>
        <ChainImage src={chain?.image} />
        <Base1300Text variant="h3_B">
          {t('pages.account.restore-wallet.coin-type-setting.components.CoinTypeSelector.index.coinType').replace('${chain}', chain?.name || 'Unknown')}
        </Base1300Text>
      </TopContainer>
      <ButtonWrapper>
        {accountTypeDetails.map((item) => {
          const fullHdPath = item.accountType.hdPath.replace('${index}', currentAccountIndex);

          const isSelected =
            selectedAccountType?.hdPath.replace('${index}', currentAccountIndex).replace(/\s+/g, '') === fullHdPath.replace(/\s+/g, '') &&
            selectedAccountType.pubkeyStyle === item.accountType.pubkeyStyle;

          const isDefaultAccountType = item.accountType.isDefault !== false;

          // FIXME "m/44'/60'/0'/X", 케이스 핸들링 필요.
          const [rootLevel, purposeLevel, coinTypeLevel, accountLevel, changeLevel, indexLevel] = fullHdPath.split('/');

          const highlightedLeftText = `${rootLevel} / ${isBitcoin ? '' : `${purposeLevel} / `}`;
          const highlightedText = isBitcoin ? purposeLevel : coinTypeLevel;
          const highlightedRightText = ` / ${isBitcoin ? `${coinTypeLevel} / ` : ''}${accountLevel} / ${changeLevel} / ${indexLevel}`;
          return (
            <OutlinedButton key={item.address} isSelected={isSelected}>
              <ButtonBodyContainer>
                <CoinTypeNameContainer>
                  <CoinTypeNameTextContainer>
                    <Base1300Text variant="b2_M">{item.accountType.pubkeyStyle}</Base1300Text>
                    &nbsp;
                    {isDefaultAccountType && <DefaultText variant="b2_M">{'(Default)'}</DefaultText>}
                  </CoinTypeNameTextContainer>

                  {isDefaultAccountType && (
                    <Badge>
                      <Base1300Text>{'RECOMMENDED'}</Base1300Text>
                    </Badge>
                  )}
                </CoinTypeNameContainer>
                <AddressTextContainer>
                  <AddressText variant="b4_R">{item.address}</AddressText>
                </AddressTextContainer>
              </ButtonBodyContainer>
              <ButtonBottomContainer>
                <HdPathTextContainer>
                  <HdPathText variant="h6n_M">{highlightedLeftText}</HdPathText>
                  &nbsp;
                  <Base1300Text variant="h6n_M">{highlightedText}</Base1300Text>
                  &nbsp;
                  <HdPathText variant="h6n_M">{highlightedRightText}</HdPathText>
                </HdPathTextContainer>

                <ValueContainer>
                  <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency="usd">
                    {value}
                  </NumberTypo>
                </ValueContainer>
              </ButtonBottomContainer>
            </OutlinedButton>
          );
        })}
      </ButtonWrapper>
    </Container>
  );
}
