import { styled } from '@mui/material/styles';

import BaseChainButton from './ChainButton';
import BaseNetworkButton from './NetworkButton';

export const Container = styled('div')(({ theme }) => ({
  width: 'calc(36rem - 2.4rem)',
  height: '4.8rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '0 1.2rem 0 1.2rem',

  backgroundColor: theme.colors.base01,
}));

export const LeftContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const RightContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

export const NetworkButton = styled(BaseNetworkButton)({
  marginRight: '0.8rem',
});

export const ChainButton = styled(BaseChainButton)({});
