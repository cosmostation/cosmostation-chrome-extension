import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import Skeleton from '~/Popup/components/common/Skeleton';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useChromeStorage } from '~/Popup/hooks/useChromeStorage';
import { times, toDisplayDenomAmount } from '~/Popup/utils/big';
import { upperCaseFirst } from '~/Popup/utils/common';

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
  onClick?: () => void;
};

export default function ChainItem({ chainName, coinGeckoId, imageURL, amount, decimals, displayDenom, onClick }: ChainItemProps) {
  const { chromeStorage } = useChromeStorage();
  const { data } = useCoinGeckoPriceSWR();

  const price = (coinGeckoId && data?.[coinGeckoId]?.[chromeStorage.currency]) || 0;

  const cap = (coinGeckoId && data?.[coinGeckoId]?.[`${chromeStorage.currency}_24h_change`]) || 0;

  const upperDisplayDenom = displayDenom.toUpperCase();

  const displayAmount = toDisplayDenomAmount(amount, decimals);

  const value = times(displayAmount, price);

  return (
    <StyledButton onClick={onClick}>
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
              {displayAmount}
            </Number>{' '}
            <Typography variant="h6n">{upperDisplayDenom}</Typography>
          </LeftTextChainAmountContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Number typoOfIntegers="h5n" typoOfDecimals="h7n" currency={chromeStorage.currency}>
              {value}
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

type ChainItemSkeletonProps = Pick<ChainItemProps, 'chainName' | 'imageURL' | 'onClick'>;

export function ChainItemSkeleton({ chainName, imageURL, onClick }: ChainItemSkeletonProps) {
  return (
    <StyledButton onClick={onClick}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{upperCaseFirst(chainName)}</Typography>
          </LeftTextChainContainer>
          <LeftTextChainAmountContainer>
            <Skeleton variant="text" width={40} sx={{ color: 'red' }} />
          </LeftTextChainAmountContainer>
        </LeftTextContainer>
      </LeftContainer>
      <RightContainer>
        <RightTextContainer>
          <RightTextValueContainer>
            <Skeleton variant="text" width={40} />
          </RightTextValueContainer>

          <RightTextChangeRateContainer>
            <Skeleton variant="text" width={40} />
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}
