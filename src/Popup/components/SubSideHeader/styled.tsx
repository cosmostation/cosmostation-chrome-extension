import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  position: 'relative',

  margin: '0 0 1.6rem',

  backgroundColor: 'transparent',
});

export const TextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  height: '2.8rem',

  color: theme.colors.text01,
}));

export const BackButton = styled('button')(({ theme }) => ({
  width: '2.8rem',
  height: '2.8rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  backgroundColor: theme.colors.base03,

  borderRadius: '50%',

  border: 0,
  margin: 0,

  cursor: 'pointer',

  '& svg': {
    fill: theme.colors.base06,
  },
}));
