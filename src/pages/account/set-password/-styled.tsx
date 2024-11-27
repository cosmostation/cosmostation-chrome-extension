import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CautionContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  marginBottom: '2.4rem',
});

export const Container = styled('div')({});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',

  rowGap: '0.6rem',
});

export const DescriptionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const DescriptionSubTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1000,
}));
