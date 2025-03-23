import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const TopContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  margin: '1rem 0 0.8rem',

  padding: '0 1.6rem',

  boxSizing: 'border-box',
});

export const TopLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.4rem',
});

export const BodyContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

export const AccountButton = styled('button')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  border: 'none',
  background: 'none',

  cursor: 'pointer',

  padding: '1.3rem 1.6rem',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const AccountLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  columnGap: '1rem',

  marginRight: 'auto',
});

export const AccountRightContainer = styled('div')({});

export const AccountImgContainer = styled('div')({
  width: '2.8rem',
  height: '2.8rem',
});

export const AccountInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',

  rowGap: '0.4rem',
});

export const LastHdPathTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const LastHdPathText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const LastHdPathIndexText = styled('div')(({ theme }) => ({
  color: theme.palette.color.base1000,
}));
