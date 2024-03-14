import type { ComponentProps } from 'react';
import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useTokenBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { Token } from '~/types/ethereum/common';

import {
  CoinButton,
  CoinLefNameContainer,
  CoinLeftContainer,
  CoinLeftDisplayDenomContainer,
  CoinLeftImageContainer,
  CoinLeftInfoContainer,
  CoinRightAmountContainer,
  CoinRightContainer,
  CoinRightIconContainer,
  CoinRightInfoContainer,
  CoinRightValueContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type CoinItemProps = ComponentProps<typeof CoinButton> & {
  isActive?: boolean;
  token: Token;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ isActive, token, ...remainder }, ref) => {
  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;

  const balance = useBalanceSWR();
  const tokenBalace = useTokenBalanceSWR({ token });

  const isNative = token === null;

  const decimals = useMemo(() => (isNative ? currentEthereumNetwork.decimals : token.decimals), [currentEthereumNetwork.decimals, isNative, token?.decimals]);

  const baseAmount = useMemo(
    () => (isNative ? BigInt(balance.data?.result || '1').toString(10) : BigInt(tokenBalace.data || '0').toString(10)),
    [balance.data?.result, isNative, tokenBalace.data],
  );

  const imageURL = useMemo(
    () => (isNative ? currentEthereumNetwork.tokenImageURL : token.imageURL),
    [currentEthereumNetwork.tokenImageURL, isNative, token?.imageURL],
  );

  const displayDenom = useMemo(
    () => (isNative ? currentEthereumNetwork.displayDenom : token.displayDenom),
    [currentEthereumNetwork.displayDenom, isNative, token?.displayDenom],
  );
  const displayAmount = useMemo(() => toDisplayDenomAmount(baseAmount, decimals), [baseAmount, decimals]);

  const coinGeckoId = useMemo(
    () => (isNative ? currentEthereumNetwork.coinGeckoId : token.coinGeckoId),
    [currentEthereumNetwork.coinGeckoId, isNative, token?.coinGeckoId],
  );

  const coinPrice = useMemo(() => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[currency]) || 0, [coinGeckoId, coinGeckoPrice.data, currency]);

  const coinAmountPrice = useMemo(() => times(displayAmount, coinPrice), [displayAmount, coinPrice]);

  const displayName = useMemo(
    () => (isNative ? currentEthereumNetwork.networkName : token.name?.toUpperCase()),
    [currentEthereumNetwork.networkName, isNative, token?.name],
  );

  return (
    <CoinButton type="button" data-is-active={isActive ? 1 : 0} ref={ref} {...remainder}>
      <CoinLeftContainer>
        <CoinLeftImageContainer>
          <Image src={imageURL} />
        </CoinLeftImageContainer>
        <CoinLeftInfoContainer>
          <CoinLeftDisplayDenomContainer>
            <Typography variant="h5">{displayDenom}</Typography>
          </CoinLeftDisplayDenomContainer>
          <CoinLefNameContainer>
            <Typography variant="h6">{displayName}</Typography>
          </CoinLefNameContainer>
        </CoinLeftInfoContainer>
      </CoinLeftContainer>
      <CoinRightContainer>
        <CoinRightInfoContainer>
          <CoinRightAmountContainer>
            <Tooltip title={displayAmount} placement="top" arrow>
              <div>
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={gt(displayAmount, '0') ? getDisplayMaxDecimals(decimals) : 0}>
                  {displayAmount}
                </Number>
              </div>
            </Tooltip>
          </CoinRightAmountContainer>
          <CoinRightValueContainer>
            <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={2} currency={currency}>
              {coinAmountPrice}
            </Number>
          </CoinRightValueContainer>
        </CoinRightInfoContainer>
        <CoinRightIconContainer> {isActive && <Check16Icon />}</CoinRightIconContainer>
      </CoinRightContainer>
    </CoinButton>
  );
});

export default CoinItem;
