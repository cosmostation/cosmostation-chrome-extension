import { forwardRef } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import type { ChainAssetInfo } from '~/Popup/pages/Wallet/Swap/entry';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { getDisplayMaxDecimals } from '~/Popup/utils/common';

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

type CoinItemProps = {
  coinInfo: ChainAssetInfo;
  onClickCoin?: (clickedCoin: ChainAssetInfo) => void;
  isActive: boolean;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ coinInfo, onClickCoin, isActive }, ref) => {
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const coinPrice = (coinInfo.coinGeckoId && coinGeckoPrice.data?.[coinInfo.coinGeckoId]?.[chromeStorage.currency]) || 0;

  const coinDisplayDenomAmount = toDisplayDenomAmount(coinInfo?.availableAmount || '0', coinInfo.decimals);
  const coinAmountPrice = times(coinDisplayDenomAmount, coinPrice);

  return (
    <CoinButton
      key={coinInfo.denom}
      data-is-active={isActive}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickCoin?.(coinInfo);
      }}
    >
      <CoinLeftContainer>
        <CoinLeftImageContainer>
          <Image src={coinInfo.image} />
        </CoinLeftImageContainer>
        <CoinLeftInfoContainer>
          <CoinLeftTitleContainer>
            <Typography variant="h5">{coinInfo.symbol}</Typography>
          </CoinLeftTitleContainer>
          <CoinLeftSubTitleContainer>
            <Typography variant="h6">{coinInfo.chainName}</Typography>
          </CoinLeftSubTitleContainer>
        </CoinLeftInfoContainer>
      </CoinLeftContainer>
      <CoinRightContainer>
        <CoinRightInfoContainer>
          <CoinRightTitleContainer>
            <Tooltip title={coinDisplayDenomAmount} placement="top" arrow>
              <div>
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={getDisplayMaxDecimals(coinInfo.decimals)}>
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
export default CoinItem;
