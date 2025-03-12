import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';

export const Container = styled('div')({
  width: '100%',
  padding: '1.2rem 1.6rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.6rem',

  boxSizing: 'border-box',
});

export const ChainContainer = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  columnGap: '0.2rem',
});

export const ChainImage = styled(BaseChainImage)({
  width: '1.8rem',
  height: '1.8rem',
});
