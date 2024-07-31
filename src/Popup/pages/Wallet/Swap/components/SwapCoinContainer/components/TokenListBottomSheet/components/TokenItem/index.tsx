import { forwardRef, useMemo } from 'react';
import { isHexString } from 'ethereumjs-util';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useSpotPriceSWR } from '~/Popup/hooks/SWR/integratedSwap/oneInch/SWR/useSporPriceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useCurrentEthereumNetwork } from '~/Popup/hooks/useCurrent/useCurrentEthereumNetwork';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { IntegratedSwapToken } from '~/types/swap/asset';

import {
  TokenButton,
  TokenLeftContainer,
  TokenLeftImageContainer,
  TokenLeftInfoContainer,
  TokenLeftSubTitleContainer,
  TokenLeftTitleContainer,
  TokenRightContainer,
  TokenRightIconContainer,
  TokenRightInfoContainer,
  TokenRightSubTitleContainer,
  TokenRightTitleContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type TokenItemProps = {
  tokenInfo: IntegratedSwapToken;
  isActive: boolean;
  onClickToken: (clickedToken: IntegratedSwapToken) => void;
};

const TokenItem = forwardRef<HTMLButtonElement, TokenItemProps>(({ tokenInfo, onClickToken, isActive }, ref) => {
  const { currentEthereumNetwork } = useCurrentEthereumNetwork();

  const coinGeckoPrice = useCoinGeckoPriceSWR();
  const { extensionStorage } = useExtensionStorage();
  const { currency } = extensionStorage;

  const spotPriceData = useSpotPriceSWR(isHexString(tokenInfo.tokenAddressOrDenom) ? { chainId: currentEthereumNetwork.chainId, currency } : undefined);

  const amount = useMemo(() => tokenInfo.balance || '0', [tokenInfo.balance]);

  const coinDisplayDenomAmount = useMemo(() => toDisplayDenomAmount(amount, gt(amount, '0') ? tokenInfo.decimals : 0), [amount, tokenInfo.decimals]);

  const coinPrice = useMemo(
    () =>
      (tokenInfo.coinGeckoId && coinGeckoPrice.data?.[tokenInfo.coinGeckoId]?.[extensionStorage.currency]) ||
      spotPriceData.data?.[tokenInfo.tokenAddressOrDenom] ||
      0,
    [coinGeckoPrice.data, extensionStorage.currency, spotPriceData.data, tokenInfo.tokenAddressOrDenom, tokenInfo.coinGeckoId],
  );

  const coinAmountPrice = useMemo(() => times(coinDisplayDenomAmount, coinPrice), [coinDisplayDenomAmount, coinPrice]);

  return (
    <TokenButton
      key={tokenInfo.tokenAddressOrDenom}
      data-is-active={isActive}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickToken?.(tokenInfo);
      }}
    >
      <TokenLeftContainer>
        <TokenLeftImageContainer>
          <Image src={tokenInfo.imageURL} />
        </TokenLeftImageContainer>
        <TokenLeftInfoContainer>
          <TokenLeftTitleContainer>
            <Typography variant="h5">{tokenInfo.displayDenom}</Typography>
          </TokenLeftTitleContainer>
          <TokenLeftSubTitleContainer>
            <Typography variant="h6">{tokenInfo.name}</Typography>
          </TokenLeftSubTitleContainer>
        </TokenLeftInfoContainer>
      </TokenLeftContainer>
      <TokenRightContainer>
        <TokenRightInfoContainer>
          <TokenRightTitleContainer>
            <Tooltip title={coinDisplayDenomAmount} placement="top" arrow>
              <div>
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={gt(coinDisplayDenomAmount, '0') ? getDisplayMaxDecimals(tokenInfo.decimals) : 0}>
                  {coinDisplayDenomAmount}
                </Number>
              </div>
            </Tooltip>
          </TokenRightTitleContainer>
          {gt(coinPrice, '0') && (
            <TokenRightSubTitleContainer>
              <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={2} currency={currency}>
                {coinAmountPrice}
              </Number>
            </TokenRightSubTitleContainer>
          )}
        </TokenRightInfoContainer>
        <TokenRightIconContainer>{isActive && <Check16Icon />}</TokenRightIconContainer>
      </TokenRightContainer>
    </TokenButton>
  );
});
export default TokenItem;
