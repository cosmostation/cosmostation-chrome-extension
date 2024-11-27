import { Typography } from '@mui/material';

import NumberTypo from '@/components/common/NumberTypo';

import { ChangeRateContainer, ChevronIconContainer, CoinValueContainer, ContentsContainer, SymbolTypograpy, ValueContainer } from './styled';
import type { BaseCoinButtonProps } from '../common/BaseCoinButton';
import BaseCoinButton from '../common/BaseCoinButton';
import type { BaseCoinImageProps } from '../common/BaseCoinImage';
import BaseCoinImage from '../common/BaseCoinImage';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';

type CoinWithMarketTrendButtonProps = BaseCoinButtonProps & {
  coinImageProps: BaseCoinImageProps;
};

export default function CoinWithMarketTrendButton({ symbol, coinImageProps, ...remainder }: CoinWithMarketTrendButtonProps) {
  const { baseAmount } = remainder;

  const cap = 99999;

  const trend = cap > 0 ? 'upward' : cap < 0 ? 'downward' : 'unchanged';

  const coinSymbol = symbol || 'UNKNOWN';

  return (
    <BaseCoinButton
      leftComponent={
        <>
          <BaseCoinImage {...coinImageProps} />
          <ContentsContainer>
            <SymbolTypograpy variant="b2_M">{coinSymbol}</SymbolTypograpy>
            <CoinValueContainer>
              <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency="usd">
                {baseAmount}
              </NumberTypo>
              <ChangeRateContainer trend={trend}>
                <ChevronIconContainer trend={trend}>
                  <BottomFilledChevronIcon />
                </ChevronIconContainer>
                <ValueContainer>
                  <NumberTypo typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" fixed={2}>
                    {String(Math.abs(cap))}
                  </NumberTypo>
                  &nbsp;
                  <Typography variant="h8n_R">%</Typography>
                </ValueContainer>
              </ChangeRateContainer>
            </CoinValueContainer>
          </ContentsContainer>
        </>
      }
      {...remainder}
    />
  );
}
