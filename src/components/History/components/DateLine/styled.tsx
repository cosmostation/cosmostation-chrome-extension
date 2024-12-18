import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  padding: '0 1.6rem',
});

export const DateDivider = styled('div')(({ theme }) => ({
  borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
  flexGrow: 1,
}));

export const DateContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.2rem',
  margin: '0 0.8rem',
});

export const DateText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1100,
}));
