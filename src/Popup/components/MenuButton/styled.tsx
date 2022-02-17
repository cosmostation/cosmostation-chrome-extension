import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  backgroundColor: theme.colors.base02,

  padding: '0 1.2rem 0 1.6rem',

  width: '100%',
  height: '4.8rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  borderRadius: '0.8rem',

  border: 0,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.colors.base03,
  },
}));

export const LeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const RightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg': {
    fill: theme.colors.base05,
  },
}));
