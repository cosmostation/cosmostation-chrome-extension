import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
});

export const HeaderRightContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',

  columnGap: '0.8rem',
});

export const FilterContaienr = styled('div')({
  marginBottom: '1.2rem',
});

export const CoinButtonWrapper = styled('div')({
  width: '100%',
});

export const StickyContentsContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));
