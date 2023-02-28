import { styled } from '@mui/material/styles';

type CoinButtonProps = {
  'data-is-active'?: boolean;
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

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const CoinLeftTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const CoinLeftSubTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const CoinRightInfoContainer = styled('div')({
  marginRight: '0.8rem',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

export const CoinRightTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const CoinRightSubTitleContainer = styled('div')(({ theme }) => ({
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

export const CoinRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});
