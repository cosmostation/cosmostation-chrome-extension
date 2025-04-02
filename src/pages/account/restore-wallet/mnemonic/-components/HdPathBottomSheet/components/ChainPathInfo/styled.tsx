import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',

  backgroundColor: 'transparent',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  boxSizing: 'border-box',
});

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  textAlign: 'left',
});

export const ChainNameText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,

  marginLeft: '0.6rem',
}));

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  textAlign: 'right',
});

export const RightTextContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'right',
});
