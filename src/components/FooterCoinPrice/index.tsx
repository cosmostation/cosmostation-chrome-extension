import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';

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
  coin: {
    coinGeckoId: string;
    id: string;
  };
};
export default function FooterCoinPrice({ coin }: FooterCoinPriceProps) {
  console.log('🚀 ~ FooterCoinPrice ~ coin:', coin);

  const { t } = useTranslation();

  const price = '1';

  const cap = 1;

  const trend = cap > 0 ? 'upward' : cap < 0 ? 'downward' : 'unchanged';

  // NOTE example ethereum price data 30days
  const chartData = [
    1000, 1050, 1100, 1200, 1250, 1300, 1350, 1400, 1450, 1500, 1550, 1600, 1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000, 2050, 2100, 2150, 2200, 2250, 2300,
    2350, 2400, 2450, 2500,
  ];

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
            <NumberTypo typoOfIntegers="h5n_M" typoOfDecimals="h7n_R" currency="usd">
              {price}
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
