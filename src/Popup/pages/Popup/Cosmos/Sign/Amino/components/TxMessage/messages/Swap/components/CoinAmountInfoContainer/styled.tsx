import { styled } from '@mui/material/styles';

export const CoinContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  width: '10rem',
});

export const CoinImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',
  '& > img': {
    width: '3.2rem',
    height: '3.2rem',
  },
});

export const CoinInfoContainer = styled('div')({
  marginLeft: '0.8rem',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.1rem',
});

export const CoinTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const CoinSubTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  display: 'flex',

  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: '6rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));