import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  rowGap: '1.2rem',
  boxSizing: 'border-box',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
});

export const DateLineContainer = styled('div')({
  marginBottom: '0.6rem',
});

export const TxDetailContainer = styled('div')({
  marginBottom: '1.2rem',
});

export const EmptyAssetContainer = styled('div')({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 0',
});

export const TitleContainer = styled('div')({
  display: 'flex',

  maxWidth: '10rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const IconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  marginRight: '0.2rem',
  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.color.base1000,

    '& > path': {
      fill: theme.palette.color.base1000,
    },
  },
}));
