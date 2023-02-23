import { styled } from '@mui/material/styles';

export const ListContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  width: '100%',

  overflow: 'auto',

  maxHeight: 'calc(100% - 6rem)',
});

export const SideButtonContainer = styled('div')({
  padding: '0',

  display: 'flex',

  columnGap: '1.6rem',
});
