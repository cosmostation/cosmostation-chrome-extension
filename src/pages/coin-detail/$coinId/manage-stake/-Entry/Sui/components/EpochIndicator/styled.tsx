import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ItemContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: '0.5rem',
  margin: '1.2rem 0',

  '&:not(:last-child)': {
    borderRight: `0.1rem solid ${theme.palette.color.base200}`,
  },
}));
