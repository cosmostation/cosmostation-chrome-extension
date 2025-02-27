import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';
import BaseCoinImage from '@/components/common/BaseCoinImage';

export const Container = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const LeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '0.8rem',
});

export const LeftSubContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.2rem',
});

export const RightContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  rowGap: '0.2rem',
});

export const CoinImage = styled(BaseCoinImage)({
  width: '3.2rem',
  height: '3.2rem',
});

export const ChainImage = styled(BaseChainImage)({
  width: '3.2rem',
  height: '3.2rem',
});
