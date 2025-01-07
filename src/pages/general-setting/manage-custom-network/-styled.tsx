import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';

export const Container = styled('div')({
  width: '100%',
});

export const StickyContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',
  position: 'sticky',
  top: '3rem',

  padding: '0.8rem 1.2rem',

  boxSizing: 'border-box',

  zIndex: 1,
  backgroundColor: theme.palette.color.base50,
}));

export const RowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  marginTop: '1rem',
});

export const NetworkCounts = styled('span')(({ theme }) => ({
  color: theme.palette.color.base1000,
}));

export const ButtonWrapper = styled('div')({
  width: '100%',
});

export const ChainImage = styled(BaseChainImage)({
  width: '3.6rem',
  height: '3.6rem',
  marginRight: '-0.6rem',
});
