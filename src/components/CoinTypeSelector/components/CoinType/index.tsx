import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import BalanceDisplay from '@/components/BalanceDisplay';
import Base1300Text from '@/components/common/Base1300Text';
import { PUBKEY_STYLE_MAP } from '@/constants/bitcoin/common';
import type { Chain, ChainAccountType } from '@/types/chain';
import { equal } from '@/utils/numbers';
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
  chain?: Chain;
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
  const { userAccounts, userCurrencyPreference } = useExtensionStorageStore((state) => state);

  const isBitcoin = useMemo(() => chain?.chainType === 'bitcoin', [chain?.chainType]);

  const currentAccount = useMemo(() => userAccounts.find((account) => account.id === accountId), [accountId, userAccounts]);
  const currentAccountIndex = useMemo(() => (currentAccount?.type === 'MNEMONIC' ? currentAccount.index : '0'), [currentAccount]);

  return (
    <Container>
      {!isDisableTopContents && (
        <TopContainer>
          <ChainImage src={chain?.image} />
          <Base1300Text variant="h3_B">{t('components.CoinTypeSelector.components.CoinType.coinType').replace('${chain}', chain?.name || '')}</Base1300Text>
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

          const highlightedLeftText = currentAccount?.type === 'MNEMONIC' ? `${rootLevel} / ${isBitcoin ? '' : `${purposeLevel} / `}` : '';
          const highlightedText = currentAccount?.type === 'MNEMONIC' ? (isBitcoin ? purposeLevel : coinTypeLevel) : item.accountType.pubkeyStyle;
          const mainCoinTypeText = isBitcoin ? purposeLevel : coinTypeLevel;
          const highlightedRightText =
            currentAccount?.type === 'MNEMONIC'
              ? ` / ${isBitcoin ? `${coinTypeLevel} / ` : ''}${accountLevel} / ${changeLevel} ${indexLevel ? `/ ${indexLevel}` : ''}`
              : '';

          const pubketStyleLabel = (() => {
            if (chain?.chainType === 'bitcoin') {
              return PUBKEY_STYLE_MAP[item.accountType.pubkeyStyle as keyof typeof PUBKEY_STYLE_MAP];
            }

            return `${mainCoinTypeText} TYPE`;
          })();

          return (
            <OutlinedButton key={item.address} isSelected={isSelected} onClick={() => chain && onClickChainType(chain.id, item.accountType)}>
              <ButtonBodyContainer>
                <CoinTypeNameContainer>
                  <CoinTypeNameTextContainer>
                    <Base1300Text variant="b2_M">{pubketStyleLabel}</Base1300Text>
                    &nbsp;
                    {isDefaultAccountType && <DefaultText variant="b2_M">{'(DEFAULT)'}</DefaultText>}
                  </CoinTypeNameTextContainer>

                  {isDefaultAccountType && (
                    <Badge>
                      <Base1300Text variant="c2_B">{'SUGGESTED'}</Base1300Text>
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
                  {highlightedLeftText && (
                    <>
                      <HdPathText variant="h6n_M">{highlightedLeftText}</HdPathText>
                      &nbsp;
                    </>
                  )}
                  <Base1300Text variant="h6n_M">{highlightedText}</Base1300Text>
                  &nbsp;
                  {highlightedRightText && (
                    <>
                      <HdPathText variant="h6n_M">{highlightedRightText}</HdPathText>
                      &nbsp;
                    </>
                  )}
                </HdPathTextContainer>

                <ValueContainer>
                  {item.totalAssetValue &&
                    (equal(item.totalAssetValue, '0') ? (
                      <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference} fixed={0}>
                        {'0'}
                      </BalanceDisplay>
                    ) : (
                      <ValueContainer>
                        <BalanceDisplay typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
                          {item.totalAssetValue}
                        </BalanceDisplay>
                      </ValueContainer>
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
