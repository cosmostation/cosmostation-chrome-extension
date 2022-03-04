import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',

  border: `0.1rem solid ${theme.colors.base04}`,
  borderRadius: '1.2rem',

  padding: 0,

  width: '100%',
  height: '11rem',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  cursor: 'pointer',

  '&:hover': {
    borderColor: theme.accentColors.purple01,
  },
}));

export const ImageContainer = styled('div')(({ theme }) => ({
  '& > svg > path': {
    fill: theme.accentColors.purple01,
  },
}));

export const TextContainer = styled('div')(({ theme }) => ({
  marginTop: '0.6rem',
  color: theme.colors.text01,
}));
