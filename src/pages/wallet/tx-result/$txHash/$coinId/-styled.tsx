import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

export const TxResultContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  rowGap: '0.6rem',
  marginBottom: '1.6rem',
});

export const TxHashTextContainer = styled('div')({
  width: '70%',
  wordBreak: 'break-all',
  textAlign: 'center',
});

export const ExplorerIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',
  marginRight: '0.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base800,
    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));

export const FooterContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  columnGap: '0.4rem',

  marginBottom: '2.8rem',
});
