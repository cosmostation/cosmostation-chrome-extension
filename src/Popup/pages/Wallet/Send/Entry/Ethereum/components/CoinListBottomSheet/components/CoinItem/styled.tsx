import { styled } from '@mui/material/styles';

type CoinButtonProps = {
  'data-is-active'?: number;
};

export const CoinButton = styled('button')<CoinButtonProps>(({ theme, ...props }) => ({
  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  border: 0,

  borderRadius: '0.8rem',

  padding: '0.8rem 1.2rem 0.6rem 1.2rem',

  height: '4.8rem',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.colors.base03,
  },
}));

export const CoinLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const CoinLeftImageContainer = styled('div')({
  width: '2.8rem',
  height: '2.8rem',

  '& > img': {
    width: '2.8rem',
    height: '2.8rem',
  },
});

export const CoinLeftInfoContainer = styled('div')({
  marginLeft: '0.6rem',
});

export const CoinLeftDisplayDenomContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const CoinLefNameContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text02,

  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: '15rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const CoinRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg': {
    '& > path': {
      stroke: theme.colors.base06,
      fill: theme.colors.base06,
    },
  },
}));

export const CoinRightInfoContainer = styled('div')({
  marginRight: '0.8rem',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

export const CoinRightAmountContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const CoinRightValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const CoinRightIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  '& > svg': {
    '& > path': {
      fill: theme.colors.base06,
    },
  },
}));
