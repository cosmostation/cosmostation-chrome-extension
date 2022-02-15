import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: 'calc(100% - 2.4rem)',
  height: '100%',

  margin: '0 1.2rem',
});

export const ListContainer = styled('div')({
  marginTop: '0.8rem',

  '& > :nth-of-type(n + 1)': {
    marginTop: '0.8rem',
  },
});
