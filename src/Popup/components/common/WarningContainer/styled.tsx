import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '1.2rem 1.6rem',
  display: 'flex',
  backgroundColor: 'rgba(205, 26, 26, 0.15)',
  borderRadius: '0.8rem',
});

export const TextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.accentColors.red,
}));

export const IconContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    fill: theme.accentColors.red,

    '& > path': {
      fill: theme.accentColors.red,
    },
  },
}));
