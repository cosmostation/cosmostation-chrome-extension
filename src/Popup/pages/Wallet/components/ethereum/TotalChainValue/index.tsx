import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Number from '~/Popup/components/common/Number';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useTokensBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokensBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentEthereumTokens } from '~/Popup/hooks/useCurrent/useCurrentEthereumTokens';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { EthereumNetwork } from '~/types/chain';

import { BodyContainer, Container, HeaderContainer, StyledVisibility, StyledVisibilityOff, VisibilityIconButton } from './styled';

type TotalChainValueProps = {
  network: EthereumNetwork;
};

export default function TotalChainValue({ network }: TotalChainValueProps) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { showBalance } = extensionStorage;

  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  const { data } = useBalanceSWR(network);
  const totalAmount = useMemo(() => BigInt(data?.result || '0').toString(), [data?.result]);

  const { currentEthereumTokens } = useCurrentEthereumTokens(network);
  const tokensBalance = useTokensBalanceSWR({ network, tokens: currentEthereumTokens });

  const { decimals, coinGeckoId, networkName } = network;

  const totalCoinAssetsValue = useMemo(() => {
    const coinValue = times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && coinGeckoData?.[coinGeckoId]?.[extensionStorage.currency]) || '0');

    const tokensValue = currentEthereumTokens.reduce((acc, token) => {
      const foundToken = tokensBalance.data?.find((item) => item.status === 'fulfilled' && isEqualsIgnoringCase(item.value.id, token.address));

      const tokenBaseAmount = foundToken?.status === 'fulfilled' ? foundToken.value.balance : '0';

      const tokenValue = times(
        toDisplayDenomAmount(tokenBaseAmount, token.decimals),
        (token.coinGeckoId && coinGeckoData?.[token.coinGeckoId]?.[extensionStorage.currency]) || 0,
      );

      return plus(acc, tokenValue);
    }, '0');

    return plus(coinValue, tokensValue);
  }, [tokensBalance.data, coinGeckoData, coinGeckoId, currentEthereumTokens, decimals, extensionStorage.currency, totalAmount]);

  return (
    <Container>
      <HeaderContainer>
        <Typography variant="h5">{`Total Value in ${networkName}`}</Typography>
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
