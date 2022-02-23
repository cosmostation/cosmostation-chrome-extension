import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '1.3rem 1.6rem 0 1.6rem',

  width: 'calc(100% - 3.2rem)',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const LeftContainter = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));
export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: 0,
  margin: 0,
  border: 0,

  cursor: 'pointer',

  '& > svg': {
    fill: theme.colors.base05,
  },
}));
