import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAmountSWR } from '~/Popup/hooks/SWR/cosmos/useAmountSWR';
import { useCoinListSWR } from '~/Popup/hooks/SWR/cosmos/useCoinListSWR';
import { useTokensBalanceSWR } from '~/Popup/hooks/SWR/cosmos/useTokensBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useCurrentCosmosTokens } from '~/Popup/hooks/useCurrent/useCurrentCosmosTokens';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { CosmosChain } from '~/types/chain';

import { BodyContainer, Container, HeaderContainer, StyledVisibility, StyledVisibilityOff, VisibilityIconButton } from './styled';

type TotalChainValueProps = {
  chain: CosmosChain;
};

export default function TotalChainValue({ chain }: TotalChainValueProps) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { data } = useCoinGeckoPriceSWR();
  const { currentAccount } = useCurrentAccount();

  const accounts = useAccounts();

  const { totalAmount } = useAmountSWR(chain);
  const { coins, ibcCoins } = useCoinListSWR(chain);
  const { currentCosmosTokens } = useCurrentCosmosTokens(chain);

  const { showBalance } = extensionStorage;

  const address = useMemo(
    () => accounts.data?.find((item) => item.id === currentAccount.id)?.address[chain.id] || '',
    [accounts.data, chain.id, currentAccount.id],
  );

  const cosmosTokensBalance = useTokensBalanceSWR({ chain, contractAddresses: currentCosmosTokens.map((item) => item.address), address });

  const totalCoinAssetsValue = useMemo(() => {
    const coinValue = times(
      toDisplayDenomAmount(totalAmount, chain.decimals),
      (chain.coinGeckoId && data?.[chain.coinGeckoId]?.[extensionStorage.currency]) || 0,
    );

    const nativeCoinsValue = coins.reduce((acc: string, coin) => {
      const nativeCoinValue = times(
        toDisplayDenomAmount(coin.availableAmount, coin.decimals),
        (coin.coinGeckoId && data?.[coin.coinGeckoId]?.[extensionStorage.currency]) || 0,
      );

      return plus(acc, nativeCoinValue);
    }, '0');

    const ibcCoinsValue = ibcCoins.reduce((acc: string, ibcCoin) => {
      const ibcCoinValue = times(
        toDisplayDenomAmount(ibcCoin.availableAmount, ibcCoin.decimals),
        (ibcCoin.coinGeckoId && data?.[ibcCoin.coinGeckoId]?.[extensionStorage.currency]) || 0,
      );

      return plus(acc, ibcCoinValue);
    }, '0');

    const tokensValue = currentCosmosTokens.reduce((acc: string, token) => {
      const tokenBaseAmount = cosmosTokensBalance.data.find((item) => isEqualsIgnoringCase(item.contractAddress, token.address))?.balance || '0';

      const tokenValue = times(
        toDisplayDenomAmount(tokenBaseAmount, token.decimals),
        (token.coinGeckoId && data?.[token.coinGeckoId]?.[extensionStorage.currency]) || 0,
      );
      return plus(acc, tokenValue);
    }, '0');

    const summedValue = [coinValue, nativeCoinsValue, ibcCoinsValue, tokensValue].reduce((acc, value) => plus(acc, value), '0');

    return summedValue;
  }, [chain.coinGeckoId, chain.decimals, coins, cosmosTokensBalance.data, currentCosmosTokens, data, extensionStorage.currency, ibcCoins, totalAmount]);

  return (
    <Container>
      <HeaderContainer>
        <Typography variant="h5">{`Total Value in ${chain.chainName}`}</Typography>
      </HeaderContainer>
      <BodyContainer>
        {showBalance ? (
          <Number typoOfIntegers="h1n" typoOfDecimals="h2n" currency={extensionStorage.currency}>
            {totalCoinAssetsValue}
          </Number>
        ) : (
          <Typography
            variant="h1"
            style={{
              height: '2.5rem',
            }}
          >
            ****
          </Typography>
        )}

        <VisibilityIconButton
          onClick={() => {
            void setExtensionStorage('showBalance', !showBalance);
          }}
        >
          {showBalance ? <StyledVisibility /> : <StyledVisibilityOff />}
        </VisibilityIconButton>
      </BodyContainer>
    </Container>
  );
}
