import { styled } from '@mui/material/styles';

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  width: '100%',
  maxHeight: 'calc(100% - 8rem)',

  overflow: 'auto',
});
