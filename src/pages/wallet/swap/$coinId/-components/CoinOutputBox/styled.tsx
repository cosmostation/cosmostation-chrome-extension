import { styled } from '@mui/material/styles';

import Base1300Text from '@/components/common/Base1300Text';

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: '0.6rem',
  boxSizing: 'border-box',
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

export const MinReceivedAmountTextContainer = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.purple500,
}));

type ChevronIconProps = {
  'data-is-open': boolean;
};

export const ChevronIconContainer = styled('div')<ChevronIconProps>(({ ...props }) => ({
  width: '1.2rem',
  height: '1.2rem',
  transform: props['data-is-open'] ? 'rotate(180deg)' : 'rotate(0deg)',

  '& svg': {
    width: '100%',
    height: '100%',
  },
}));

export const SymbolText = styled(Base1300Text)({
  marginRight: '0.2rem',
});

export const BodyBottomContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginBottom: '3.4rem',

  color: theme.palette.color.base1000,
}));

export const RightAlignedInput = styled('input')(({ theme }) => ({
  textAlign: 'right',

  fontFamily: theme.typography.h1n_B.fontFamily,
  fontStyle: theme.typography.h1n_B.fontStyle,
  fontSize: theme.typography.h1n_B.fontSize,
  lineHeight: theme.typography.h1n_B.lineHeight,
  letterSpacing: theme.typography.h1n_B.letterSpacing,

  color: theme.palette.color.base1300,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',

  '&::placeholder': {
    fontFamily: theme.typography.h1n_B.fontFamily,
    fontStyle: theme.typography.h1n_B.fontStyle,
    fontSize: theme.typography.h1n_B.fontSize,
    lineHeight: theme.typography.h1n_B.lineHeight,
    letterSpacing: theme.typography.h1n_B.letterSpacing,

    color: theme.palette.color.base700,
  },
}));
