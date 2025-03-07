import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  padding: '1.6rem 1.2rem 1.2rem',
  display: 'flex',
  justifyContent: 'flex-start',

  boxSizing: 'border-box',
});

export const TextContainer = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.purple400,
}));
