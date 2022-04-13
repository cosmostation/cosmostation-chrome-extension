import { Typography } from '@mui/material';

import ibcUnauthImg from '~/images/etc/ibcUnauth.png';
import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import { useMarketPriceSWR } from '~/Popup/hooks/SWR/tendermint/useMarketPriceSWR';
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

type ChainItemProps = {
  amount: string;
  decimals?: number;
  baseDenom?: string;
  displayDenom?: string;
  channel?: string;
  imageURL?: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function ChainItem({ disabled, imageURL, amount, decimals = 0, baseDenom, displayDenom, channel, onClick }: ChainItemProps) {
  const { chromeStorage } = useChromeStorage();
  const { data } = useCoinGeckoPriceSWR(true);

  const marketPrice = useMarketPriceSWR(true);

  const chainPrice = marketPrice.data?.find((price) => price.denom === baseDenom)?.prices?.find((price) => price.currency === 'usd')?.current_price || 0;

  const tetherPrice = data?.tether?.[chromeStorage.currency] || 0;

  const displayAmount = toDisplayDenomAmount(amount, decimals);

  const value = times(displayAmount, chainPrice * tetherPrice, 2);

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} defaultImgSrc={ibcUnauthImg} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{displayDenom ? displayDenom.toUpperCase() : 'Unknown'}</Typography>
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
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={chromeStorage.currency} fixed={2}>
              {value}
            </Number>
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}
