import { styled } from '@mui/material/styles';

export const InfoIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',
  '& > svg': {
    width: '100%',
    height: '100%',
    fill: theme.palette.color.base1300,
    '& > path': {
      fill: theme.palette.color.base1300,
    },
  },
}));
