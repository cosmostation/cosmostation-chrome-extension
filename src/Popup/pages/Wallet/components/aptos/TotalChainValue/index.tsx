import { useMemo } from 'react';
import { Typography } from '@mui/material';

import { APTOS_COIN } from '~/constants/aptos';
import { DEVNET } from '~/constants/chain/aptos/network/devnet';
import { TESTNET } from '~/constants/chain/aptos/network/testnet';
import Number from '~/Popup/components/common/Number';
import { useAccountResourceSWR } from '~/Popup/hooks/SWR/aptos/useAccountResourceSWR';
import { useAssetsSWR } from '~/Popup/hooks/SWR/aptos/useAssetsSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentAptosCoins } from '~/Popup/hooks/useCurrent/useCurrentAptosCoins';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { getCoinAddress } from '~/Popup/utils/aptos';
import { plus, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import type { AptosNetwork } from '~/types/chain';

import { BodyContainer, Container, HeaderContainer, StyledVisibility, StyledVisibilityOff, VisibilityIconButton } from './styled';

type TotalChainValueProps = {
  network: AptosNetwork;
};

export default function TotalChainValue({ network }: TotalChainValueProps) {
  const { extensionStorage, setExtensionStorage } = useExtensionStorage();
  const { showBalance } = extensionStorage;

  const { data: coinGeckoData } = useCoinGeckoPriceSWR();

  const { networkName } = network;

  const { currentAptosCoins: currentAptosTokens } = useCurrentAptosCoins(network);
  const { data: aptosCoin } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinStore', resourceTarget: APTOS_COIN, network });
  const { data: aptosInfo } = useAccountResourceSWR({ resourceType: '0x1::coin::CoinInfo', resourceTarget: APTOS_COIN, address: '0x1', network });

  const assets = useAssetsSWR(network);

  const asset = useMemo(() => assets.data.find((item) => item.address === APTOS_COIN), [assets.data]);

  const totalAmount = BigInt(aptosCoin?.data.coin.value || '0').toString();

  const decimals = useMemo(() => aptosInfo?.data.decimals || 0, [aptosInfo?.data.decimals]);

  const price = useMemo(
    () => (asset?.coinGeckoId && coinGeckoData?.[asset.coinGeckoId]?.[extensionStorage.currency]) || 0,
    [asset?.coinGeckoId, extensionStorage.currency, coinGeckoData],
  );

  const totalCoinAssetsValue = useMemo(() => {
    if ([TESTNET.id, DEVNET.id].includes(network.id)) {
      return '0';
    }

    const coinValue = times(toDisplayDenomAmount(totalAmount, decimals), price) || '0';

    const filteredCurrentAptosTokens = currentAptosTokens.filter((item) => !item.type.includes(APTOS_COIN));

    const tokensValue = filteredCurrentAptosTokens.reduce((acc, token) => {
      const tokenBaseAmount = token.data.coin.value;

      const tokenAsset = assets.data.find((item) => item.address === getCoinAddress(token.type));

      const tokenValue = times(
        toDisplayDenomAmount(tokenBaseAmount, tokenAsset?.decimals || 0),
        (tokenAsset?.coinGeckoId && coinGeckoData?.[tokenAsset.coinGeckoId]?.[extensionStorage.currency]) || 0,
      );

      return plus(acc, tokenValue);
    }, '0');

    return plus(coinValue, tokensValue);
  }, [assets.data, coinGeckoData, currentAptosTokens, decimals, extensionStorage.currency, network.id, price, totalAmount]);

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
