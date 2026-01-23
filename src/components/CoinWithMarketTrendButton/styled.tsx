import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import { PRICE_TREND_TYPE } from '@/constants/price';
import type { PriceTrendType } from '@/types/price';

export const ContentsContainer = styled('div')({
  paddingLeft: '1rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.2rem',
});

export const RightChevronIconContainer = styled('div')({
  width: '1.4rem',
  height: '1.4rem',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

export const SymbolConatiner = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.4rem',
});

export const SymbolTextConatiner = styled('div')({
  display: 'flex',

  maxWidth: '20rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const SymbolTypograpy = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const CoinValueContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  columnGap: '0.4rem',

  color: theme.palette.color.base1000,
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
    '& > svg': {
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
