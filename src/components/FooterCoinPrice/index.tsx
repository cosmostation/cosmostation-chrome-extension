import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { useCoinGeckoHistory } from '@/hooks/useCoinGeckoHistory';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { useGetAccountAsset } from '@/hooks/useGetAccountAsset';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  ChangeRateContainer,
  ChevronIconContainer,
  CoinGecko24Text,
  LeftContainer,
  LineChartContainer,
  MarginRightText,
  RightArrowIconContainer,
  RightContainer,
  RightPriceContainer,
  ValueContainer,
} from './styled';
import StickyFooter from '../BaseLayout/components/BaseStickyFooter';
import Base1000Text from '../common/Base1000Text';
import LineChart from '../common/LineChart';
import NumberTypo from '../common/NumberTypo';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import RightArrowIcon from '@/assets/images/icons/RightArrow14.svg';
import TopFilledChevronIcon from '@/assets/images/icons/TopFilledChevron8.svg';

type FooterCoinPriceProps = {
  coinId: string;
  onClick?: () => void;
};
export default function FooterCoinPrice({ coinId, onClick }: FooterCoinPriceProps) {
  const { t } = useTranslation();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference, userPriceTrendPreference } = useExtensionStorageStore((state) => state);

  const { getAccountAsset } = useGetAccountAsset({ coinId });
  const currentCoin = getAccountAsset();

  const coinGeckoId = currentCoin?.asset.coinGeckoId;

  const { data: coinGeckoHistory } = useCoinGeckoHistory(coinGeckoId);

  const chainPrice = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[userCurrencyPreference]) || 0;

  const cap = (coinGeckoId && coinGeckoPrice?.[coinGeckoId]?.[`${userCurrencyPreference}_24h_change`]) || 0;

  const trend = cap > 0 ? 'upward' : cap < 0 ? 'downward' : 'unchanged';

  const chartData =
    coinGeckoHistory?.values.data
      .flatMap((item) => {
        return Number(item[0]);
      })
      .reverse() || [];

  return (
    <StickyFooter
      leftContent={
        <LeftContainer>
          <MarginRightText variant="b2_M">{t('components.FooterCoinPrice.index.currentPrice')}</MarginRightText>
          {onClick ? (
            <Base1000Text
              variant="b4_R"
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {t('components.FooterCoinPrice.index.seeDetail')}
              <span>
                <RightArrowIconContainer>
                  <RightArrowIcon />
                </RightArrowIconContainer>
              </span>
            </Base1000Text>
          ) : (
            <CoinGecko24Text variant="b4_R">{t('components.FooterCoinPrice.index.coinGecko24h')}</CoinGecko24Text>
          )}
        </LeftContainer>
      }
      rightContent={
        <RightContainer>
          <LineChartContainer>
            <LineChart lineChartData={chartData} trend={trend} />
          </LineChartContainer>

          <RightPriceContainer>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
              {String(chainPrice)}
            </NumberTypo>

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
          </RightPriceContainer>
        </RightContainer>
      }
      onClick={onClick}
    />
  );
}
