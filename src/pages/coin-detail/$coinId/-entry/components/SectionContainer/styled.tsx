import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: `0.4rem solid ${theme.palette.color.base100} `,
  },
  display: 'flex',
  flexDirection: 'column',
}));
