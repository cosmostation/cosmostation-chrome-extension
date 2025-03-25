import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

import { useAccountAssets } from '@/hooks/useAccountAssets';
import { useCoinGeckoHistory } from '@/hooks/useCoinGeckoHistory';
import { useCoinGeckoPrice } from '@/hooks/useCoinGeckoPrice';
import { getCoinId } from '@/utils/queryParamGenerator';
import { useExtensionStorageStore } from '@/zustand/hooks/useExtensionStorageStore';

import {
  ChangeRateContainer,
  ChevronIconContainer,
  CoinGecko24Text,
  LeftContainer,
  LineChartContainer,
  MarginRightText,
  RightChevronIconContainer,
  RightContainer,
  RightPriceContainer,
  ValueContainer,
} from './styled';
import StickyFooter from '../BaseLayout/components/BaseStickyFooter';
import IconTextButton from '../common/IconTextButton';
import LineChart from '../common/LineChart';
import NumberTypo from '../common/NumberTypo';

import BottomFilledChevronIcon from '@/assets/images/icons/BottomFilledChevron14.svg';
import RightChevronIcon from '@/assets/images/icons/RightChevron20.svg';

type FooterCoinPriceProps = {
  coinId: string;
};
export default function FooterCoinPrice({ coinId }: FooterCoinPriceProps) {
  const { t } = useTranslation();

  const { data: coinGeckoPrice } = useCoinGeckoPrice();
  const { userCurrencyPreference } = useExtensionStorageStore((state) => state);
  const { data } = useAccountAssets();

  const currentCoin = data?.flatAccountAssets.find(({ asset }) => getCoinId(asset) === coinId);
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
          <IconTextButton
            trailingIcon={
              <RightChevronIconContainer>
                <RightChevronIcon />
              </RightChevronIconContainer>
            }
          >
            <MarginRightText variant="b2_M">{t('components.FooterCoinPrice.index.currentPrice')}</MarginRightText>
          </IconTextButton>
          <CoinGecko24Text variant="b4_R">{t('components.FooterCoinPrice.index.coinGecko24h')}</CoinGecko24Text>
        </LeftContainer>
      }
      rightContent={
        <RightContainer>
          <LineChartContainer>
            <LineChart lineChartData={chartData} />
          </LineChartContainer>

          <RightPriceContainer>
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency={userCurrencyPreference}>
              {String(chainPrice)}
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
          </RightPriceContainer>
        </RightContainer>
      }
    />
  );
}
