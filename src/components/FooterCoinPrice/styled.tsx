import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { PRICE_TREND_TYPE } from '@/constants/price';
import type { PriceTrendType } from '@/types/price';

import Base1300Text from '../common/Base1300Text';

export const LeftContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.2rem',
});

export const RightArrowIconContainer = styled('div')(({ theme }) => ({
  width: '1.2rem',
  height: '1.2rem',

  marginLeft: ' 0.2rem',
  '& > svg': {
    width: '1.2rem',
    height: '1.2rem',
    fill: theme.palette.color.base800,
    '& >path': {
      fill: theme.palette.color.base800,
    },
  },
}));

export const MarginRightText = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const CoinGecko24Text = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '2rem',
});

export const LineChartContainer = styled('div')({
  width: '9.3rem',
  height: '5.3rem',
});

export const RightPriceContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'center',

  rowGap: '0.2rem',

  color: theme.palette.color.base1300,
}));

type ChangeRateContainerProps = {
  trend: 'upward' | 'downward' | 'unchanged';
  'data-price-trend-color': PriceTrendType;
};

export const ChangeRateContainer = styled('div')<ChangeRateContainerProps>(({ ...props }) => {
  const selectedFillColor = props['data-price-trend-color'] === PRICE_TREND_TYPE.GREEN_UP ? greenUpfillColors : redUpfillColors;

  return {
    display: 'flex',
    alignItems: 'center',

    columnGap: '0.2rem',

    color: selectedFillColor[props['trend']],
  };
});

type ChevronIconProps = {
  trend: 'upward' | 'downward' | 'unchanged';
  'data-price-trend-color': PriceTrendType;
};

const redUpfillColors = {
  upward: 'rgba(235, 77, 103, 1)',
  downward: 'rgba(47, 188, 136, 1)',
  unchanged: 'rgba(128, 128, 128, 1)',
};

const greenUpfillColors = {
  upward: 'rgba(47, 188, 136, 1)',
  downward: 'rgba(235, 77, 103, 1)',
  unchanged: 'rgba(128, 128, 128, 1)',
};

export const ChevronIconContainer = styled('div')<ChevronIconProps>(({ ...props }) => {
  const selectedFillColor = props['data-price-trend-color'] === PRICE_TREND_TYPE.GREEN_UP ? greenUpfillColors : redUpfillColors;
  return {
    width: '1rem',
    height: '1rem',

    '& > svg': {
      width: '100%',
      height: '100%',
      fill: selectedFillColor[props['trend']],

      '& > path': {
        fill: selectedFillColor[props['trend']],
      },
    },

    display: props['trend'] === 'unchanged' ? 'none' : 'block',
  };
});

export const ValueContainer = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
});
