import { forwardRef, useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/1inch/useTokenBalanceSWR';
import { useBalanceSWR } from '~/Popup/hooks/SWR/ethereum/useBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { gt, times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import { isEqualsIgnoringCase } from '~/Popup/utils/string';
import type { IntegratedSwapEVMChain, IntegratedSwapToken } from '~/types/swap/asset';

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
  currentNetwork?: IntegratedSwapEVMChain;
};

const TokenItem = forwardRef<HTMLButtonElement, TokenItemProps>(({ tokenInfo, onClickToken, isActive, currentNetwork }, ref) => {
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;

  const balance = useBalanceSWR(currentNetwork);
  const tokenBalance = useTokenBalanceSWR(currentNetwork, tokenInfo);

  const amount = useMemo(
    () =>
      tokenInfo.denom
        ? tokenInfo.availableAmount || '0'
        : isEqualsIgnoringCase('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', tokenInfo.address)
        ? BigInt(balance?.data?.result || '0').toString(10)
        : BigInt(tokenBalance.data || '0').toString(10) || '0',
    [balance?.data?.result, tokenBalance.data, tokenInfo.address, tokenInfo.availableAmount, tokenInfo.denom],
  );

  const coinDisplayDenomAmount = toDisplayDenomAmount(amount, gt(amount, 0) ? tokenInfo.decimals : 0);

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const coinPrice = (tokenInfo.coingeckoId && coinGeckoPrice.data?.[tokenInfo.coingeckoId]?.[chromeStorage.currency]) || 0;

  const coinAmountPrice = times(coinDisplayDenomAmount, coinPrice);

  return (
    <TokenButton
      key={tokenInfo.address}
      data-is-active={isActive}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickToken?.(tokenInfo);
      }}
    >
      <TokenLeftContainer>
        <TokenLeftImageContainer>
          <Image src={tokenInfo.logoURI} />
        </TokenLeftImageContainer>
        <TokenLeftInfoContainer>
          <TokenLeftTitleContainer>
            <Typography variant="h5">{tokenInfo.symbol}</Typography>
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
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={coinDisplayDenomAmount === '0' ? 0 : getDisplayMaxDecimals(tokenInfo.decimals)}>
                  {coinDisplayDenomAmount}
                </Number>
              </div>
            </Tooltip>
          </TokenRightTitleContainer>
          {tokenInfo.coingeckoId && (
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