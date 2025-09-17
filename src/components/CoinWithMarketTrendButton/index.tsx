import { Typography } from '@mui/material';

import NumberTypo from '@/components/common/NumberTypo';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  ChangeRateContainer,
  ChevronIconContainer,
  CoinValueContainer,
  ContentsContainer,
  SymbolConatiner,
  SymbolTextConatiner,
  SymbolTypograpy,
  ValueContainer,
} from './styled';
import BalanceDisplay from '../BalanceDisplay';
import BalanceSyncStatusIcon from '../BalanceSyncStatusIcon';
import type { BaseCoinButtonProps } from '../common/BaseCoinButton';
import BaseCoinButton from '../common/BaseCoinButton';
import type { BaseCoinImageProps } from '../common/BaseCoinImage';
import BaseCoinImage from '../common/BaseCoinImage';

import BottomFilledChevronIcon from '@/assets/images/icons/BoffomFilledChevron8.svg';
import TopFilledChevronIcon from '@/assets/images/icons/TopFilledChevron8.svg';

type CoinWithMarketTrendButtonProps = BaseCoinButtonProps & {
  coinImageProps: BaseCoinImageProps;
};

export default function CoinWithMarketTrendButton({ symbol, coinImageProps, ...remainder }: CoinWithMarketTrendButtonProps) {
  const { coinGeckoId, fetchStatus } = remainder;
  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference, userPriceTrendPreference } = useExtensionStorageStore((state) => state);

  const cap = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[`${userCurrencyPreference}_24h_change`]) || 0;

  const trend = cap > 0 ? 'upward' : cap < 0 ? 'downward' : 'unchanged';

  const coinSymbol = symbol || 'UNKNOWN';
  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  return (
    <BaseCoinButton
      leftComponent={
        <>
          <BaseCoinImage {...coinImageProps} />
          <ContentsContainer>
            <SymbolConatiner>
              <SymbolTextConatiner>
                <SymbolTypograpy variant="b2_M">{coinSymbol}</SymbolTypograpy>
              </SymbolTextConatiner>
              <BalanceSyncStatusIcon fetchStatus={fetchStatus} />
            </SymbolConatiner>
            <CoinValueContainer>
              <BalanceDisplay typoOfIntegers="h6n_M" typoOfDecimals="h8n_R" currency={userCurrencyPreference} isDisableHidden>
                {String(chainPrice)}
              </BalanceDisplay>
              <ChangeRateContainer trend={trend} data-price-trend-color={userPriceTrendPreference}>
                <ChevronIconContainer trend={trend} data-price-trend-color={userPriceTrendPreference}>
                  {trend === 'downward' ? <BottomFilledChevronIcon /> : <TopFilledChevronIcon />}
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
