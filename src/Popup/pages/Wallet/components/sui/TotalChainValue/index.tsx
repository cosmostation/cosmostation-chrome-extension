import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { DEVNET } from '~/constants/chain/sui/network/devnet';
import { TESTNET } from '~/constants/chain/sui/network/testnet';
import { SUI } from '~/constants/chain/sui/sui';
import { SUI_COIN } from '~/constants/sui';
import Number from '~/Popup/components/common/Number';
import { useAccounts } from '~/Popup/hooks/SWR/cache/useAccounts';
import { useAmountSWR } from '~/Popup/hooks/SWR/sui/useAmountSWR';
import { useTokenBalanceObjectsSWR } from '~/Popup/hooks/SWR/sui/useTokenBalanceObjectsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAccount } from '~/Popup/hooks/useCurrent/useCurrentAccount';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { SuiNetwork } from '~/types/chain';

import { BodyContainer, Container, HeaderContainer, StyledVisibility, StyledVisibilityOff, VisibilityIconButton } from './styled';

type TotalChainValueProps = {
  network: SuiNetwork;
};

export default function TotalChainValue({ network }: TotalChainValueProps) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { currentAccount } = useCurrentAccount();

  const { showBalance } = extensionStorage;

  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  const accounts = useAccounts();

  const chain = SUI;
  const { networkName, decimals, coinGeckoId } = network;

  const currentAddress = useMemo(
    () => accounts?.data?.find((account) => account.id === currentAccount.id)?.address?.[chain.id] || '',
    [accounts?.data, chain.id, currentAccount.id],
  );

  const { totalAmount } = useAmountSWR({ address: currentAddress, network });

  const { tokenBalanceObjects } = useTokenBalanceObjectsSWR({ address: currentAddress, network });

  const totalCoinAssetsValue = useMemo(() => {
    if ([TESTNET.id, DEVNET.id].includes(network.id)) {
      return '0';
    }

    const coinValue =
      times(toDisplayDenomAmount(totalAmount, decimals), (coinGeckoId && coinGeckoData?.[coinGeckoId]?.[extensionStorage.currency]) || 0) || '0';

    const tokenList = tokenBalanceObjects.filter((item) => item.coinType !== SUI_COIN);

    const tokensValue = tokenList.reduce((acc, token) => {
      const tokenBaseAmount = token.balance;

      const tokenValue = token.decimals
        ? times(
            toDisplayDenomAmount(tokenBaseAmount, token.decimals),
            (token.coinGeckoId && coinGeckoData?.[token.coinGeckoId]?.[extensionStorage.currency]) || 0,
          )
        : '0';

      return plus(acc, tokenValue);
    }, '0');

    return plus(coinValue, tokensValue);
  }, [coinGeckoData, coinGeckoId, decimals, extensionStorage.currency, network.id, tokenBalanceObjects, totalAmount]);

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
