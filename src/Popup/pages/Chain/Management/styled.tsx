import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',
});

export const ListContainer = styled('div')({
  '& > :nth-of-type(n + 2)': {
    marginTop: '0.8rem',
  },
});
