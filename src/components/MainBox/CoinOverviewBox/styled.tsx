import { styled } from '@mui/material/styles';

import IconTextButton from '@/components/common/IconTextButton';

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
});

export const BodyContainer = styled('div')({});

export const BodyTopContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  margin: '1.2rem 0 0.2rem',

  columnGap: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const BodyBottomContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',

  marginBottom: '1.4rem',

  color: theme.palette.color.base1000,
}));

export const SymbolButton = styled(IconTextButton)(({ theme }) => ({
  '&.Mui-disabled, &:disabled': {
    color: theme.palette.color.base1300,
  },
  alignItems: 'flex-start',
}));

export const CoingeckoIconContainer = styled('div')({
  width: '2rem',
  height: '2rem',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});
