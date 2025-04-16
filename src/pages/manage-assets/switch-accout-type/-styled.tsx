import { styled } from '@mui/material/styles';

export const TopContainer = styled('div')({
  margin: '1.2rem 0',
});

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  columnGap: '0.2rem',
  margin: '0 0.8rem 1.2rem',
});
