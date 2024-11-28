import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Body = styled('div')({
  paddingTop: '2.4rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',

  rowGap: '0.6rem',
});

// NOTE Base1300 컴포넌트로 교체필요.
export const DescriptionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const DescriptionSubTitle = styled(Typography)(({ theme }) => ({
  width: '95%',

  color: theme.palette.color.base1000,
}));
