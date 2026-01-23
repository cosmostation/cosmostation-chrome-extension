import { styled } from '@mui/material/styles';

export const StickyTabPanelContentsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '7.8rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const FilterContainer = styled('div')({
  width: '100%',
});

export const AdCarouselContainer = styled('div')({
  margin: '0.8rem 0 1.1rem',

  overflow: 'hidden',
});
