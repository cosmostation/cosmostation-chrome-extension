import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import type { Chain, ChainAccountType } from '@/types/chain';
import { equal, lt } from '@/utils/numbers';
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
  accountId: string;
  accountTypeDetails: {
    address: string;
    evmAddress?: string;
    accountType: ChainAccountType;
    totalAssetValue: string;
  }[];
  selectedAccountType?: ChainAccountType;
  chain: Chain;
  isDisableTopContents?: boolean;
  onClickChainType: (id: string, accountType: ChainAccountType) => void;
};

export default function CoinTypeSelector({
  accountId,
  chain,
  selectedAccountType,
  accountTypeDetails,
  isDisableTopContents = false,
  onClickChainType,
}: CoinTypeSelectorProps) {
  const { t } = useTranslation();
  const { accounts, currency } = useExtensionStorageStore((state) => state);

  const isBitcoin = useMemo(() => chain.chainType === 'bitcoin', [chain.chainType]);

  const currentAccount = useMemo(() => accounts.find((account) => account.id === accountId), [accountId, accounts]);
  const currentAccountIndex = useMemo(() => (currentAccount?.type === 'MNEMONIC' ? currentAccount.index : '0'), [currentAccount]);

  return (
    <Container>
      {!isDisableTopContents && (
        <TopContainer>
          <ChainImage src={chain.image} />
          <Base1300Text variant="h3_B">{t('components.CoinTypeSelector.components.CoinType.coinType').replace('${chain}', chain.name)}</Base1300Text>
        </TopContainer>
      )}
      <ButtonWrapper>
        {accountTypeDetails.map((item) => {
          const fullHdPath = item.accountType.hdPath.replace('${index}', currentAccountIndex);

          const isSelected =
            selectedAccountType?.hdPath.replace('${index}', currentAccountIndex).replace(/\s+/g, '') === fullHdPath.replace(/\s+/g, '') &&
            selectedAccountType.pubkeyStyle === item.accountType.pubkeyStyle;

          const isDefaultAccountType = item.accountType.isDefault !== false;

          const [rootLevel, purposeLevel, coinTypeLevel, accountLevel, changeLevel, indexLevel] = fullHdPath.split('/');

          const highlightedLeftText = `${rootLevel} / ${isBitcoin ? '' : `${purposeLevel} / `}`;
          const highlightedText = isBitcoin ? purposeLevel : coinTypeLevel;
          const highlightedRightText = ` / ${isBitcoin ? `${coinTypeLevel} / ` : ''}${accountLevel} / ${changeLevel} ${indexLevel ? `/ ${indexLevel}` : ''}`;

          return (
            <OutlinedButton key={item.address} isSelected={isSelected} onClick={() => onClickChainType(chain.id, item.accountType)}>
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
                  {item.evmAddress && <AddressText variant="b4_R">{item.evmAddress}</AddressText>}
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
                  {item.totalAssetValue &&
                    (equal(item.totalAssetValue, '0') ? (
                      <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={currency} fixed={0}>
                        {'0'}
                      </NumberTypo>
                    ) : lt(item.totalAssetValue, '0.001') ? (
                      <ValueContainer>
                        <Typography variant="h5n_M">{'<'}</Typography>
                        &nbsp;
                        <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={currency}>
                          {item.totalAssetValue}
                        </NumberTypo>
                      </ValueContainer>
                    ) : (
                      <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={currency}>
                        {item.totalAssetValue}
                      </NumberTypo>
                    ))}
                </ValueContainer>
              </ButtonBottomContainer>
            </OutlinedButton>
          );
        })}
      </ButtonWrapper>
    </Container>
  );
}
