import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';
import BaseCoinImage from '@/components/common/BaseCoinImage';
import { PRICE_TREND_TYPE } from '@/constants/price';
import type { PriceTrendType } from '@/types/price';

export const CoinContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  margin: '1.6rem 0 2.2rem',
});

export const CoinImage = styled(BaseCoinImage)({
  width: '3.6rem',
  height: '3.6rem',
});

export const CoinSymbolText = styled(Base1300Text)({
  marginTop: '0.8rem',
});

export const CoinDenomContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  marginTop: '0.4rem',

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

export const SectionWrapper = styled('div')(({ theme }) => ({
  borderTop: `0.1rem solid ${theme.palette.color.base100}`,
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,

  '&:not(:last-child)': {
    borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
  },
}));

export const SectionContainer = styled('div')(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: `0.1rem solid ${theme.palette.color.base100} `,
  },
  display: 'flex',
  flexDirection: 'column',
  padding: '1.6rem',
}));

export const LabelContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.6rem',
});

export const TitleText = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const EllipsisContainer = styled('div')({
  display: 'flex',

  maxWidth: '100%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const FullContractAddressText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));

export const DetailInfoContainer = styled('div')({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.8rem',

  marginTop: '0.4rem',
});

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const CoingeckoContainer = styled('div')({
  display: 'flex',

  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '0.7rem',
});

export const CoingeckoIconContainer = styled('div')({
  width: '2.4rem',
  height: '2.4rem',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});
