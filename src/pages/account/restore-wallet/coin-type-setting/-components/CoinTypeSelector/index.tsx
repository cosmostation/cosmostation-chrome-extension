import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import Base1300Text from '@/components/common/Base1300Text';
import NumberTypo from '@/components/common/NumberTypo';
import { useAccountAllAssets } from '@/hooks/useAccountAllAssets';
import { useCoinGeckoPriceSWR } from '@/hooks/useCoinGeckoPrice';
import type { Chain, ChainAccountType } from '@/types/chain';
import { equal, lt, plus, times, toDisplayDenomAmount } from '@/utils/numbers';
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

// TODO coin-type-setting이 아니라 여기 컴포넌트에서 preferredAccountTyper선언 하고 이 컴포넌트를 하위 컴포넌트로 변경
export default function CoinTypeSelector({ chain, selectedAccountType, accountTypeDetails }: CoinTypeSelectorProps) {
  const { t } = useTranslation();
  const { accounts, currency } = useExtensionStorageStore((state) => state);

  const { data } = useAccountAllAssets();
  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  // FIXME
  const isBitcoin = true;

  const currentAccount = accounts[0];
  const currentAccountIndex = currentAccount.type === 'MNEMONIC' ? currentAccount.index : '0';

  const aggregatedAccountValues = useMemo(() => {
    if (!data) {
      return [];
    }
    const chainType = chain?.chainType;

    if (chainType === 'cosmos') {
      return accountTypeDetails.map((item) => {
        const address = item.address;

        const filteredCosmosAssets = data.cosmosAccountAssets.filter((asset) => asset.address.address === address);
        const filteredCW20Assets = data.cw20AccountAssets.filter((asset) => asset.address.address === address);

        const cosmosValueSum = filteredCosmosAssets.reduce((totalValue, cur) => {
          const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[currency]) || 0;
          const assetValue = times(toDisplayDenomAmount(cur.balance, cur.asset.decimals), assetPrice);
          return plus(totalValue, assetValue);
        }, '0');

        const cw20ValueSum = filteredCW20Assets.reduce((totalValue, cur) => {
          const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[currency]) || 0;
          const assetValue = times(toDisplayDenomAmount(cur.balance, cur.asset.decimals), assetPrice);

          return plus(totalValue, assetValue);
        }, '0');

        const totalAssetValue = plus(cosmosValueSum, cw20ValueSum);

        return {
          address,
          totalAssetValue,
        };
      });
    }

    if (chainType === 'evm') {
      return accountTypeDetails.map((item) => {
        const address = item.address;

        const filteredEVMAssets = data.evmAccountAssets.filter((asset) => asset.address.address === address);
        const filteredERC20Assets = data.erc20AccountAssets.filter((asset) => asset.address.address === address);

        const evmValueSum = filteredEVMAssets.reduce((totalValue, cur) => {
          const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[currency]) || 0;
          const assetValue = times(toDisplayDenomAmount(cur.balance, cur.asset.decimals), assetPrice);

          return plus(totalValue, assetValue);
        }, '0');

        const erc20ValueSum = filteredERC20Assets.reduce((totalValue, cur) => {
          const assetPrice = (cur.asset.coinGeckoId && coinGeckoData?.[cur.asset.coinGeckoId]?.[currency]) || 0;
          const assetValue = times(toDisplayDenomAmount(cur.balance, cur.asset.decimals), assetPrice);

          return plus(totalValue, assetValue);
        }, '0');

        const totalAssetValue = plus(evmValueSum, erc20ValueSum);

        return {
          address,
          totalAssetValue,
        };
      });
    }

    // TODO
    // if(chainType === 'btc')

    return [];
  }, [accountTypeDetails, chain?.chainType, coinGeckoData, currency, data]);

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

          const totalAssetValue = aggregatedAccountValues.find((v) => v.address === item.address)?.totalAssetValue;
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
                  {totalAssetValue &&
                    (equal(totalAssetValue, '0') ? (
                      <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={currency} fixed={0}>
                        {'0'}
                      </NumberTypo>
                    ) : lt(totalAssetValue, '0.001') ? (
                      <ValueContainer>
                        <Typography variant="h5n_M">{'<'}</Typography>
                        &nbsp;
                        <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency="usd">
                          {totalAssetValue}
                        </NumberTypo>
                      </ValueContainer>
                    ) : (
                      <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency="usd">
                        {totalAssetValue}
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
