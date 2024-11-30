import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import Base1300Text from '../common/Base1300Text';

export const LeftContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

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
  trend?: 'upward' | 'downward' | 'unchanged';
};

export const ChangeRateContainer = styled('div')<ChangeRateContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.2rem',

  color: props['trend'] === 'downward' ? 'rgba(231, 69, 95, 1)' : props['trend'] === 'upward' ? 'rgba(47, 190, 136, 1)' : theme.palette.color.base1000,
}));

type ChevronIconProps = {
  trend: 'upward' | 'downward' | 'unchanged';
};

const fillColors = {
  upward: 'rgba(47, 190, 136, 1)',
  downward: 'rgba(231, 69, 95, 1)',
  unchanged: 'rgba(128, 128, 128, 1)',
};

export const ChevronIconContainer = styled('div')<ChevronIconProps>(({ ...props }) => ({
  width: '1rem',
  height: '1rem',

  '& > svg': {
    width: '100%',
    height: '100%',
    fill: fillColors[props['trend']],

    '& > path': {
      fill: fillColors[props['trend']],
    },
  },

  display: props['trend'] === 'unchanged' ? 'none' : 'block',

  transform: props['trend'] === 'upward' ? 'rotate(180deg)' : 'rotate(0deg)',
}));

export const ValueContainer = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
});
