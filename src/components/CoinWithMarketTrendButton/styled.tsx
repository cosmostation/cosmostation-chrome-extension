import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

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
  width: '0.8rem',
  height: '0.8rem',

  '& > svg': {
    width: '100%',
    height: '100%',
    fill: fillColors[props['trend']],

    '& > path': {
      fill: fillColors[props['trend']],
    },
  },

  display: props['trend'] === 'unchanged' ? 'none' : 'block',
}));

export const ValueContainer = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
});
