import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '1.2rem 1.6rem',

  backgroundColor: 'transparent',
  border: 'none',

  '&: hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const LeftContainer = styled('div')({
  width: 'fit-content',

  marginRight: '1.2rem',
});

export const MiddleContainer = styled('div')({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.4rem',
});

export const RightContainer = styled('div')({
  width: 'fit-content',
});
