import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  height: '100%',
  padding: '0 0.4rem',
});

export const ContentContainer = styled('div')({
  height: 'calc(100% - 11rem)',
  overflow: 'auto',
});

export const MaxButton = styled('button')(({ theme }) => ({
  padding: '0.4rem 0.8rem',
  border: 0,
  borderRadius: '5rem',

  marginLeft: '0.8rem',

  height: 'max-content',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.accentColors.purple01,
  color: theme.accentColors.white,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.accentColors.purple02,
  },
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const StyledInput = styled(Input)({
  height: '4.8rem',
});

export const StyledTextarea = styled(Input)({});

export const MarginTop8Div = styled('div')({
  marginTop: '0.8rem',
});

export const WarningContainer = styled('div')(({ theme }) => ({
  padding: '2.4rem',
  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',
}));

export const WarningContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '100%',
});

export const WarningTextContainer = styled('div')(({ theme }) => ({
  width: '20rem',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.8rem',
  textAlign: 'center',
  color: theme.colors.text01,
}));

export const ExchangeWarningContainer = styled('div')({
  padding: '1.2rem 1.6rem',
  display: 'flex',
  backgroundColor: 'rgba(205, 26, 26, 0.15)',
  borderRadius: '0.8rem',
});

export const ExchangeWarningTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.accentColors.red,
}));

export const ExchangeWarningIconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.accentColors.red,

    '& > path': {
      fill: theme.accentColors.red,
    },
  },
}));
