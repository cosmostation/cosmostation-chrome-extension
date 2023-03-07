import { forwardRef } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useTokenBalanceSWR } from '~/Popup/hooks/SWR/1inch/useTokenBalanceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';
import type { IntegratedSwapChain } from '~/types/swap/supportedChain';
import type { IntegratedSwapToken } from '~/types/swap/supportedToken';

import {
  CoinButton,
  CoinLeftContainer,
  CoinLeftImageContainer,
  CoinLeftInfoContainer,
  CoinLeftSubTitleContainer,
  CoinLeftTitleContainer,
  CoinRightContainer,
  CoinRightIconContainer,
  CoinRightInfoContainer,
  CoinRightSubTitleContainer,
  CoinRightTitleContainer,
} from './styled';

import Check16Icon from '~/images/icons/Check16.svg';

type TokenItemProps = {
  tokenInfo: IntegratedSwapToken;
  isActive: boolean;
  onClickToken: (clickedCoin: IntegratedSwapToken) => void;
  currentNetwork?: IntegratedSwapChain;
};

const TokenItem = forwardRef<HTMLButtonElement, TokenItemProps>(({ tokenInfo, onClickToken, isActive, currentNetwork }, ref) => {
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;

  // const currentEthereumToken = useMemo(() => ethereumTokens.find((item) => item.ethereumNetworkId === currentNetworkId), [currentNetworkId, ethereumTokens]);
  // const aaaa = tokenInfo.address === currentEthereumToken?.address

  // FIXME line기준으로 분기처리 해버리기
  const tokenBalance = useTokenBalanceSWR(currentNetwork ? (currentNetwork.line === 'ETHEREUM' ? currentNetwork : undefined) : undefined, tokenInfo);
  const amount = tokenBalance.data || '1000000';
  const coinDisplayDenomAmount = toDisplayDenomAmount(amount, tokenInfo.decimals);

  const coinGeckoPrice = useCoinGeckoPriceSWR();
  // FIXME 여차하면 그냥 가격값은 날려버리자
  const coinPrice = (tokenInfo.coingeckoId && coinGeckoPrice.data?.[tokenInfo.coingeckoId]?.[chromeStorage.currency]) || 0;

  // const coinDisplayDenomAmount = toDisplayDenomAmount(tokenInfo?.availableAmount || '0', tokenInfo.decimals);
  const coinAmountPrice = times(coinDisplayDenomAmount, coinPrice);

  return (
    <CoinButton
      key={tokenInfo.address}
      data-is-active={isActive}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickToken?.(tokenInfo);
      }}
    >
      <CoinLeftContainer>
        <CoinLeftImageContainer>
          <Image src={tokenInfo.logoURI} />
        </CoinLeftImageContainer>
        <CoinLeftInfoContainer>
          <CoinLeftTitleContainer>
            <Typography variant="h5">{tokenInfo.symbol}</Typography>
          </CoinLeftTitleContainer>
          <CoinLeftSubTitleContainer>
            <Typography variant="h6">{tokenInfo.name}</Typography>
          </CoinLeftSubTitleContainer>
        </CoinLeftInfoContainer>
      </CoinLeftContainer>
      <CoinRightContainer>
        <CoinRightInfoContainer>
          <CoinRightTitleContainer>
            <Tooltip title={coinDisplayDenomAmount} placement="top" arrow>
              <div>
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(tokenInfo.decimals)}>
                  {coinDisplayDenomAmount}
                </Number>
              </div>
            </Tooltip>
          </CoinRightTitleContainer>
          <CoinRightSubTitleContainer>
            <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={2} currency={currency}>
              {coinAmountPrice}
            </Number>
          </CoinRightSubTitleContainer>
        </CoinRightInfoContainer>
        <CoinRightIconContainer>{isActive && <Check16Icon />}</CoinRightIconContainer>
      </CoinRightContainer>
    </CoinButton>
  );
});
export default TokenItem;
