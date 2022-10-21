import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  padding: '0.4rem 1.6rem 1.6rem',

  height: '100%',

  position: 'relative',
});
export const TopContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  position: 'relative',

  // margin: '0.8rem 1.6rem',

  backgroundColor: 'transparent',
});
export const TabContainer = styled('div')({ display: 'flex', justifyContent: 'center' });

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

export const CoinButton = styled('button')(({ theme }) => ({
  backgroundColor: theme.colors.base02,
  border: `0.1rem solid ${theme.colors.base03}`,

  borderRadius: '0.8rem',

  padding: '0.8rem 1.2rem 0.6rem 1.2rem',

  height: '4.8rem',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',
}));

export const CoinLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const CoinLeftImageContainer = styled('div')({
  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const CoinLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
});

export const CoinLeftDisplayDenomContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const CoinLeftAvailableContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

type CoinRightContainerProps = {
  'data-is-active'?: number;
};

export const CoinRightContainer = styled('div')<CoinRightContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg': {
    transform: props['data-is-active'] ? 'rotate(180deg)' : 'none',
    '& > path': {
      stroke: theme.colors.base06,
    },
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

export const MarginTop12Div = styled('div')({
  marginTop: '1.2rem',
});

export const MarginTop16Div = styled('div')({
  marginTop: '1.6rem',
});
