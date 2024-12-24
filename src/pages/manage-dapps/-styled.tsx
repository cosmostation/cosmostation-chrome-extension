import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
});

export const RowContainer = styled('div')({
  display: 'flex',
  width: '100%',
  margin: '0.8rem 0',
});

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  position: 'sticky',
  top: '3rem',
  zIndex: 1,

  boxSizing: 'border-box',

  padding: '0.8rem 1.2rem',
  backgroundColor: theme.palette.color.base50,
}));

export const Divider = styled('div')(({ theme }) => ({
  width: '100%',
  borderBottom: `0.1rem solid ${theme.palette.color.base100}`,
}));

export const DappItemContainer = styled('div')({
  width: '100%',
});

export const FooterContainer = styled('div')(({ theme }) => ({
  padding: '1.2rem',
  backgroundColor: theme.palette.color.base50,
}));
