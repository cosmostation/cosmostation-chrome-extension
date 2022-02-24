import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: 'calc(100% - 2.4rem)',
  height: 'calc(100% - 0.8rem)',

  padding: '0.8rem 1.2rem 0',
});

export const ListContainer = styled('div')({
  '& > :nth-of-type(n + 2)': {
    marginTop: '0.8rem',
  },
});
