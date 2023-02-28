import { forwardRef } from 'react';
import type { TokenData } from '@0xsquid/sdk';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { times } from '~/Popup/utils/big';
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
  coinInfo: TokenData;
  isActive: boolean;
  onClickCoin: (clickedCoin: TokenData) => void;
};

const CoinItem = forwardRef<HTMLButtonElement, CoinItemProps>(({ coinInfo, onClickCoin, isActive }, ref) => {
  const { chromeStorage } = useChromeStorage();
  const { currency } = chromeStorage;

  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const coinPrice = (coinInfo.coingeckoId && coinGeckoPrice.data?.[coinInfo.coingeckoId]?.[chromeStorage.currency]) || 0;

  // const coinDisplayDenomAmount = toDisplayDenomAmount(coinInfo?.availableAmount || '0', coinInfo.decimals);
  const coinDisplayDenomAmount = '13.31213';

  const coinAmountPrice = times(coinDisplayDenomAmount, coinPrice);
  // FIXME 선택한 토큰 chain Id값 가지고 체인이름 가져오기
  return (
    <CoinButton
      key={coinInfo.address}
      data-is-active={isActive}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickCoin?.(coinInfo);
      }}
    >
      <CoinLeftContainer>
        <CoinLeftImageContainer>
          <Image src={coinInfo.logoURI} />
        </CoinLeftImageContainer>
        <CoinLeftInfoContainer>
          <CoinLeftTitleContainer>
            <Typography variant="h5">{coinInfo.symbol}</Typography>
          </CoinLeftTitleContainer>
          <CoinLeftSubTitleContainer>
            <Typography variant="h6">{coinInfo.name}</Typography>
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
