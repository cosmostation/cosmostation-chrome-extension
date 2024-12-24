import { styled } from '@mui/material/styles';

export const IconContainer = styled('div')({
  marginLeft: '0.6rem',
});

export const FilterContaienr = styled('div')({
  width: '100%',
  margin: '0.8rem 0 1rem',
});

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

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const CoinButtonWrapper = styled('div')({
  width: '100%',
});
