import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import { useCoinGeckoPrice } from '~/Popup/hooks/SWR/useCoinGeckoPrice';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { useCurrentNetwork } from '~/Popup/hooks/useCurrent/useCurrentNetwork';
import { times } from '~/Popup/utils/big';
import { upperCaseFirst } from '~/Popup/utils/common';
import type { Chain } from '~/types/chain';

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
  chainName: string;
  amount: string;
  decimals: number;
  displayDenom: string;
  coinGeckoId?: string;
  imageURL?: string;
};

export default function ChainItem({ chainName, coinGeckoId, imageURL, amount, decimals, displayDenom }: ChainItemProps) {
  const { chromeStorage } = useChromeStorage();
  const { data } = useCoinGeckoPrice();

  const price = (coinGeckoId && data?.[coinGeckoId]?.[chromeStorage.currency]) || 0;

  const cap = (coinGeckoId && data?.[coinGeckoId]?.[`${chromeStorage.currency}_24h_change`]) || 0;

  const upperDisplayDenom = displayDenom.toUpperCase();

  return (
    <StyledButton>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{upperCaseFirst(chainName)}</Typography>
          </LeftTextChainContainer>
          <LeftTextChainAmountContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" fixed={decimals}>
              {amount}
            </Number>{' '}
            <Typography variant="h6n">{upperDisplayDenom}</Typography>
          </LeftTextChainAmountContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={chromeStorage.currency}>
              {coinGeckoId ? times(amount, price, 2) : '0'}
            </Number>
          </RightTextValueContainer>

          <RightTextChangeRateContainer data-color={cap > 0 ? 'green' : cap < 0 ? 'red' : 'grey'}>
            <Typography variant="h6n">{cap > 0 ? '+' : ''}</Typography>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" fixed={2}>
              {String(cap)}
            </Number>
            <Typography variant="h6n">%</Typography>
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}
