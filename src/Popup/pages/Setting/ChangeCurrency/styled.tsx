import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 1.6rem 0',
});

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  width: '100%',
  maxHeight: '100%',

  overflow: 'auto',
});
