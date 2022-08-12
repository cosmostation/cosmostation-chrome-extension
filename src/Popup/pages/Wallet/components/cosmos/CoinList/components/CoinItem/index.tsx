import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import { useMarketPriceSWR } from '~/Popup/hooks/SWR/cosmos/useMarketPriceSWR';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';

import {
  LeftContainer,
  LeftImageContainer,
  LeftTextChainAmountContainer,
  LeftTextChainContainer,
  LeftTextContainer,
  RightContainer,
  RightTextChangeRateContainer,
  RightTextContainer,
  RightTextValueContainer,
  StyledButton,
} from './styled';

type CoinItemProps = {
  amount: string;
  decimals?: number;
  baseDenom?: string;
  displayDenom?: string;
  channel?: string;
  imageURL?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function CoinItem({ disabled, imageURL, amount, decimals = 0, baseDenom, displayDenom, channel, onClick }: CoinItemProps) {
  const { chromeStorage } = useChromeStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const marketPrice = useMarketPriceSWR();

  const chainPrice = marketPrice.data?.find((price) => price.denom === baseDenom)?.prices?.find((price) => price.currency === 'usd')?.current_price || 0;

  const tetherPrice = coinGeckoPrice.data?.tether?.[chromeStorage.currency] || 0;

  const displayAmount = toDisplayDenomAmount(amount, decimals);

  const value = times(displayAmount, chainPrice * tetherPrice);

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{displayDenom || 'Unknown'}</Typography>
          </LeftTextChainContainer>
          <LeftTextChainAmountContainer>
            <Typography variant="h6">{channel}</Typography>
          </LeftTextChainAmountContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n">
              {displayAmount}
            </Number>
          </RightTextValueContainer>

          <RightTextChangeRateContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={chromeStorage.currency}>
              {value}
            </Number>
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}
