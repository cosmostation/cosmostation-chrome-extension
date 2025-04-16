import { styled } from '@mui/material/styles';

import BaseChainImage from '@/components/common/BaseChainImage';

export const TopContainer = styled('div')({
  margin: '1.2rem 0',
});

export const ChainImage = styled(BaseChainImage)({
  width: '3.6rem',
  height: '3.6rem',
});

export const AccountTypeTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});
