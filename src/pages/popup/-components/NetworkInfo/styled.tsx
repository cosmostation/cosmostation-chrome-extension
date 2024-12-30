import { styled } from '@mui/material/styles';

import Image from '@/components/common/Image';

export const Container = styled('div')({
  width: '100%',
  padding: '1.2rem 1.6rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.6rem',
});

export const ChainContainer = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  columnGap: '0.2rem',
});

export const ChainImage = styled(Image)({
  width: '1.8rem',
  height: '1.8rem',
});
