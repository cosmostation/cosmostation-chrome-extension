import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',

  width: '100%',

  padding: '1.2rem 1.6rem',

  borderRadius: '0.8rem',

  backgroundColor: 'rgba(205, 26, 26, 0.15)',
});

export const ImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',

  '& > svg': {
    fill: theme.accentColors.red,
  },
}));

export const TextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  marginLeft: '0.4rem',
}));
