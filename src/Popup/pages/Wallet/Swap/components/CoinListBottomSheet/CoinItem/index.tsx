import { forwardRef } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Tooltip from '~/Popup/components/common/Tooltip';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';

import {
  ChainButton,
  ChainLeftContainer,
  ChainLeftImageContainer,
  ChainLeftInfoContainer,
  ChainLeftSubTitleContainer,
  ChainLeftTitleContainer,
  ChainRightContainer,
  ChainRightIconContainer,
  ChainRightInfoContainer,
  ChainRightSubTitleContainer,
  ChainRightTitleContainer,
} from './styled';
import type { ChainAssetInfo } from '../../../entry';

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

  const inputChainPrice = (coinInfo.coinGeckoId && coinGeckoPrice.data?.[coinInfo.coinGeckoId]?.[chromeStorage.currency]) || 0;

  const coinDisplayDenomAmount = toDisplayDenomAmount(coinInfo?.availableAmount || '0', coinInfo.decimals);
  const inputCoinAmountPrice = times(coinDisplayDenomAmount, inputChainPrice);

  return (
    <ChainButton
      key={coinInfo.denom}
      data-is-active={isActive}
      ref={isActive ? ref : undefined}
      onClick={() => {
        onClickCoin?.(coinInfo);
      }}
    >
      <ChainLeftContainer>
        <ChainLeftImageContainer>
          <Image src={coinInfo.image} />
        </ChainLeftImageContainer>
        <ChainLeftInfoContainer>
          <ChainLeftTitleContainer>
            <Typography variant="h5">{coinInfo.symbol}</Typography>
          </ChainLeftTitleContainer>
          <ChainLeftSubTitleContainer>
            <Typography variant="h6">{coinInfo.chainName}</Typography>
          </ChainLeftSubTitleContainer>
        </ChainLeftInfoContainer>
      </ChainLeftContainer>
      <ChainRightContainer>
        <ChainRightInfoContainer>
          <ChainRightTitleContainer>
            <Tooltip title={coinDisplayDenomAmount} placement="top" arrow>
              <div>
                <Number typoOfIntegers="h6n" typoOfDecimals="h7n" fixed={coinInfo.decimals}>
                  {coinDisplayDenomAmount}
                </Number>
              </div>
            </Tooltip>
          </ChainRightTitleContainer>
          <ChainRightSubTitleContainer>
            <Number typoOfIntegers="h7n" typoOfDecimals="h8n" fixed={2} currency={currency}>
              {inputCoinAmountPrice}
            </Number>
          </ChainRightSubTitleContainer>
        </ChainRightInfoContainer>
        <ChainRightIconContainer>{isActive && <Check16Icon />}</ChainRightIconContainer>
      </ChainRightContainer>
    </ChainButton>
  );
});
export default CoinItem;
