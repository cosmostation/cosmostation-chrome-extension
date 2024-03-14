import { useMemo } from 'react';
import { Typography } from '@mui/material';

import Image from '~/Popup/components/common/Image';
import Number from '~/Popup/components/common/Number';
import { useCoinGeckoPriceSWR } from '~/Popup/hooks/SWR/useCoinGeckoPriceSWR';
import { useExtensionStorage } from '~/Popup/hooks/useExtensionStorage';
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
  TextChangeRateContainer,
} from './styled';

type CoinItemProps = {
  amount: string;
  decimals?: number;
  displayDenom?: string;
  imageURL?: string;
  onClick?: () => void;
  disabled?: boolean;
  coinGeckoId?: string;
};

export default function CoinItem({ disabled, imageURL, amount, decimals = 0, displayDenom, onClick, coinGeckoId }: CoinItemProps) {
  const { extensionStorage } = useExtensionStorage();
  const coinGeckoPrice = useCoinGeckoPriceSWR();

  const chainPrice = useMemo(
    () => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[extensionStorage.currency]) || 0,
    [coinGeckoId, coinGeckoPrice.data, extensionStorage.currency],
  );

  const cap = useMemo(
    () => (coinGeckoId && coinGeckoPrice.data?.[coinGeckoId]?.[`${extensionStorage.currency}_24h_change`]) || 0,
    [coinGeckoId, coinGeckoPrice.data, extensionStorage.currency],
  );

  const displayAmount = useMemo(() => toDisplayDenomAmount(amount, decimals), [amount, decimals]);

  const value = useMemo(() => times(displayAmount, chainPrice), [chainPrice, displayAmount]);

  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      <LeftContainer>
        <LeftImageContainer>
          <Image src={imageURL} />
        </LeftImageContainer>
        <LeftTextContainer>
          <LeftTextChainContainer>
            <Typography variant="h5">{displayDenom || 'UNKNOWN'}</Typography>
          </LeftTextChainContainer>
          <LeftTextChainAmountContainer>
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={extensionStorage.currency}>
              {String(chainPrice)}
            </Number>

            <TextChangeRateContainer data-color={cap > 0 ? 'green' : cap < 0 ? 'red' : 'grey'}>
              <Typography variant="h6n">{cap > 0 ? '+' : ''}</Typography>
              <Number typoOfIntegers="h6n" typoOfDecimals="h8n" fixed={2}>
                {String(cap)}
              </Number>
              <Typography variant="h8n">%</Typography>
            </TextChangeRateContainer>
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
            <Number typoOfIntegers="h6n" typoOfDecimals="h8n" currency={extensionStorage.currency}>
              {value}
            </Number>
          </RightTextChangeRateContainer>
        </RightTextContainer>
      </RightContainer>
    </StyledButton>
  );
}
