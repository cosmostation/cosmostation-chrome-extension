import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  cursor: 'pointer',
  border: 0,
  padding: '0 1.3rem 0 0.4rem',

  width: '100%',
  height: '2.8rem',

  display: 'flex',
  alignItems: 'center',

  borderRadius: '0.6rem',

  '&:hover': {
    backgroundColor: theme.colors.base02,
  },
}));

export const ImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  marginRight: '0.4rem',

  '& > svg > path': {
    fill: theme.colors.base05,
  },
}));

export const TextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  color: theme.colors.text01,
}));
